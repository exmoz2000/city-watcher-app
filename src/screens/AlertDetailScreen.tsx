import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, AlertSeverity, CommunityAlert } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import * as api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetail'>;

export default function AlertDetailScreen({ route }: Props) {
  const { alertId } = route.params;
  const insets = useSafeAreaInsets();
  const [alert, setAlert] = useState<CommunityAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch all alerts and find the one matching alertId
        const alerts = await api.getAlerts();
        const found = alerts.find((a) => a.id === alertId);
        setAlert(found ?? null);
      } catch {
        setAlert(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [alertId]);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primaryOrange} />
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Alert not found</Text>
      </View>
    );
  }

  const severityColors = {
    [AlertSeverity.CRITICAL]: {
      bg: Colors.emergencyRedLight,
      color: Colors.emergencyRed,
    },
    [AlertSeverity.WARNING]: { bg: '#FFF3E0', color: '#E65100' },
    [AlertSeverity.INFO]: { bg: '#E3F2FD', color: '#1565C0' },
  };

  const sv = severityColors[alert.severity];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}>
      {/* Severity Banner */}
      <View style={[styles.severityBanner, { backgroundColor: sv.bg }]}>
        <MaterialCommunityIcons
          name={
            alert.severity === AlertSeverity.CRITICAL
              ? 'alert-circle'
              : alert.severity === AlertSeverity.WARNING
                ? 'alert'
                : 'information'
          }
          size={24}
          color={sv.color}
        />
        <Text style={[styles.severityLabel, { color: sv.color }]}>
          {alert.severity.toUpperCase()} ALERT
        </Text>
      </View>

      {/* Title & Message */}
      <View style={styles.section}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.message}>{alert.message}</Text>
      </View>

      {/* Action Required */}
      {alert.actionRequired && (
        <View style={styles.actionCard}>
          <MaterialCommunityIcons
            name="clipboard-check-outline"
            size={20}
            color={Colors.primaryOrange}
          />
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>Action Required</Text>
            <Text style={styles.actionText}>{alert.actionRequired}</Text>
          </View>
        </View>
      )}

      {/* Affected Area */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Affected Area</Text>
        <View style={styles.areaCard}>
          <View style={styles.areaRow}>
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={20}
              color={Colors.emergencyRed}
            />
            <View style={styles.areaInfo}>
              <Text style={styles.areaLabel}>Location</Text>
              {alert.geofence.center && (
                <Text style={styles.areaValue}>
                  {alert.geofence.center.latitude.toFixed(4)},{' '}
                  {alert.geofence.center.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          </View>
          {alert.affectedRadius && (
            <View style={styles.areaRow}>
              <MaterialCommunityIcons
                name="radius-outline"
                size={20}
                color={Colors.infoBlue}
              />
              <View style={styles.areaInfo}>
                <Text style={styles.areaLabel}>Affected Radius</Text>
                <Text style={styles.areaValue}>
                  {alert.affectedRadius}m
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: alert.isActive
                      ? Colors.successGreen
                      : Colors.textLight,
                  },
                ]}
              />
              <Text style={styles.detailValue}>
                {alert.status || (alert.isActive ? 'Active' : 'Expired')}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>
              {alert.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Residents Notified</Text>
            <Text style={styles.detailValue}>{alert.recipientCount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Published</Text>
            <Text style={styles.detailValue}>
              {alert.createdAt.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={styles.detailValue}>
              {alert.expiresAt.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Confirm Affected */}
      {alert.isActive && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.affectedButton}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color={Colors.textWhite}
            />
            <Text style={styles.affectedButtonText}>Yes, I'm affected</Text>
          </TouchableOpacity>
          {alert.confirmedCount !== undefined && (
            <Text style={styles.confirmedText}>
              {alert.confirmedCount} residents confirmed affected
            </Text>
          )}
        </View>
      )}

      <View style={{ height: Spacing.section }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
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
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  severityLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryOrange + '10',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryOrange,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  areaCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  areaInfo: {
    flex: 1,
  },
  areaLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  areaValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  affectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryOrange,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  affectedButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textWhite,
  },
  confirmedText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
