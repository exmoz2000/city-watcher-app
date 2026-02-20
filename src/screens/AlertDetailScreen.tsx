import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, AlertSeverity } from '../types';
import { mockAlerts } from '../constants/mockData';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetail'>;

const severityColors: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: Colors.infoBlue,
  [AlertSeverity.WARNING]: Colors.primaryOrange,
  [AlertSeverity.CRITICAL]: Colors.emergencyRed,
};

export default function AlertDetailScreen({ route }: Props) {
  const { alertId } = route.params;
  const alert = mockAlerts.find((a) => a.id === alertId);

  if (!alert) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Alert not found</Text>
      </View>
    );
  }

  const color = severityColors[alert.severity];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Severity banner */}
      <View style={[styles.severityBanner, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons
          name={alert.severity === AlertSeverity.CRITICAL ? 'alert-octagon' : 'alert'}
          size={24}
          color={color}
        />
        <Text style={[styles.severityText, { color }]}>
          {alert.severity.toUpperCase()} ALERT
        </Text>
      </View>

      {/* Title & Message */}
      <View style={styles.card}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.message}>{alert.message}</Text>
      </View>

      {/* Affected Area */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Affected Area</Text>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker-radius" size={32} color={color} />
          <Text style={styles.mapPlaceholderText}>Alert Zone</Text>
        </View>
        {alert.affectedRadius && (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker-radius" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Affected radius: {alert.affectedRadius}m</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account-group" size={18} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{alert.recipientCount} residents affected</Text>
        </View>
      </View>

      {/* Recommended Actions */}
      {alert.actionRequired && (
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          <Text style={styles.actionText}>{alert.actionRequired}</Text>
        </View>
      )}

      {/* Status & Timing */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Alert Information</Text>
        <DetailRow label="Status" value={alert.status ?? (alert.isActive ? 'Active' : 'Expired')} />
        <DetailRow label="Category" value={alert.category.replace(/_/g, ' ').toUpperCase()} />
        <DetailRow label="Issued" value={alert.createdAt.toLocaleString()} />
        <DetailRow label="Expires" value={alert.expiresAt.toLocaleString()} />
        {alert.confirmedCount !== undefined && (
          <DetailRow label="Confirmed" value={`${alert.confirmedCount} residents`} />
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.section,
  },
  errorText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.section,
  },
  severityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  severityText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    marginLeft: Spacing.sm,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  title: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  mapPlaceholder: {
    height: 140,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  mapPlaceholderText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  actionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    maxWidth: '60%',
    textAlign: 'right',
  },
});
