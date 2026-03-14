import { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { View, Text, ScrollView, Pressable } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import {
  UtensilsCrossed,
  Palette,
  Map,
  Car,
  Home,
  MoreHorizontal,
  AlertTriangle,
  RefreshCcw,
  Store,
} from 'lucide-react-native';

import { TitleAndBack } from '@components/TitleBack';
import { VendorCard } from '@components/Cards/VendorCard';
import { fetchVendors } from '@services/safetyService';

import type { Vendor, VendorCategory } from '../../../@types/SafetyTypes';
import type { AuthNavigationProp } from '@routes/auth.routes';

interface CategoryItem {
  key: VendorCategory | 'all';
  label: string;
  icon: any;
  color: string;
}

const categoryItems: CategoryItem[] = [
  { key: 'all', label: 'All', icon: Store, color: '#374151' },
  { key: 'food', label: 'Food', icon: UtensilsCrossed, color: '#F97316' },
  { key: 'crafts', label: 'Crafts', icon: Palette, color: '#8B5CF6' },
  { key: 'tours', label: 'Tours', icon: Map, color: '#06B6D4' },
  { key: 'transport', label: 'Transport', icon: Car, color: '#3B82F6' },
  { key: 'accommodation', label: 'Stay', icon: Home, color: '#EC4899' },
  { key: 'other', label: 'Other', icon: MoreHorizontal, color: '#6B7280' },
];

export function VendorMarketplace() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | 'all'>('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (userLocation) loadVendors();
  }, [selectedCategory, userLocation]);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Location permission required.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const loadVendors = async () => {
    if (!userLocation) return;
    setLoading(true);
    setError(null);
    try {
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const results = await fetchVendors(userLocation.latitude, userLocation.longitude, category);
      setVendors(results);
    } catch (err) {
      setError('Failed to load vendors. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorPress = (vendor: Vendor) => {
    (navigation as any).navigate('VendorProfile', { vendor });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TitleAndBack pageTitle="Local Vendors" />

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categoryItems.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const IconComp = cat.icon;
          return (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryTab,
                isSelected && { backgroundColor: cat.color, borderColor: cat.color },
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <IconComp size={16} color={isSelected ? '#fff' : cat.color} />
              <Text style={[styles.categoryLabel, isSelected && { color: '#fff' }, !isSelected && { color: cat.color }]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Register Button */}
      <Pressable
        style={styles.registerBanner}
        onPress={() => navigation.navigate('VendorRegistration' as never)}
      >
        <Store size={18} color="#2752B7" />
        <Text style={styles.registerText}>Are you a local vendor? Register your business here →</Text>
      </Pressable>

      {/* Results */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2752B7" />
            <Text style={styles.loadingText}>Finding local vendors...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={40} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={loadVendors}>
              <RefreshCcw size={16} color="#fff" />
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : vendors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Store size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No vendors found</Text>
            <Text style={styles.emptyDesc}>Try a different category or location.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultCount}>
              {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} nearby
            </Text>
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPress={() => handleVendorPress(vendor)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  categoryScroll: { maxHeight: 55, marginTop: 8 },
  categoryContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  categoryLabel: { fontSize: 12, fontWeight: '600' },
  registerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  registerText: { fontSize: 12, color: '#2752B7', fontWeight: '500', flex: 1 },
  resultsContent: { paddingTop: 12, paddingBottom: 30 },
  resultCount: { fontSize: 13, color: '#6B7280', marginHorizontal: 16, marginBottom: 10 },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 16, color: '#6B7280', fontSize: 14 },
  errorContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  errorText: { marginTop: 16, color: '#EF4444', fontSize: 14, textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, backgroundColor: '#2752B7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#6B7280', marginTop: 6 },
});
