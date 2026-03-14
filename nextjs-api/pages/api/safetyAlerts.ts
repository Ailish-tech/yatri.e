import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  try {
    // Use OpenAI to generate safety assessment based on location
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a travel safety expert. Given GPS coordinates, provide a safety assessment for tourists visiting that area. Return a JSON object with this EXACT structure:
{
  "overallRisk": "low" | "medium" | "high" | "critical",
  "riskScore": <number 1-100>,
  "areaName": "<name of the area/neighborhood>",
  "emergencyNumber": "<local emergency number>",
  "alerts": [
    {
      "id": "<unique-id>",
      "category": "theft" | "scam" | "assault" | "natural_disaster" | "traffic" | "health" | "political" | "general",
      "severity": "low" | "medium" | "high" | "critical",
      "title": "<short alert title>",
      "description": "<detailed description>",
      "tip": "<practical safety tip>"
    }
  ],
  "tips": ["<general safety tip 1>", "<general safety tip 2>", ...]
}
Provide realistic, helpful safety information. Include 2-5 relevant alerts and 3-5 general tips. Base the assessment on known characteristics of the region.`
        },
        {
          role: 'user',
          content: `Provide a tourist safety assessment for coordinates: latitude ${latitude}, longitude ${longitude}`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    const safetyReport = JSON.parse(content);

    // Add timestamps to alerts
    const now = new Date().toISOString();
    if (safetyReport.alerts) {
      safetyReport.alerts = safetyReport.alerts.map((alert: any, index: number) => ({
        ...alert,
        id: alert.id || `alert-${Date.now()}-${index}`,
        createdAt: now,
        location: {
          latitude: parseFloat(latitude as string),
          longitude: parseFloat(longitude as string),
          areaName: safetyReport.areaName,
        }
      }));
    }

    return res.status(200).json(safetyReport);
  } catch (error: any) {
    console.error('[SafetyAlerts API] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch safety data', details: error.message });
  }
}
