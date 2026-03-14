import { API_URL } from '../config';
import {
  AreaSafetyReport,
  CrowdLevel,
  NearbyService,
  PoliceStation,
  ServiceType,
  Vendor,
  VendorCategory,
} from '../../@types/SafetyTypes';

/**
 * Fetch safety alerts and risk assessment for a location
 */
export async function fetchSafetyAlerts(
  latitude: number,
  longitude: number
): Promise<AreaSafetyReport> {
  try {
    const response = await fetch(
      `${API_URL}/safetyAlerts?latitude=${latitude}&longitude=${longitude}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Safety API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[SafetyService] Error fetching safety alerts:', error);
    throw error;
  }
}

/**
 * Fetch crowd level / busyness for a specific place
 */
export async function fetchCrowdLevel(
  placeId: string,
  placeName?: string
): Promise<CrowdLevel> {
  try {
    const params = new URLSearchParams({ placeId });
    if (placeName) params.append('placeName', placeName);

    const response = await fetch(`${API_URL}/crowdLevel?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Crowd API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[SafetyService] Error fetching crowd level:', error);
    throw error;
  }
}

/**
 * Trigger SOS emergency - find nearest police station
 */
export async function triggerSOS(
  latitude: number,
  longitude: number,
  userId: string,
  contacts: { name: string; phone: string }[]
): Promise<{ nearestStation: PoliceStation; eventId: string }> {
  try {
    const response = await fetch(`${API_URL}/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, userId, contacts }),
    });

    if (!response.ok) {
      throw new Error(`Emergency API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[SafetyService] Error triggering SOS:', error);
    throw error;
  }
}

/**
 * Fetch nearby services (taxi, hotel, hospital, pharmacy, police)
 */
export async function fetchNearbyServices(
  latitude: number,
  longitude: number,
  type: ServiceType
): Promise<NearbyService[]> {
  try {
    const response = await fetch(
      `${API_URL}/nearbyServices?latitude=${latitude}&longitude=${longitude}&type=${type}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Services API error: ${response.status}`);
    }

    const data = await response.json();
    return data.services || [];
  } catch (error) {
    console.error('[SafetyService] Error fetching nearby services:', error);
    throw error;
  }
}

/**
 * Fetch local vendors near a location
 */
export async function fetchVendors(
  latitude: number,
  longitude: number,
  category?: VendorCategory
): Promise<Vendor[]> {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (category) params.append('category', category);

    const response = await fetch(`${API_URL}/vendors?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Vendors API error: ${response.status}`);
    }

    const data = await response.json();
    return data.vendors || [];
  } catch (error) {
    console.error('[SafetyService] Error fetching vendors:', error);
    throw error;
  }
}

/**
 * Register a new vendor
 */
export async function registerVendor(vendorData: {
  name: string;
  category: VendorCategory;
  description: string;
  phone: string;
  email?: string;
  address: string;
  latitude: number;
  longitude: number;
  products?: { name: string; description: string; price: string }[];
}): Promise<Vendor> {
  try {
    const response = await fetch(`${API_URL}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData),
    });

    if (!response.ok) {
      throw new Error(`Vendor registration error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[SafetyService] Error registering vendor:', error);
    throw error;
  }
}
