import { TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text, Image } from '@gluestack-ui/themed';
import { Star, MapPin, BadgeCheck, Phone } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import type { Vendor } from '../../../@types/SafetyTypes';
import { VendorCategoryLabels } from '../../../@types/SafetyTypes';

interface VendorCardProps {
  vendor: Vendor;
  onPress?: () => void;
}

const categoryColors: Record<string, string> = {
  food: '#F97316',
  crafts: '#8B5CF6',
  tours: '#06B6D4',
  transport: '#3B82F6',
  accommodation: '#EC4899',
  other: '#6B7280',
};

export function VendorCard({ vendor, onPress }: VendorCardProps) {
  const categoryColor = categoryColors[vendor.category] || '#6B7280';
  const categoryLabel = VendorCategoryLabels[vendor.category] || 'Other';

  const handleCall = () => {
    if (vendor.phone) {
      Linking.openURL(`tel:${vendor.phone}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {vendor.photoUrl && (
        <Image
          source={{ uri: vendor.photoUrl }}
          style={styles.image}
          resizeMode="cover"
          alt={vendor.name}
        />
      )}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {vendor.name}
            </Text>
            {vendor.isVerified && (
              <BadgeCheck size={14} color="#3B82F6" />
            )}
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryLabel}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {vendor.description}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.metaItem}>
            <Star size={12} color="#EAB308" fill="#EAB308" />
            <Text style={styles.rating}>
              {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'}
            </Text>
            {vendor.reviewCount > 0 && (
              <Text style={styles.reviews}>({vendor.reviewCount})</Text>
            )}
          </View>

          {(vendor as any).distance && (
            <View style={styles.metaItem}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.distance}>{(vendor as any).distance}</Text>
            </View>
          )}

          {vendor.phone ? (
            <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
              <Phone size={14} color="#22C55E" />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  reviews: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  distance: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  callText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
});
