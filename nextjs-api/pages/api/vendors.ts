import type { NextApiRequest, NextApiResponse } from 'next';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// In-memory vendor storage (in production, use Firebase/Firestore)
const vendors: any[] = [];

// Map vendor categories to Google Places types for discovery
const categoryToPlaceType: Record<string, string> = {
  food: 'restaurant',
  crafts: 'store',
  tours: 'travel_agency',
  transport: 'car_rental',
  accommodation: 'lodging',
  other: 'point_of_interest',
};

function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): string {
  const R = 6371;
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
  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance.toFixed(1)}km`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - List vendors near location
  if (req.method === 'GET') {
    const { latitude, longitude, category } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    try {
      // Combine registered vendors with Google Places local businesses
      const googleType = category ? categoryToPlaceType[category as string] || 'point_of_interest' : 'point_of_interest';

      const keyword = category === 'crafts' ? 'souvenir|artisan|craft' :
                       category === 'tours' ? 'tour|guide|excursion' :
                       category === 'food' ? 'local+food|street+food' : '';

      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${googleType}&key=${GOOGLE_API_KEY}`;
      if (keyword) url += `&keyword=${keyword}`;

      const response = await fetch(url);
      const data = await response.json();

      const googleVendors = (data.results || []).slice(0, 15).map((place: any, index: number) => {
        const pLat = place.geometry?.location?.lat;
        const pLng = place.geometry?.location?.lng;

        let photoUrl: string | undefined;
        if (place.photos && place.photos.length > 0) {
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`;
        }

        return {
          id: place.place_id || `vendor-g-${index}`,
          name: place.name,
          category: (category as string) || 'other',
          description: place.vicinity || '',
          phone: '',
          address: place.vicinity || place.formatted_address || '',
          latitude: pLat,
          longitude: pLng,
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          photoUrl,
          products: [],
          isVerified: false,
          distance: pLat && pLng ? calculateDistance(lat, lng, pLat, pLng) : 'N/A',
          createdAt: new Date().toISOString(),
        };
      });

      // Also include any manually registered vendors
      const registeredVendors = vendors
        .filter(v => !category || v.category === category)
        .map(v => ({
          ...v,
          distance: calculateDistance(lat, lng, v.latitude, v.longitude),
        }));

      const allVendors = [...registeredVendors, ...googleVendors];

      // Sort by distance
      allVendors.sort((a: any, b: any) => {
        const distA = parseFloat(a.distance) || 999;
        const distB = parseFloat(b.distance) || 999;
        return distA - distB;
      });

      return res.status(200).json({ vendors: allVendors });
    } catch (error: any) {
      console.error('[Vendors API] Error:', error);
      return res.status(500).json({ error: 'Failed to fetch vendors', details: error.message });
    }
  }

  // POST - Register a new vendor
  if (req.method === 'POST') {
    const { name, category, description, phone, email, address, latitude, longitude, products } = req.body;

    if (!name || !category || !phone || !latitude || !longitude) {
      return res.status(400).json({
        error: 'name, category, phone, latitude, and longitude are required'
      });
    }

    const newVendor = {
      id: `vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      description: description || '',
      phone,
      email: email || '',
      address: address || '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      rating: 0,
      reviewCount: 0,
      photoUrl: null,
      products: products || [],
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    vendors.push(newVendor);

    console.log(`[Vendors API] New vendor registered: ${name} (${category})`);

    return res.status(201).json(newVendor);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
