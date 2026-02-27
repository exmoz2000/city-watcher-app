import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, ReportCategory } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportCategory'>;

interface CategoryOption {
  category: ReportCategory;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const categories: CategoryOption[] = [
  {
    category: ReportCategory.POTHOLE,
    label: 'Pothole',
    icon: 'car',
    color: '#F5A623',
    description: 'Road damage, cracks, sinkholes',
  },
  {
    category: ReportCategory.WATER_LEAK,
    label: 'Water Leak',
    icon: 'water',
    color: '#5B9BD5',
    description: 'Pipe bursts, water main breaks',
  },
  {
    category: ReportCategory.POWER_OUTAGE,
    label: 'Power Outage',
    icon: 'flash',
    color: '#E74C3C',
    description: 'No electricity, fallen lines',
  },
  {
    category: ReportCategory.TRAFFIC_LIGHT,
    label: 'Traffic Light',
    icon: 'traffic-light',
    color: '#4CAF50',
    description: 'Broken or malfunctioning signals',
  },
  {
    category: ReportCategory.STREET_LIGHT,
    label: 'Street Light',
    icon: 'lightbulb-outline',
    color: '#FF9800',
    description: 'Broken or flickering lights',
  },
  {
    category: ReportCategory.GARBAGE,
    label: 'Trash / Waste',
    icon: 'delete',
    color: '#795548',
    description: 'Overflowing bins, illegal dumping',
  },
  {
    category: ReportCategory.OTHER,
    label: 'Other Issue',
    icon: 'clipboard-text',
    color: '#9E9E9E',
    description: 'Any other infrastructure issue',
  },
];

export default function ReportCategoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  
  const handleSelect = (category: ReportCategory) => {
    navigation.navigate('ReportForm', { category });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxl }]}
    >
      <Text style={styles.instruction}>
        Select the type of issue you want to report
      </Text>

      <View style={styles.grid}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.category}
            style={styles.categoryCard}
            onPress={() => handleSelect(item.category)}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}
            >
              <MaterialCommunityIcons
                name={item.icon as any}
                size={32}
                color={item.color}
              />
            </View>
            <Text style={styles.categoryLabel}>{item.label}</Text>
            <Text style={styles.categoryDesc}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  content: {
    padding: Spacing.xl,
  },
  instruction: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  categoryDesc: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
