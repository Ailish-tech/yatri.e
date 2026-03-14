import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { placeId, placeName } = req.query;

  if (!placeId) {
    return res.status(400).json({ error: 'placeId is required' });
  }

  try {
    // Use OpenAI to estimate crowd levels since Google Popular Times
    // requires the Places Details API which may not be available
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a crowd estimation expert. Given a place, estimate its current crowd level based on typical patterns for this type of location, day of week, and time. Return a JSON object:
{
  "placeId": "<the place id>",
  "placeName": "<name of the place>",
  "currentLevel": <1-5 integer>,
  "label": "Empty" | "Not Busy" | "Moderate" | "Busy" | "Very Crowded",
  "peakHours": ["<HH:MM-HH:MM>", ...],
  "lastUpdated": "<ISO timestamp>"
}
Levels: 1=Empty, 2=Not Busy, 3=Moderate, 4=Busy, 5=Very Crowded. Consider current day and time patterns.`
        },
        {
          role: 'user',
          content: `Estimate crowd level for place: ${placeName || placeId}. Current time: ${new Date().toISOString()}, Day: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const crowdData = JSON.parse(content);

    // Ensure correct placeId and timestamp
    crowdData.placeId = placeId;
    crowdData.lastUpdated = new Date().toISOString();

    return res.status(200).json(crowdData);
  } catch (error: any) {
    console.error('[CrowdLevel API] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch crowd data', details: error.message });
  }
}
