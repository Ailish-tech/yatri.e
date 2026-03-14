import { StyleSheet } from 'react-native';
import { View, Text } from '@gluestack-ui/themed';
import {
  AlertTriangle,
  ShieldAlert,
  Eye,
  CloudLightning,
  Car,
  Heart,
  Flag,
  Info,
} from 'lucide-react-native';
import type { RiskSeverity, RiskCategory, SafetyAlert } from '../../../@types/SafetyTypes';

const severityColors: Record<RiskSeverity, { bg: string; border: string; text: string; icon: string }> = {
  low: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: '#22C55E' },
  medium: { bg: '#FEFCE8', border: '#FDE047', text: '#854D0E', icon: '#EAB308' },
  high: { bg: '#FFF7ED', border: '#FDBA74', text: '#9A3412', icon: '#F97316' },
  critical: { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '#EF4444' },
};

const categoryIcons: Record<RiskCategory, any> = {
  theft: Eye,
  scam: AlertTriangle,
  assault: ShieldAlert,
  natural_disaster: CloudLightning,
  traffic: Car,
  health: Heart,
  political: Flag,
  general: Info,
};

interface SafetyAlertCardProps {
  alert: SafetyAlert;
}

export function SafetyAlertCard({ alert }: SafetyAlertCardProps) {
  const colors = severityColors[alert.severity] || severityColors.low;
  const IconComponent = categoryIcons[alert.category] || Info;

  return (
    <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.border }]}>
          <IconComponent size={18} color={colors.icon} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{alert.title}</Text>
          <View style={[styles.severityBadge, { backgroundColor: colors.icon }]}>
            <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.text }]}>{alert.description}</Text>
      {alert.tip && (
        <View style={styles.tipContainer}>
          <Text style={[styles.tipLabel, { color: colors.icon }]}>💡 Tip:</Text>
          <Text style={[styles.tipText, { color: colors.text }]}>{alert.tip}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  severityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    opacity: 0.85,
  },
});
