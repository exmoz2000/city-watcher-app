import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityAlert, AlertSeverity } from '../types';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface AlertCardProps {
  alert: CommunityAlert;
  onPress: () => void;
}

const severityConfig: Record<AlertSeverity, { color: string; bgColor: string; icon: string }> = {
  [AlertSeverity.INFO]: {
    color: Colors.infoBlue,
    bgColor: Colors.infoBlue + '15',
    icon: 'information',
  },
  [AlertSeverity.WARNING]: {
    color: Colors.primaryOrange,
    bgColor: Colors.primaryOrange + '15',
    icon: 'alert',
  },
  [AlertSeverity.CRITICAL]: {
    color: Colors.emergencyRed,
    bgColor: Colors.emergencyRedLight,
    icon: 'alert-octagon',
  },
};

export default function AlertCard({ alert, onPress }: AlertCardProps) {
  const config = severityConfig[alert.severity];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <MaterialCommunityIcons name={config.icon as any} size={24} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {alert.title}
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: config.bgColor }]}>
            <Text style={[styles.severityText, { color: config.color }]}>
              {alert.severity.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {alert.message}
      </Text>
      {alert.actionRequired && (
        <View style={styles.actionRow}>
          <MaterialCommunityIcons name="arrow-right-circle" size={16} color={config.color} />
          <Text style={[styles.actionText, { color: config.color }]}>{alert.actionRequired}</Text>
        </View>
      )}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="account-group" size={14} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{alert.recipientCount} affected</Text>
        </View>
        {alert.affectedRadius && (
          <View style={styles.footerItem}>
            <MaterialCommunityIcons name="map-marker-radius" size={14} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{alert.affectedRadius}m radius</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  message: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    marginLeft: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  footerText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
});
