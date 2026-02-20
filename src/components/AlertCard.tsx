import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityAlert, AlertSeverity } from '../types';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface AlertCardProps {
  alert: CommunityAlert;
  onPress: (alert: CommunityAlert) => void;
}

const severityConfig: Record<
  AlertSeverity,
  { color: string; bg: string; icon: string }
> = {
  [AlertSeverity.INFO]: {
    color: Colors.infoBlue,
    bg: '#E3F2FD',
    icon: 'information',
  },
  [AlertSeverity.WARNING]: {
    color: Colors.primaryOrange,
    bg: '#FFF3E0',
    icon: 'alert',
  },
  [AlertSeverity.CRITICAL]: {
    color: Colors.emergencyRed,
    bg: Colors.emergencyRedLight,
    icon: 'alert-octagon',
  },
};

export default function AlertCard({ alert, onPress }: AlertCardProps) {
  const sev = severityConfig[alert.severity];

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: sev.color }]}
      onPress={() => onPress(alert)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: sev.bg }]}>
          <MaterialCommunityIcons
            name={sev.icon as any}
            size={22}
            color={sev.color}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {alert.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {alert.message}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
              <Text style={[styles.severityText, { color: sev.color }]}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
            {alert.recipientCount > 0 && (
              <Text style={styles.recipients}>
                {alert.recipientCount} affected
              </Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={Colors.textLight}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  message: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  severityText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  recipients: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
});
