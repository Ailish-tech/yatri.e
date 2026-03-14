import { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { View, Text, ScrollView, Pressable } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import {
  Shield,
  ShieldAlert,
  Users,
  Phone,
  ChevronRight,
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react-native';

import { TitleAndBack } from '@components/TitleBack';
import { SafetyAlertCard } from '@components/Safety/SafetyAlertCard';
import { SOSButton } from '@components/Safety/SOSButton';

import { useSafetyStore } from '@utils/safetyStore';
import { fetchSafetyAlerts } from '@services/safetyService';

import type { AreaSafetyReport, RiskSeverity } from '../../../@types/SafetyTypes';
import type { AuthNavigationProp } from '@routes/auth.routes';

const riskColors: Record<RiskSeverity, string> = {
  low: '#22C55E',
  medium: '#EAB308',
  high: '#F97316',
  critical: '#EF4444',
};

const riskBgColors: Record<RiskSeverity, string> = {
  low: '#F0FDF4',
  medium: '#FEFCE8',
  high: '#FFF7ED',
  critical: '#FEF2F2',
};

export function SafetyDashboard() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { currentReport, setCurrentReport, emergencyContacts } = useSafetyStore();

  const loadSafetyData = async () => {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission required for safety assessment.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const report = await fetchSafetyAlerts(latitude, longitude);
      setCurrentReport(report);
    } catch (err: any) {
      setError('Unable to fetch safety data. Check your connection.');
      console.error('[SafetyDashboard] Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSafetyData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSafetyData();
  };

  const report = currentReport;
  const riskColor = report ? riskColors[report.overallRisk] : '#6B7280';
  const riskBg = report ? riskBgColors[report.overallRisk] : '#F9FAFB';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TitleAndBack pageTitle="Safety Center" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Risk Score Header */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2752B7" />
            <Text style={styles.loadingText}>Analyzing area safety...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertTriangle size={40} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={loadSafetyData}>
              <RefreshCcw size={16} color="#fff" />
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : report ? (
          <>
            {/* Overall Risk Card */}
            <View style={[styles.riskCard, { backgroundColor: riskBg, borderColor: riskColor + '40' }]}>
              <View style={styles.riskHeader}>
                <View style={[styles.riskIconContainer, { backgroundColor: riskColor }]}>
                  <Shield size={24} color="#fff" />
                </View>
                <View style={styles.riskInfo}>
                  <Text style={styles.areaName}>{report.areaName}</Text>
                  <View style={styles.riskRow}>
                    <Text style={[styles.riskLevel, { color: riskColor }]}>
                      {report.overallRisk.toUpperCase()} RISK
                    </Text>
                    <Text style={styles.riskScore}>Score: {report.riskScore}/100</Text>
                  </View>
                </View>
              </View>
              {report.emergencyNumber && (
                <View style={styles.emergencyRow}>
                  <Phone size={14} color={riskColor} />
                  <Text style={[styles.emergencyText, { color: riskColor }]}>
                    Emergency: {report.emergencyNumber}
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate('EmergencyContacts' as never)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Phone size={20} color="#EF4444" />
                </View>
                <Text style={styles.quickActionLabel}>Emergency{'\n'}Contacts</Text>
                <Text style={styles.quickActionCount}>{emergencyContacts.length}</Text>
              </Pressable>

              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate('NearbyServices' as never)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Shield size={20} color="#3B82F6" />
                </View>
                <Text style={styles.quickActionLabel}>Nearby{'\n'}Services</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </Pressable>

              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate('VendorMarketplace' as never)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Users size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.quickActionLabel}>Local{'\n'}Vendors</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Safety Alerts */}
            <View style={styles.sectionHeader}>
              <ShieldAlert size={18} color="#374151" />
              <Text style={styles.sectionTitle}>Safety Alerts ({report.alerts.length})</Text>
            </View>

            {report.alerts.map((alert) => (
              <SafetyAlertCard key={alert.id} alert={alert} />
            ))}

            {/* General Tips */}
            {report.tips && report.tips.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Shield size={18} color="#374151" />
                  <Text style={styles.sectionTitle}>Safety Tips</Text>
                </View>
                <View style={styles.tipsContainer}>
                  {report.tips.map((tip, index) => (
                    <View key={index} style={styles.tipRow}>
                      <Text style={styles.tipBullet}>✓</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        ) : null}
      </ScrollView>

      <SOSButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 120 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  loadingText: { marginTop: 16, color: '#6B7280', fontSize: 15 },
  errorContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  errorText: { marginTop: 16, color: '#EF4444', fontSize: 15, textAlign: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, backgroundColor: '#2752B7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '600' },
  riskCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  riskHeader: { flexDirection: 'row', alignItems: 'center' },
  riskIconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  riskInfo: { flex: 1 },
  areaName: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  riskLevel: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  riskScore: { fontSize: 12, color: '#6B7280' },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  emergencyText: { fontSize: 13, fontWeight: '600' },
  quickActions: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, gap: 10 },
  quickAction: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  quickActionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  quickActionLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textAlign: 'center', lineHeight: 15 },
  quickActionCount: { fontSize: 14, fontWeight: '800', color: '#2752B7' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  tipsContainer: { marginHorizontal: 16, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#86EFAC' },
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tipBullet: { color: '#22C55E', fontWeight: '700', fontSize: 14 },
  tipText: { flex: 1, fontSize: 13, color: '#166534', lineHeight: 19 },
});
