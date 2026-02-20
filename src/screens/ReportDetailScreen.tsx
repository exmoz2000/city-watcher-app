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
import { RootStackParamList, ReportStatus } from '../types';
import {
  mockReports,
  categoryDisplayMap,
  statusDisplayMap,
} from '../constants/mockData';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import StatusBadge from '../components/StatusBadge';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

const statusOrder: ReportStatus[] = [
  ReportStatus.RECEIVED,
  ReportStatus.UNDER_REVIEW,
  ReportStatus.CREW_DISPATCHED,
  ReportStatus.IN_PROGRESS,
  ReportStatus.RESOLVED,
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const report = mockReports.find((r) => r.id === route.params.reportId);

  if (!report) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>Report not found</Text>
      </View>
    );
  }

  const catInfo = categoryDisplayMap[report.category];
  const currentStatusIndex = statusOrder.indexOf(report.status);

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
        <Text style={styles.headerTitle}>Report Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Case ID + Status */}
      <View style={styles.caseCard}>
        <View style={styles.caseRow}>
          <View>
            <Text style={styles.caseLabel}>Case ID</Text>
            <Text style={styles.caseId}>{report.caseId}</Text>
          </View>
          <StatusBadge status={report.status} />
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name={catInfo.icon as any}
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Category</Text>
          <Text style={styles.infoValue}>{catInfo.label}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {report.address}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="office-building"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Assigned</Text>
          <Text style={styles.infoValue}>
            {report.assignedTo ?? 'Pending'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color={Colors.primaryOrange}
          />
          <Text style={styles.infoLabel}>Reported</Text>
          <Text style={styles.infoValue}>{formatDate(report.createdAt)}</Text>
        </View>
      </View>

      {/* Description */}
      {report.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{report.description}</Text>
        </View>
      ) : null}

      {/* AI Classification */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>AI Classification</Text>
        <View style={styles.aiRow}>
          <Text style={styles.aiLabel}>Category:</Text>
          <Text style={styles.aiValue}>
            {categoryDisplayMap[report.aiClassification.category].label}
          </Text>
        </View>
        <View style={styles.aiRow}>
          <Text style={styles.aiLabel}>Confidence:</Text>
          <Text style={styles.aiValue}>
            {(report.aiClassification.confidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Status Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        {statusOrder.map((status, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isLast = index === statusOrder.length - 1;
          const display = statusDisplayMap[status];
          const historyEntry = report.statusHistory.find(
            (h) => h.newStatus === status,
          );

          return (
            <View key={status} style={styles.timelineItem}>
              <View style={styles.timelineDotCol}>
                <View
                  style={[
                    styles.timelineDot,
                    isCompleted
                      ? { backgroundColor: display.color }
                      : { backgroundColor: Colors.borderLight },
                  ]}
                >
                  {isCompleted && (
                    <MaterialCommunityIcons
                      name="check"
                      size={12}
                      color="#fff"
                    />
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      isCompleted && index < currentStatusIndex
                        ? { backgroundColor: display.color }
                        : { backgroundColor: Colors.borderLight },
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineLabel,
                    !isCompleted && { color: Colors.textLight },
                  ]}
                >
                  {display.label}
                </Text>
                {historyEntry && (
                  <Text style={styles.timelineDate}>
                    {formatDate(historyEntry.timestamp)}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

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
  caseCard: {
    backgroundColor: Colors.cardWhite,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  caseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caseLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  caseId: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
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
  description: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  aiLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  aiValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 48,
  },
  timelineDotCol: {
    width: 28,
    alignItems: 'center',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.md,
  },
  timelineLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  timelineDate: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
