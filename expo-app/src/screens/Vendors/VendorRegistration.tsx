import { useState } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { View, Text, ScrollView, Input, InputField, Pressable } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Store, Check, MapPin } from 'lucide-react-native';

import { TitleAndBack } from '@components/TitleBack';
import { registerVendor } from '@services/safetyService';
import type { VendorCategory } from '../../../@types/SafetyTypes';
import { VendorCategoryLabels } from '../../../@types/SafetyTypes';

const categoryOptions: VendorCategory[] = ['food', 'crafts', 'tours', 'transport', 'accommodation', 'other'];

export function VendorRegistration() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('food');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Location permission is required.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    setUseCurrentLocation(true);

    // Try to get address
    try {
      const [geo] = await Location.reverseGeocodeAsync(loc.coords);
      if (geo) {
        const addr = [geo.street, geo.city, geo.region, geo.country].filter(Boolean).join(', ');
        setAddress(addr);
      }
    } catch {}
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Business name and phone are required.');
      return;
    }
    if (!coords) {
      Alert.alert('Error', 'Please set your business location first.');
      return;
    }

    setLoading(true);
    try {
      await registerVendor({
        name: name.trim(),
        category,
        description: description.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      Alert.alert('Success! 🎉', 'Your business has been registered. Tourists can now discover you!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TitleAndBack pageTitle="Register Business" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerBanner}>
          <Store size={28} color="#2752B7" />
          <Text style={styles.headerTitle}>Join the Local Vendor Network</Text>
          <Text style={styles.headerDesc}>
            Connect with tourists visiting your area. Register your business to be discoverable.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.label}>Business Name *</Text>
          <Input style={styles.input}>
            <InputField placeholder="e.g., Maria's Artisan Crafts" value={name} onChangeText={setName} />
          </Input>

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categoryOptions.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                  {VendorCategoryLabels[cat]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Description</Text>
          <Input style={[styles.input, { height: 80 }]}>
            <InputField
              placeholder="Tell tourists about your business..."
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </Input>

          <Text style={styles.label}>Phone Number *</Text>
          <Input style={styles.input}>
            <InputField placeholder="+55 11 99999-9999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </Input>

          <Text style={styles.label}>Email (optional)</Text>
          <Input style={styles.input}>
            <InputField placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
          </Input>

          <Text style={styles.label}>Location *</Text>
          <Pressable style={styles.locationBtn} onPress={handleGetLocation}>
            <MapPin size={18} color={useCurrentLocation ? '#22C55E' : '#2752B7'} />
            <Text style={[styles.locationBtnText, useCurrentLocation && { color: '#22C55E' }]}>
              {useCurrentLocation ? '✓ Location set' : 'Use Current Location'}
            </Text>
          </Pressable>

          {address ? (
            <Text style={styles.addressPreview}>{address}</Text>
          ) : null}
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Check size={18} color="#fff" />
              <Text style={styles.submitText}>Register My Business</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  headerBanner: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, backgroundColor: '#EFF6FF', marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E40AF', marginTop: 10 },
  headerDesc: { fontSize: 13, color: '#3B82F6', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  formSection: { paddingHorizontal: 16, marginTop: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { borderRadius: 12, backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  categoryChipActive: { borderColor: '#2752B7', backgroundColor: '#EFF6FF' },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  categoryChipTextActive: { color: '#2752B7' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  locationBtnText: { fontSize: 14, fontWeight: '600', color: '#2752B7' },
  addressPreview: { fontSize: 12, color: '#6B7280', marginTop: 6, fontStyle: 'italic' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22C55E', marginHorizontal: 16, marginTop: 24, borderRadius: 14, paddingVertical: 16 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
