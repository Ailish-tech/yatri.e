import { LucideIcon } from "lucide-react-native";

// ==========================================
// Safety & Risk Alert Types
// ==========================================

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategory =
  | 'theft'
  | 'scam'
  | 'assault'
  | 'natural_disaster'
  | 'traffic'
  | 'health'
  | 'political'
  | 'general';

export interface SafetyAlert {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
  tip: string;
  location?: {
    latitude: number;
    longitude: number;
    areaName: string;
  };
  createdAt: string;
}

export interface AreaSafetyReport {
  overallRisk: RiskSeverity;
  riskScore: number; // 1-100
  areaName: string;
  alerts: SafetyAlert[];
  tips: string[];
  emergencyNumber: string;
}

// ==========================================
// Crowd Detection Types
// ==========================================

export type CrowdLevelValue = 1 | 2 | 3 | 4 | 5;

export const CrowdLevelLabels: Record<CrowdLevelValue, string> = {
  1: 'Empty',
  2: 'Not Busy',
  3: 'Moderate',
  4: 'Busy',
  5: 'Very Crowded',
};

export const CrowdLevelColors: Record<CrowdLevelValue, string> = {
  1: '#22C55E',
  2: '#84CC16',
  3: '#EAB308',
  4: '#F97316',
  5: '#EF4444',
};

export interface CrowdLevel {
  placeId: string;
  placeName: string;
  currentLevel: CrowdLevelValue;
  label: string;
  peakHours: string[];
  lastUpdated: string;
}

// ==========================================
// Emergency Types
// ==========================================

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface PoliceStation {
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  distance: string;
}

export interface SOSEvent {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  contactsNotified: string[];
  nearestStation?: PoliceStation;
}

// ==========================================
// Nearby Services Types
// ==========================================

export type ServiceType = 'taxi' | 'hotel' | 'hospital' | 'pharmacy' | 'police';

export const ServiceTypeLabels: Record<ServiceType, string> = {
  taxi: 'Taxi',
  hotel: 'Hotel',
  hospital: 'Hospital',
  pharmacy: 'Pharmacy',
  police: 'Police',
};

export interface NearbyService {
  id: string;
  type: ServiceType;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  latitude: number;
  longitude: number;
  distance: string;
  isOpen?: boolean;
  photoUrl?: string;
  iconUrl?: string;
}

// ==========================================
// Vendor Marketplace Types
// ==========================================

export type VendorCategory = 'food' | 'crafts' | 'tours' | 'transport' | 'accommodation' | 'other';

export const VendorCategoryLabels: Record<VendorCategory, string> = {
  food: 'Food & Drinks',
  crafts: 'Crafts & Souvenirs',
  tours: 'Local Tours',
  transport: 'Transport',
  accommodation: 'Accommodation',
  other: 'Other',
};

export interface VendorProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  description: string;
  phone: string;
  email?: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  products: VendorProduct[];
  isVerified: boolean;
  createdAt: string;
}
