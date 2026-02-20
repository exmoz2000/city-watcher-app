import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Report } from '../types';
import { categoryDisplayMap } from '../constants/mockData';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';
import StatusBadge from './StatusBadge';

interface ReportCardProps {
  report: Report;
  onPress: () => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function ReportCard({ report, onPress }: ReportCardProps) {
  const categoryInfo = categoryDisplayMap[report.category];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={categoryInfo.icon as any}
            size={24}
            color={Colors.primaryOrange}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{categoryInfo.label}</Text>
          <Text style={styles.caseId}>{report.caseId}</Text>
        </View>
        <Text style={styles.timeAgo}>{formatTimeAgo(report.createdAt)}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {report.description}
      </Text>
      <View style={styles.footer}>
        <StatusBadge status={report.status} size="small" />
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={Colors.textSecondary} />
          <Text style={styles.address} numberOfLines={1}>
            {report.address}
          </Text>
        </View>
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
    backgroundColor: Colors.primaryOrange + '15',
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
  },
  caseId: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    marginLeft: Spacing.sm,
  },
  address: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginLeft: 2,
    maxWidth: 140,
  },
});
