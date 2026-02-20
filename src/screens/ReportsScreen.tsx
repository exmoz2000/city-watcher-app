import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ReportStatus, Report } from '../types';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import { mockReports, mockUser } from '../constants/mockData';
import ReportCard from '../components/ReportCard';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type FilterTab = 'all' | 'active' | 'resolved';

const filterTabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'resolved', label: 'Resolved' },
];

export default function ReportsScreen() {
  const navigation = useNavigation<NavProp>();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const userReports = mockReports.filter((r) => r.userId === mockUser.id);

  const filteredReports = userReports.filter((report) => {
    if (activeFilter === 'active') {
      return report.status !== ReportStatus.RESOLVED && report.status !== ReportStatus.CLOSED;
    }
    if (activeFilter === 'resolved') {
      return report.status === ReportStatus.RESOLVED || report.status === ReportStatus.CLOSED;
    }
    return true;
  });

  const renderItem = ({ item }: { item: Report }) => (
    <ReportCard
      report={item}
      onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {filterTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text
              style={[styles.filterText, activeFilter === tab.key && styles.filterTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundWhite,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryOrange,
    borderColor: Colors.primaryOrange,
  },
  filterText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  filterTextActive: {
    color: Colors.textWhite,
    fontWeight: Fonts.weights.bold,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.section,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.section,
  },
  emptyText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textSecondary,
  },
});
