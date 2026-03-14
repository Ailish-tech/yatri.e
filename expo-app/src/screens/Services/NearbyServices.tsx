import { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { View, Text, ScrollView, Pressable } from '@gluestack-ui/themed';
import * as Location from 'expo-location';
import {
  Car,
  Building,
  Hospital,
  Pill,
  ShieldCheck,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react-native';

import { TitleAndBack } from '@components/TitleBack';
import { ServiceCard } from '@components/Cards/ServiceCard';
import { fetchNearbyServices } from '@services/safetyService';

import type { NearbyService, ServiceType } from '../../../@types/SafetyTypes';

interface ServiceCategory {
  type: ServiceType;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
}

const categories: ServiceCategory[] = [
  { type: 'taxi', label: 'Taxi', icon: Car, color: '#EAB308', bgColor: '#FEFCE8' },
  { type: 'hotel', label: 'Hotel', icon: Building, color: '#8B5CF6', bgColor: '#F3E8FF' },
  { type: 'hospital', label: 'Hospital', icon: Hospital, color: '#EF4444', bgColor: '#FEF2F2' },
  { type: 'pharmacy', label: 'Pharmacy', icon: Pill, color: '#22C55E', bgColor: '#F0FDF4' },
  { type: 'police', label: 'Police', icon: ShieldCheck, color: '#3B82F6', bgColor: '#EFF6FF' },
];

export function NearbyServices() {
  const [selectedType, setSelectedType] = useState<ServiceType>('hospital');
  const [services, setServices] = useState<NearbyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadServices(selectedType);
    }
  }, [selectedType, userLocation]);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Location permission required.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const loadServices = async (type: ServiceType) => {
    if (!userLocation) return;
    setLoading(true);
    setError(null);
    try {
      const results = await fetchNearbyServices(
        userLocation.latitude,
        userLocation.longitude,
        type
      );
      setServices(results);
    } catch (err) {
      setError('Failed to load services. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TitleAndBack pageTitle="Nearby Services" />

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {categories.map((cat) => {
          const isSelected = selectedType === cat.type;
          const IconComp = cat.icon;
          return (
            <Pressable
              key={cat.type}
              style={[
                styles.tab,
                isSelected && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => setSelectedType(cat.type)}
            >
              <IconComp size={18} color={isSelected ? '#fff' : cat.color} />
              <Text
                style={[
                  styles.tabLabel,
                  isSelected && { color: '#fff' },
                  !isSelected && { color: cat.color },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2752B7" />
            <Text style={styles.loadingText}>
              Searching nearby {categories.find((c) => c.type === selectedType)?.label.toLowerCase()}...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={40} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => loadServices(selectedType)}>
              <RefreshCcw size={16} color="#fff" />
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {selectedType} services found nearby.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>
              {services.length} result{services.length !== 1 ? 's' : ''} found
            </Text>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabsScroll: { maxHeight: 60, marginTop: 8 },
  tabsContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  tabLabel: { fontSize: 13, fontWeight: '600' },
  resultsContent: { paddingTop: 12, paddingBottom: 30 },
  resultCount: { fontSize: 13, color: '#6B7280', marginHorizontal: 16, marginBottom: 10 },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, color: '#6B7280', fontSize: 14 },
  errorContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  errorText: { marginTop: 16, color: '#EF4444', fontSize: 14, textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: '#2752B7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#6B7280' },
});
