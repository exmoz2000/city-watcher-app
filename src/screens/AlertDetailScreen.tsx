import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, AlertSeverity } from '../types';
import { mockAlerts } from '../constants/mockData';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetail'>;

const severityColors: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: Colors.infoBlue,
  [AlertSeverity.WARNING]: Colors.primaryOrange,
  [AlertSeverity.CRITICAL]: Colors.emergencyRed,
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AlertDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const alert = mockAlerts.find((a) => a.id === route.params.alertId);

  if (!alert) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>Alert not found</Text>
      </View>
    );
  }

  const sevColor = severityColors[alert.severity];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Severity Banner */}
      <View style={[styles.banner, { backgroundColor: sevColor + '15' }]}>
        <MaterialCommunityIcons
          name={
            alert.severity === AlertSeverity.CRITICAL
              ? 'alert-octagon'
              : alert.severity === AlertSeverity.WARNING
                ? 'alert'
                : 'information'
          }
          size={28}
          color={sevColor}
        />
        <View style={styles.bannerContent}>
          <Text style={[styles.bannerSeverity, { color: sevColor }]}>
            {alert.severity.toUpperCase()} ALERT
          </Text>
          <Text style={styles.bannerTitle}>{alert.title}</Text>
        </View>
      </View>

      {/* Message */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Details</Text>
        <Text style={styles.message}>{alert.message}</Text>
      </View>

      {/* Info */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="tag"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Category</Text>
          <Text style={styles.infoValue}>
            {alert.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Radius</Text>
          <Text style={styles.infoValue}>
            {alert.affectedRadius
              ? `${alert.affectedRadius}m`
              : alert.geofence.radius
                ? `${alert.geofence.radius}m`
                : 'N/A'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Affected</Text>
          <Text style={styles.infoValue}>
            {alert.recipientCount} residents
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Issued</Text>
          <Text style={styles.infoValue}>{formatDate(alert.createdAt)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="clock-end"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Expires</Text>
          <Text style={styles.infoValue}>{formatDate(alert.expiresAt)}</Text>
        </View>
        {alert.status && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="progress-wrench"
                size={20}
                color={Colors.primaryOrange}
              />
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{alert.status}</Text>
            </View>
          </>
        )}
      </View>

      {/* Action Required */}
      {alert.actionRequired && (
        <View style={[styles.card, styles.actionCard]}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={22}
            color={Colors.primaryOrange}
          />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Action Required</Text>
            <Text style={styles.actionText}>{alert.actionRequired}</Text>
          </View>
        </View>
      )}

      <View style={{ height: Spacing.section }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    marginBottom: Spacing.md,
  },
  bannerContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  bannerSeverity: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  bannerTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.cardWhite,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryOrange + '10',
    borderWidth: 1,
    borderColor: Colors.primaryOrange + '30',
  },
  actionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  actionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primaryOrange,
  },
  actionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    marginTop: 4,
  },
});
