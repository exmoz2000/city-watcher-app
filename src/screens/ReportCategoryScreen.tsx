import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, ReportCategory } from '../types';
import { categoryDisplayMap } from '../constants/mockData';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportCategory'>;

const categories = Object.values(ReportCategory).map((key) => ({
  key,
  ...categoryDisplayMap[key],
}));

export default function ReportCategoryScreen({ navigation }: Props) {
  const renderItem = ({ item }: { item: (typeof categories)[number] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ReportForm', { category: item.key })}
      activeOpacity={0.7}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={item.icon as any} size={30} color={Colors.primaryOrange} />
      </View>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.dept}>{item.department}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>What would you like to report?</Text>
      <Text style={styles.headerSubtitle}>Select a category that best describes the issue</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  grid: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.section,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    ...Shadows.card,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  dept: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
