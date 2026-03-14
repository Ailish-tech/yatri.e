import type { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude, userId, contacts } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  try {
    // Find nearest police station using Google Places
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=10000&type=police&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    let nearestStation = null;

    if (data.results && data.results.length > 0) {
      const station = data.results[0];
      const sLat = station.geometry?.location?.lat;
      const sLng = station.geometry?.location?.lng;

      // Calculate distance
      const R = 6371;
      const dLat = ((sLat - latitude) * Math.PI) / 180;
      const dLng = ((sLng - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
        Math.cos((sLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      nearestStation = {
        name: station.name,
        address: station.vicinity || station.formatted_address || '',
        phone: station.formatted_phone_number || null,
        latitude: sLat,
        longitude: sLng,
        distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
      };
    }

    // Create SOS event record
    const eventId = `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // In a production app, you would:
    // 1. Store this event in a database
    // 2. Send SMS to emergency contacts via Twilio or similar
    // 3. Possibly alert the nearest police station via their API
    // For now, we return the data and the mobile app handles SMS via expo-linking

    const sosEvent = {
      eventId,
      timestamp: new Date().toISOString(),
      location: { latitude, longitude },
      userId: userId || 'anonymous',
      contactsToNotify: contacts || [],
      nearestStation,
      smsTemplate: nearestStation
        ? `🚨 EMERGENCY SOS - I need help! My location: https://maps.google.com/?q=${latitude},${longitude} Nearest police: ${nearestStation.name} (${nearestStation.distance})`
        : `🚨 EMERGENCY SOS - I need help! My location: https://maps.google.com/?q=${latitude},${longitude}`,
    };

    console.log(`[Emergency API] SOS triggered - Event: ${eventId}, Location: ${latitude},${longitude}`);

    return res.status(200).json(sosEvent);
  } catch (error: any) {
    console.error('[Emergency API] Error:', error);
    return res.status(500).json({ error: 'Failed to process emergency', details: error.message });
  }
}
