import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { categoryDisplayMap } from '../constants/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportSubmitted'>;

export default function ReportSubmittedScreen({ route, navigation }: Props) {
  const { caseId, category } = route.params;
  const categoryInfo = categoryDisplayMap[category];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <MaterialCommunityIcons
            name="check-circle"
            size={80}
            color={Colors.successGreen}
          />
        </View>

        <Text style={styles.title}>Report Submitted!</Text>
        <Text style={styles.subtitle}>
          Your report has been received and will be reviewed shortly.
        </Text>

        <View style={styles.caseCard}>
          <Text style={styles.caseLabel}>Tracking ID</Text>
          <Text style={styles.caseId}>{caseId}</Text>
          <View style={styles.categoryRow}>
            <MaterialCommunityIcons
              name={categoryInfo.icon as any}
              size={16}
              color={Colors.primaryOrange}
            />
            <Text style={styles.categoryText}>{categoryInfo.label}</Text>
          </View>
          <Text style={styles.departmentText}>
            Routed to: {categoryInfo.department}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={20}
            color={Colors.infoBlue}
          />
          <Text style={styles.infoText}>
            You'll receive push notifications as your report progresses through
            each stage.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.viewButtonText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.anotherButton}
          onPress={() => navigation.navigate('ReportCategory')}
        >
          <Text style={styles.anotherButtonText}>Report Another Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  successIcon: {
    marginBottom: Spacing.xl,
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
    marginBottom: Spacing.xxl,
    lineHeight: 22,
  },
  caseCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  caseLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  caseId: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryOrange,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  departmentText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBlue + '10',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.infoBlue,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.section,
    gap: Spacing.md,
  },
  viewButton: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: BorderRadius.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  viewButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textWhite,
  },
  anotherButton: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  anotherButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
});
