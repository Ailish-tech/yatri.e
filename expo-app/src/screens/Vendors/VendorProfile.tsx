import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { View, Text, ScrollView, Image } from '@gluestack-ui/themed';
import { useRoute } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  BadgeCheck,
  Navigation,
  ShoppingBag,
} from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import { TitleAndBack } from '@components/TitleBack';
import { VendorCategoryLabels } from '../../../@types/SafetyTypes';
import type { Vendor } from '../../../@types/SafetyTypes';

export function VendorProfile() {
  const route = useRoute();
  const vendor = (route.params as any)?.vendor as Vendor;

  if (!vendor) {
    return (
      <SafeAreaView style={styles.container}>
        <TitleAndBack pageTitle="Vendor" />
        <View style={styles.errorContainer}>
          <Text>Vendor data not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryLabel = VendorCategoryLabels[vendor.category] || 'Other';

  const handleCall = () => {
    if (vendor.phone) Linking.openURL(`tel:${vendor.phone}`);
  };

  const handleEmail = () => {
    if (vendor.email) Linking.openURL(`mailto:${vendor.email}`);
  };

  const handleNavigate = () => {
    Linking.openURL(
      `https://maps.google.com/?daddr=${vendor.latitude},${vendor.longitude}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TitleAndBack pageTitle="Vendor Details" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo */}
        {vendor.photoUrl && (
          <Image
            source={{ uri: vendor.photoUrl }}
            style={styles.heroImage}
            resizeMode="cover"
            alt={vendor.name}
          />
        )}

        {/* Name & Category */}
        <View style={styles.headerSection}>
          <View style={styles.nameRow}>
            <Text style={styles.vendorName}>{vendor.name}</Text>
            {vendor.isVerified && <BadgeCheck size={20} color="#3B82F6" />}
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Star size={16} color="#EAB308" fill="#EAB308" />
          <Text style={styles.ratingText}>
            {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}
          </Text>
          {vendor.reviewCount > 0 && (
            <Text style={styles.reviewCount}>({vendor.reviewCount} reviews)</Text>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description}>{vendor.description}</Text>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>

          <View style={styles.contactRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.contactText}>{vendor.address}</Text>
          </View>

          {vendor.phone ? (
            <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
              <Phone size={16} color="#22C55E" />
              <Text style={[styles.contactText, { color: '#22C55E' }]}>{vendor.phone}</Text>
            </TouchableOpacity>
          ) : null}

          {vendor.email ? (
            <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
              <Mail size={16} color="#3B82F6" />
              <Text style={[styles.contactText, { color: '#3B82F6' }]}>{vendor.email}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Products / Services */}
        {vendor.products && vendor.products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <ShoppingBag size={16} color="#374151" /> Products & Services
            </Text>
            {vendor.products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDesc}>{product.description}</Text>
                </View>
                <Text style={styles.productPrice}>{product.price}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {vendor.phone ? (
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Phone size={18} color="#fff" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.navButton} onPress={handleNavigate}>
            <Navigation size={18} color="#fff" />
            <Text style={styles.navButtonText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 40 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 220 },
  headerSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  vendorName: { fontSize: 22, fontWeight: '800', color: '#1F2937', flex: 1 },
  categoryBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#2752B7', textTransform: 'uppercase' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, marginTop: 8 },
  ratingText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  reviewCount: { fontSize: 13, color: '#9CA3AF' },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 21, paddingHorizontal: 16, marginTop: 14 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  contactText: { fontSize: 14, color: '#4B5563', flex: 1 },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  productDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  productPrice: { fontSize: 15, fontWeight: '800', color: '#22C55E', marginLeft: 10 },
  actionButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 24 },
  callButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22C55E', borderRadius: 12, paddingVertical: 14 },
  callButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  navButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 14 },
  navButtonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
