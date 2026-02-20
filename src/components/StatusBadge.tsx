import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReportStatus } from '../types';
import { statusDisplayMap } from '../constants/mockData';
import { Fonts, BorderRadius, Spacing } from '../constants/theme';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const display = statusDisplayMap[status];
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: display.color + '20' }, isSmall && styles.badgeSmall]}>
      <View style={[styles.dot, { backgroundColor: display.color }]} />
      <Text style={[styles.label, { color: display.color }, isSmall && styles.labelSmall]}>
        {display.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
  },
  labelSmall: {
    fontSize: Fonts.sizes.xs,
  },
});
