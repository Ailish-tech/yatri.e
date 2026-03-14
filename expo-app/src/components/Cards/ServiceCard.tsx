import { TouchableOpacity, StyleSheet } from 'react-native';
import { View, Text } from '@gluestack-ui/themed';
import { Phone, MapPin, Star, Clock, Navigation } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import type { NearbyService } from '../../../@types/SafetyTypes';

interface ServiceCardProps {
  service: NearbyService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const handleCall = () => {
    if (service.phone) {
      Linking.openURL(`tel:${service.phone}`);
    }
  };

  const handleNavigate = () => {
    Linking.openURL(
      `https://maps.google.com/?daddr=${service.latitude},${service.longitude}`
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.mainInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {service.name}
          </Text>
          <View style={styles.metaRow}>
            <MapPin size={12} color="#6B7280" />
            <Text style={styles.address} numberOfLines={1}>
              {service.address}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Navigation size={12} color="#3B82F6" />
            <Text style={styles.distance}>{service.distance}</Text>
            {service.rating !== undefined && service.rating > 0 && (
              <>
                <Star size={12} color="#EAB308" fill="#EAB308" />
                <Text style={styles.rating}>{service.rating.toFixed(1)}</Text>
              </>
            )}
            {service.isOpen !== undefined && (
              <>
                <Clock size={12} color={service.isOpen ? '#22C55E' : '#EF4444'} />
                <Text style={[styles.openStatus, { color: service.isOpen ? '#22C55E' : '#EF4444' }]}>
                  {service.isOpen ? 'Open' : 'Closed'}
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {service.phone && (
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Phone size={16} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.navButton} onPress={handleNavigate}>
            <MapPin size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainInfo: {
    flex: 1,
    gap: 5,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  address: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  distance: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 8,
  },
  rating: {
    fontSize: 12,
    color: '#EAB308',
    fontWeight: '600',
    marginRight: 8,
  },
  openStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'column',
    gap: 6,
    marginLeft: 10,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
