import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { categoryDisplayMap } from '../constants/mockData';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportSubmitted'>;

export default function ReportSubmittedScreen({ navigation, route }: Props) {
  const { caseId, category } = route.params;
  const catInfo = categoryDisplayMap[category];

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <MaterialCommunityIcons
            name="check-circle"
            size={80}
            color={Colors.successGreen}
          />
        </View>

        <Text style={styles.title}>Report Submitted!</Text>
        <Text style={styles.subtitle}>
          Thank you for keeping our city safe
        </Text>

        {/* Case ID Card */}
        <View style={styles.caseCard}>
          <Text style={styles.caseLabel}>Your Case ID</Text>
          <Text style={styles.caseId}>{caseId}</Text>
          <View style={styles.catRow}>
            <MaterialCommunityIcons
              name={catInfo.icon as any}
              size={16}
              color={Colors.primaryOrange}
            />
            <Text style={styles.catText}>
              {catInfo.label} · {catInfo.department}
            </Text>
          </View>
        </View>

        <Text style={styles.infoText}>
          You'll receive real-time updates as your report progresses through
          review and resolution.
        </Text>
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.navigate('MainTabs', { screen: 'Reports' } as any)
          }
        >
          <Text style={styles.primaryButtonText}>View My Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.navigate('MainTabs', { screen: 'Home' } as any)
          }
        >
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  successCircle: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
  },
  caseCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.xxl,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.xxl,
    ...Shadows.card,
  },
  caseLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caseId: {
    fontSize: Fonts.sizes.hero,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryOrange,
    marginVertical: Spacing.sm,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  catText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  infoText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonSection: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.section,
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: BorderRadius.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  secondaryButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textSecondary,
  },
});
