import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ReportStatus } from '../types';
import { statusDisplayMap } from '../constants/mockData';
import { Fonts, BorderRadius, Spacing } from '../constants/theme';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const display = statusDisplayMap[status];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: display.color + '18' },
        isSmall && styles.badgeSmall,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: display.color }]} />
      <Text
        style={[
          styles.label,
          { color: display.color },
          isSmall && styles.labelSmall,
        ]}
        numberOfLines={1}
      >
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
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs + 2,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
  },
  labelSmall: {
    fontSize: Fonts.sizes.xs,
  },
});
