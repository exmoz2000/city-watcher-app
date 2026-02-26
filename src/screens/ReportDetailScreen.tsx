import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList, Report, ReportStatus } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import {
  statusDisplayMap,
  categoryDisplayMap,
} from '../constants/mockData';
import * as api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

const POLL_INTERVAL = 30000; // 30 seconds

const STATUS_ORDER: ReportStatus[] = [
  ReportStatus.RECEIVED,
  ReportStatus.UNDER_REVIEW,
  ReportStatus.CREW_DISPATCHED,
  ReportStatus.IN_PROGRESS,
  ReportStatus.RESOLVED,
];

export default function ReportDetailScreen({ route }: Props) {
  const { reportId } = route.params;
  const isFocused = useIsFocused();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = useCallback(async () => {
    try {
      const data = await api.getReportById(reportId);
      setReport(data);
      setError('');
    } catch {
      if (!report) setError('Failed to load report');
    }
  }, [reportId]);

  // Initial fetch
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchReport();
      setLoading(false);
    })();
  }, [fetchReport]);

  // Polling while screen is focused
  useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => {
      fetchReport();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isFocused, fetchReport]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primaryOrange} />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error || 'Report not found'}</Text>
      </View>
    );
  }

  const statusInfo = statusDisplayMap[report.status];
  const categoryInfo = categoryDisplayMap[report.category];
  const currentStatusIndex = STATUS_ORDER.indexOf(report.status);

  return (
    <ScrollView style={styles.container}>
      {/* Case Header */}
      <View style={styles.caseHeader}>
        <Text style={styles.caseId}>{report.caseId}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.color + '20' },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: statusInfo.color }]}
          />
          <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* Category & Priority */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <View style={styles.categoryRow}>
              <MaterialCommunityIcons
                name={categoryInfo.icon as any}
                size={18}
                color={Colors.primaryOrange}
              />
              <Text style={styles.infoValue}>{categoryInfo.label}</Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Priority</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    report.priority === 'critical'
                      ? Colors.emergencyRed
                      : report.priority === 'high'
                        ? Colors.primaryOrange
                        : Colors.textPrimary,
                },
              ]}
            >
              {report.priority.charAt(0).toUpperCase() +
                report.priority.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{categoryInfo.department}</Text>
          </View>
          {report.assignedTo && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Assigned To</Text>
              <Text style={styles.infoValue}>{report.assignedTo}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{report.description}</Text>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.locationCard}>
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={Colors.emergencyRed}
          />
          <View style={styles.locationInfo}>
            <Text style={styles.locationAddress}>{report.address}</Text>
            <Text style={styles.locationCoords}>
              {report.location.latitude.toFixed(4)},{' '}
              {report.location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      </View>

      {/* AI Classification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Classification</Text>
        <View style={styles.aiCard}>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>Detected Category</Text>
            <Text style={styles.aiValue}>
              {categoryDisplayMap[report.aiClassification.category].label}
            </Text>
          </View>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                {
                  width: `${report.aiClassification.confidence * 100}%`,
                  backgroundColor:
                    report.aiClassification.confidence >= 0.75
                      ? Colors.successGreen
                      : Colors.primaryOrange,
                },
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>
            {(report.aiClassification.confidence * 100).toFixed(0)}% confidence
          </Text>
        </View>
      </View>

      {/* Status Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.timeline}>
          {STATUS_ORDER.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const info = statusDisplayMap[status];
            const historyEntry = report.statusHistory.find(
              (h) => h.newStatus === status
            );

            return (
              <View key={status} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCompleted && {
                        backgroundColor: info.color,
                        borderColor: info.color,
                      },
                      isCurrent && styles.timelineDotCurrent,
                    ]}
                  >
                    {isCompleted && (
                      <MaterialCommunityIcons
                        name="check"
                        size={12}
                        color={Colors.textWhite}
                      />
                    )}
                  </View>
                  {index < STATUS_ORDER.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && { backgroundColor: info.color },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelActive,
                      isCurrent && styles.timelineLabelCurrent,
                    ]}
                  >
                    {info.label}
                  </Text>
                  {historyEntry && (
                    <Text style={styles.timelineDate}>
                      {historyEntry.timestamp.toLocaleString()}
                    </Text>
                  )}
                  {historyEntry?.message && (
                    <Text style={styles.timelineMessage}>
                      {historyEntry.message}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Feedback (if resolved) */}
      {report.status === ReportStatus.RESOLVED && !report.userFeedback && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.feedbackButton}>
            <MaterialCommunityIcons
              name="star-outline"
              size={20}
              color={Colors.textWhite}
            />
            <Text style={styles.feedbackButtonText}>Leave Feedback</Text>
          </TouchableOpacity>
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
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.section,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  caseId: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
  },
  infoCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    marginHorizontal: Spacing.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  locationInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  locationAddress: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  locationCoords: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  aiLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  aiValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginBottom: Spacing.xs,
  },
  confidenceFill: {
    height: 6,
    borderRadius: 3,
  },
  confidenceText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  timeline: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCurrent: {
    borderWidth: 3,
  },
  timelineLine: {
    flex: 1,
    width: 2,
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
    fontWeight: Fonts.weights.medium,
  },
  timelineLabelActive: {
    color: Colors.textPrimary,
  },
  timelineLabelCurrent: {
    fontWeight: Fonts.weights.bold,
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
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successGreen,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  feedbackButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textWhite,
  },
});
