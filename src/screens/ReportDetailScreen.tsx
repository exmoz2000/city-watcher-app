import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ReportStatus } from '../types';
import { mockReports, categoryDisplayMap, statusDisplayMap } from '../constants/mockData';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';
import StatusBadge from '../components/StatusBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

const statusOrder: ReportStatus[] = [
  ReportStatus.RECEIVED,
  ReportStatus.UNDER_REVIEW,
  ReportStatus.CREW_DISPATCHED,
  ReportStatus.IN_PROGRESS,
  ReportStatus.RESOLVED,
];

export default function ReportDetailScreen({ route }: Props) {
  const { reportId } = route.params;
  const report = mockReports.find((r) => r.id === reportId);

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Report not found</Text>
      </View>
    );
  }

  const categoryInfo = categoryDisplayMap[report.category];
  const currentStatusIndex = statusOrder.indexOf(report.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name={categoryInfo.icon as any}
              size={28}
              color={Colors.primaryOrange}
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.categoryLabel}>{categoryInfo.label}</Text>
            <Text style={styles.caseId}>{report.caseId}</Text>
          </View>
          <StatusBadge status={report.status} />
        </View>
      </View>

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{report.description}</Text>
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker" size={32} color={Colors.primaryOrange} />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
        </View>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.textSecondary} />
          <Text style={styles.address}>{report.address}</Text>
        </View>
        <Text style={styles.coordinates}>
          {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
        </Text>
      </View>

      {/* Status Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        {statusOrder.map((status, index) => {
          const isPast = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const display = statusDisplayMap[status];
          const historyEntry = report.statusHistory.find((h) => h.newStatus === status);

          return (
            <View key={status} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    isPast && { backgroundColor: display.color },
                    isCurrent && styles.timelineDotCurrent,
                  ]}
                >
                  {isPast && (
                    <MaterialCommunityIcons name="check" size={12} color={Colors.textWhite} />
                  )}
                </View>
                {index < statusOrder.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      isPast && { backgroundColor: display.color },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineLabel,
                    isPast && { color: Colors.textPrimary, fontWeight: Fonts.weights.semiBold },
                  ]}
                >
                  {display.label}
                </Text>
                {historyEntry && (
                  <Text style={styles.timelineDate}>
                    {historyEntry.timestamp.toLocaleDateString()} ·{' '}
                    {historyEntry.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
                {historyEntry?.message && (
                  <Text style={styles.timelineMessage}>{historyEntry.message}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Details</Text>
        <DetailRow label="Department" value={categoryInfo.department} />
        {report.assignedTo && <DetailRow label="Assigned To" value={report.assignedTo} />}
        <DetailRow label="Priority" value={report.priority.toUpperCase()} />
        <DetailRow
          label="AI Confidence"
          value={`${(report.aiClassification.confidence * 100).toFixed(0)}%`}
        />
        <DetailRow
          label="Submitted"
          value={report.createdAt.toLocaleDateString()}
        />
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
  headerCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  caseId: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  coordinates: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xl,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 52,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCurrent: {
    borderWidth: 3,
    borderColor: Colors.primaryOrange + '40',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  timelineLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  timelineDate: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timelineMessage: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
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
  },
});
