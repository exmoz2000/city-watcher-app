import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ReportCategory } from '../types';
import { categoryDisplayMap } from '../constants/mockData';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportCategory'>;

const categories = Object.values(ReportCategory);

const categoryColors: Record<ReportCategory, string> = {
  [ReportCategory.POTHOLE]: '#FF9800',
  [ReportCategory.WATER_LEAK]: '#2196F3',
  [ReportCategory.POWER_OUTAGE]: '#FFC107',
  [ReportCategory.TRAFFIC_LIGHT]: '#F44336',
  [ReportCategory.STREET_LIGHT]: '#9C27B0',
  [ReportCategory.GARBAGE]: '#4CAF50',
  [ReportCategory.OTHER]: '#607D8B',
};

export default function ReportCategoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
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
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>
        What type of issue would you like to report?
      </Text>

      <View style={styles.grid}>
        {categories.map((category) => {
          const info = categoryDisplayMap[category];
          const color = categoryColors[category];

          return (
            <TouchableOpacity
              key={category}
              style={styles.categoryCard}
              onPress={() =>
                navigation.navigate('ReportForm', { category })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
                <MaterialCommunityIcons
                  name={info.icon as any}
                  size={28}
                  color={color}
                />
              </View>
              <Text style={styles.categoryLabel}>{info.label}</Text>
              <Text style={styles.categoryDept}>{info.department}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  categoryLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  categoryDept: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
