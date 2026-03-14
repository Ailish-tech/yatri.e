import type { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Map service types to Google Places API types
const serviceTypeMap: Record<string, string> = {
  taxi: 'taxi_stand',
  hotel: 'lodging',
  hospital: 'hospital',
  pharmacy: 'pharmacy',
  police: 'police',
};

function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): string {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { latitude, longitude, type } = req.query;

  if (!latitude || !longitude || !type) {
    return res.status(400).json({ error: 'latitude, longitude, and type are required' });
  }

  const googleType = serviceTypeMap[type as string];
  if (!googleType) {
    return res.status(400).json({
      error: `Invalid type. Must be one of: ${Object.keys(serviceTypeMap).join(', ')}`,
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${googleType}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[NearbyServices API] Google Places error:', data.status);
      return res.status(500).json({ error: 'Google Places API error', status: data.status });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    const services = (data.results || []).slice(0, 15).map((place: any, index: number) => {
      const pLat = place.geometry?.location?.lat;
      const pLng = place.geometry?.location?.lng;

      // Get photo URL if available
      let photoUrl: string | undefined;
      if (place.photos && place.photos.length > 0) {
        const photoRef = place.photos[0].photo_reference;
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
      }

      return {
        id: place.place_id || `service-${index}`,
        type: type as string,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        rating: place.rating,
        latitude: pLat,
        longitude: pLng,
        distance: pLat && pLng ? calculateDistance(lat, lng, pLat, pLng) : 'N/A',
        isOpen: place.opening_hours?.open_now,
        photoUrl,
        iconUrl: place.icon,
      };
    });

    // Sort by distance
    services.sort((a: any, b: any) => {
      const distA = parseFloat(a.distance) || 999;
      const distB = parseFloat(b.distance) || 999;
      return distA - distB;
    });

    return res.status(200).json({ services });
  } catch (error: any) {
    console.error('[NearbyServices API] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch nearby services', details: error.message });
  }
}
