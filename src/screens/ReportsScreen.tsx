import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import { useAuth } from '../contexts/AuthContext';
import { getQueueCount } from '../services/offlineQueue';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const filterOptions: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Resolved', value: 'resolved' },
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineCount, setOfflineCount] = useState(0);

  const fetchReports = useCallback(async () => {
    try {
      setError('');
      const data = await api.getReports(user?.email);
      const sorted = data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setReports(sorted);
    } catch {
      setError('Failed to load reports');
    }
  }, [user?.email]);

  const fetchOfflineCount = useCallback(async () => {
    const count = await getQueueCount();
    setOfflineCount(count);
  }, []);

  // Fetch on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchReports();
      await fetchOfflineCount();
      setLoading(false);
    })();
  }, [fetchReports, fetchOfflineCount]);

  // Re-fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchReports();
      fetchOfflineCount();
    }, [fetchReports, fetchOfflineCount]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    await fetchOfflineCount();
    setRefreshing(false);
  };

  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'active')
      return r.status !== ReportStatus.RESOLVED && r.status !== ReportStatus.CLOSED;
    if (activeFilter === 'resolved')
      return r.status === ReportStatus.RESOLVED || r.status === ReportStatus.CLOSED;
    return true;
  });

  const renderReport = ({ item }: { item: Report }) => {
    const statusInfo = statusDisplayMap[item.status];
    const categoryInfo = categoryDisplayMap[item.category];

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() =>
          navigation.navigate('ReportDetail', { reportId: item.id })
        }
      >
        <View style={styles.reportHeader}>
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons
              name={categoryInfo.icon as any}
              size={18}
              color={Colors.primaryOrange}
            />
            <Text style={styles.categoryText}>{categoryInfo.label}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusInfo.color + '20' },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusInfo.color }]}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.reportFooter}>
          <View style={styles.footerItem}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.footerText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
          <Text style={styles.caseId}>{item.caseId}</Text>
        </View>

        <View style={styles.reportMeta}>
          <Text style={styles.metaText}>
            {item.createdAt.toLocaleDateString()}
          </Text>
          {item.assignedTo && (
            <Text style={styles.metaText}>
              Assigned: {item.assignedTo}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Reports</Text>
        <View style={styles.headerRight}>
          {offlineCount > 0 && (
            <View style={styles.offlineBadge}>
              <MaterialCommunityIcons name="cloud-off-outline" size={14} color={Colors.textWhite} />
              <Text style={styles.offlineBadgeText}>{offlineCount}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.newReportButton}
            onPress={() => navigation.navigate('ReportCategory')}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={Colors.textWhite}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              activeFilter === filter.value && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.value && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.emptyText}>
                {error || "No reports yet. Submit your first report!"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  newReportButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emergencyRed,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  offlineBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.section,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryOrange,
    borderColor: Colors.primaryOrange,
  },
  filterText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textWhite,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  reportCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semiBold,
  },
  reportDescription: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  footerText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    flex: 1,
  },
  caseId: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    fontWeight: Fonts.weights.medium,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metaText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
});
