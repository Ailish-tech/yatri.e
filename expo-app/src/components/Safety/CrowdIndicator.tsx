import { StyleSheet } from 'react-native';
import { View, Text } from '@gluestack-ui/themed';
import { Users } from 'lucide-react-native';
import type { CrowdLevelValue } from '../../../@types/SafetyTypes';
import { CrowdLevelLabels, CrowdLevelColors } from '../../../@types/SafetyTypes';

interface CrowdIndicatorProps {
  level: CrowdLevelValue;
  placeName?: string;
  compact?: boolean;
}

export function CrowdIndicator({ level, placeName, compact = false }: CrowdIndicatorProps) {
  const color = CrowdLevelColors[level];
  const label = CrowdLevelLabels[level];

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: color + '20', borderColor: color }]}>
        <Users size={12} color={color} />
        <Text style={[styles.compactText, { color }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Users size={18} color={color} />
        <Text style={styles.label}>Crowd Level</Text>
        {placeName && (
          <Text style={styles.placeName} numberOfLines={1}>
            {placeName}
          </Text>
        )}
      </View>

      {/* Bar indicator */}
      <View style={styles.barContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor: i <= level ? CrowdLevelColors[i as CrowdLevelValue] : '#E5E7EB',
                flex: 1,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.levelText, { color }]}>{label}</Text>
        <Text style={styles.levelNumber}>{level}/5</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  placeName: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    textAlign: 'right',
  },
  barContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 4,
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  levelNumber: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
