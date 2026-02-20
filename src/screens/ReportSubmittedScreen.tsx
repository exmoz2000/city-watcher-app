import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { categoryDisplayMap } from '../constants/mockData';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportSubmitted'>;

export default function ReportSubmittedScreen({ route, navigation }: Props) {
  const { caseId, category } = route.params;
  const categoryInfo = categoryDisplayMap[category];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <MaterialCommunityIcons name="check" size={64} color={Colors.successGreen} />
        </View>

        <Text style={styles.title}>Report Submitted!</Text>
        <Text style={styles.subtitle}>
          Your {categoryInfo.label.toLowerCase()} report has been received and assigned to{' '}
          {categoryInfo.department}.
        </Text>

        <View style={styles.caseIdCard}>
          <Text style={styles.caseIdLabel}>Your Case ID</Text>
          <Text style={styles.caseIdValue}>{caseId}</Text>
          <Text style={styles.caseIdHint}>Use this to track your report status</Text>
        </View>

        <View style={styles.timelinePreview}>
          <TimelineStep label="Report Received" isActive />
          <TimelineStep label="Under Review" />
          <TimelineStep label="Crew Dispatched" />
          <TimelineStep label="Resolved" />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          }
        >
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('ReportCategory')}
        >
          <Text style={styles.secondaryButtonText}>Report Another Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TimelineStep({ label, isActive }: { label: string; isActive?: boolean }) {
  return (
    <View style={styles.timelineStep}>
      <View
        style={[
          styles.timelineDot,
          isActive && styles.timelineDotActive,
        ]}
      >
        {isActive && (
          <MaterialCommunityIcons name="check" size={12} color={Colors.textWhite} />
        )}
      </View>
      <Text style={[styles.timelineLabel, isActive && styles.timelineLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.successGreen + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  caseIdCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.xxl,
    ...Shadows.card,
  },
  caseIdLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  caseIdValue: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.extraBold,
    color: Colors.primaryOrange,
    marginVertical: Spacing.sm,
  },
  caseIdHint: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  timelinePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  timelineDotActive: {
    backgroundColor: Colors.successGreen,
  },
  timelineLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: Colors.successGreen,
    fontWeight: Fonts.weights.semiBold,
  },
  actions: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  primaryButton: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primaryOrange,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryOrange,
  },
});
