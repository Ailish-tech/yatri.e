import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafetyAlert,
  AreaSafetyReport,
  CrowdLevel,
  EmergencyContact,
  SOSEvent,
  RiskSeverity,
} from '../../@types/SafetyTypes';

interface SafetyStore {
  // Safety alerts
  currentReport: AreaSafetyReport | null;
  setCurrentReport: (report: AreaSafetyReport | null) => void;

  // Emergency contacts
  emergencyContacts: EmergencyContact[];
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (id: string) => void;
  updateEmergencyContact: (id: string, contact: Partial<EmergencyContact>) => void;

  // SOS state
  sosActive: boolean;
  setSosActive: (active: boolean) => void;
  sosHistory: SOSEvent[];
  addSOSEvent: (event: SOSEvent) => void;

  // Crowd levels cache
  crowdLevels: Record<string, CrowdLevel>;
  setCrowdLevel: (placeId: string, level: CrowdLevel) => void;

  // Clear all
  clearAll: () => void;
}

export const useSafetyStore = create<SafetyStore>()(
  persist(
    (set, get) => ({
      // Safety alerts
      currentReport: null,
      setCurrentReport: (report) => set({ currentReport: report }),

      // Emergency contacts
      emergencyContacts: [],
      addEmergencyContact: (contact) =>
        set((state) => ({
          emergencyContacts: [...state.emergencyContacts, contact],
        })),
      removeEmergencyContact: (id) =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
        })),
      updateEmergencyContact: (id, updates) =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      // SOS state
      sosActive: false,
      setSosActive: (active) => set({ sosActive: active }),
      sosHistory: [],
      addSOSEvent: (event) =>
        set((state) => ({
          sosHistory: [event, ...state.sosHistory].slice(0, 50), // Keep last 50
        })),

      // Crowd levels cache
      crowdLevels: {},
      setCrowdLevel: (placeId, level) =>
        set((state) => ({
          crowdLevels: { ...state.crowdLevels, [placeId]: level },
        })),

      // Clear all
      clearAll: () =>
        set({
          currentReport: null,
          emergencyContacts: [],
          sosActive: false,
          sosHistory: [],
          crowdLevels: {},
        }),
    }),
    {
      name: 'safety-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
