import { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Vibration, Alert } from 'react-native';
import { View, Text } from '@gluestack-ui/themed';
import { ShieldAlert } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { getAuth } from 'firebase/auth';

import { useSafetyStore } from '@utils/safetyStore';
import { triggerSOS } from '@services/safetyService';

const COUNTDOWN_SECONDS = 3;

export function SOSButton() {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);

  const { emergencyContacts, setSosActive, addSOSEvent } = useSafetyStore();

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (countdown === 0) {
      handleSOSConfirmed();
    }
    if (countdown !== null && countdown > 0) {
      countdownTimer.current = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
        Vibration.vibrate(200);
      }, 1000);
    }
    return () => {
      if (countdownTimer.current) clearTimeout(countdownTimer.current);
    };
  }, [countdown]);

  const handleSOSPress = () => {
    if (countdown !== null) {
      // Cancel countdown
      setCountdown(null);
      Vibration.cancel();
      return;
    }

    if (emergencyContacts.length === 0) {
      Alert.alert(
        'No Emergency Contacts',
        'Please add emergency contacts first in Safety > Emergency Contacts.',
        [{ text: 'OK' }]
      );
      return;
    }

    Vibration.vibrate(500);
    setCountdown(COUNTDOWN_SECONDS);
  };

  const handleSOSConfirmed = async () => {
    setLoading(true);
    setSosActive(true);
    setCountdown(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission is required for SOS.');
        setLoading(false);
        setSosActive(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const auth = getAuth();
      const userId = auth.currentUser?.uid || 'anonymous';

      const contacts = emergencyContacts.map((c) => ({
        name: c.name,
        phone: c.phone,
      }));

      const result = await triggerSOS(latitude, longitude, userId, contacts);

      // Record the SOS event
      addSOSEvent({
        id: result.eventId,
        timestamp: new Date().toISOString(),
        latitude,
        longitude,
        contactsNotified: contacts.map((c) => c.name),
        nearestStation: result.nearestStation,
      });

      // Send SMS to emergency contacts
      const smsBody = result.smsTemplate || 
        `🚨 EMERGENCY SOS! I need help! My location: https://maps.google.com/?q=${latitude},${longitude}`;

      for (const contact of contacts) {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(smsBody)}`;
        try {
          await Linking.openURL(smsUrl);
        } catch (e) {
          console.error(`Failed to send SMS to ${contact.name}:`, e);
        }
      }

      // Show nearest police station info
      if (result.nearestStation) {
        Alert.alert(
          '🚔 Nearest Police Station',
          `${result.nearestStation.name}\n${result.nearestStation.address}\nDistance: ${result.nearestStation.distance}`,
          [
            {
              text: 'Call Station',
              onPress: () => {
                if (result.nearestStation.phone) {
                  Linking.openURL(`tel:${result.nearestStation.phone}`);
                } else {
                  // Open in maps for navigation
                  Linking.openURL(
                    `https://maps.google.com/?daddr=${result.nearestStation.latitude},${result.nearestStation.longitude}`
                  );
                }
              },
            },
            {
              text: 'Navigate',
              onPress: () => {
                Linking.openURL(
                  `https://maps.google.com/?daddr=${result.nearestStation.latitude},${result.nearestStation.longitude}`
                );
              },
            },
            { text: 'Close' },
          ]
        );
      }
    } catch (error) {
      console.error('[SOS] Error:', error);
      Alert.alert('SOS Error', 'Failed to send emergency alert. Please call emergency services directly.');
    } finally {
      setLoading(false);
      setSosActive(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
      <TouchableOpacity
        style={[
          styles.button,
          countdown !== null && styles.buttonActive,
          loading && styles.buttonLoading,
        ]}
        onPress={handleSOSPress}
        activeOpacity={0.7}
        disabled={loading}
      >
        {countdown !== null ? (
          <Text style={styles.countdownText}>{countdown}</Text>
        ) : loading ? (
          <Text style={styles.labelText}>...</Text>
        ) : (
          <>
            <ShieldAlert size={20} color="#fff" strokeWidth={2.5} />
            <Text style={styles.labelText}>SOS</Text>
          </>
        )}
      </TouchableOpacity>
      {countdown !== null && (
        <Text style={styles.cancelText}>Tap again to cancel</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 999,
  },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    flexDirection: 'column',
    gap: 2,
  },
  buttonActive: {
    backgroundColor: '#DC2626',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  buttonLoading: {
    backgroundColor: '#9CA3AF',
  },
  countdownText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  labelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});
