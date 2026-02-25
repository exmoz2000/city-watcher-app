import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';
import {
  heatmapPoints,
  hotspotAreas,
  heatmapStats,
  HotspotArea,
} from '../constants/heatmapData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CAPE_TOWN_REGION = {
  latitude: -33.9400,
  longitude: 18.4500,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type IssueFilter = 'all' | 'water' | 'potholes' | 'power' | 'traffic';

const filterOptions: { label: string; value: IssueFilter; icon: string }[] = [
  { label: 'All Issues', value: 'all', icon: 'map-marker-multiple' },
  { label: 'Water Leaks', value: 'water', icon: 'water' },
  { label: 'Potholes', value: 'potholes', icon: 'car' },
  { label: 'Power', value: 'power', icon: 'flash' },
  { label: 'Traffic', value: 'traffic', icon: 'traffic-light' },
];

export default function HeatmapScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [activeFilter, setActiveFilter] = useState<IssueFilter>('all');
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotArea | null>(null);

  const handleHotspotPress = (hotspot: HotspotArea) => {
    setSelectedHotspot(hotspot);
    mapRef.current?.animateToRegion(
      {
        ...hotspot.center,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500
    );
  };

  const handleResetView = () => {
    setSelectedHotspot(null);
    mapRef.current?.animateToRegion(CAPE_TOWN_REGION, 500);
  };

  // Get color based on weight
  const getColorForWeight = (weight: number): string => {
    if (weight >= 8) return '#C62828'; // High - dark red
    if (weight >= 6) return '#EF5350'; // Medium-high - red
    if (weight >= 4) return '#FF8A65'; // Medium - orange
    if (weight >= 2) return '#FFB74D'; // Low-medium - light orange
    return '#FFE082'; // Low - yellow
  };

  // Get radius based on weight
  const getRadiusForWeight = (weight: number): number => {
    return weight * 50; // Scale radius by weight
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>City Insights</Text>
          <Text style={styles.subtitle}>Chronic Issue Hotspots · Cape Town</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleResetView}>
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterChip,
              activeFilter === filter.value && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.value)}
          >
            <MaterialCommunityIcons
              name={filter.icon as any}
              size={16}
              color={
                activeFilter === filter.value
                  ? Colors.textWhite
                  : Colors.textSecondary
              }
            />
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
      </ScrollView>

      {/* Map with Heatmap */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={CAPE_TOWN_REGION}
          showsUserLocation={false}
          showsCompass={false}
          showsScale
          mapType="standard"
        >
          {heatmapPoints.map((point, index) => (
            <Circle
              key={`heatpoint-${index}`}
              center={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              radius={getRadiusForWeight(point.weight)}
              fillColor={getColorForWeight(point.weight) + '40'} // 40 = 25% opacity
              strokeColor={getColorForWeight(point.weight)}
              strokeWidth={1}
            />
          ))}
        </MapView>

        {/* Legend overlay */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Hotspot Density</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#C62828' }]} />
            <Text style={styles.legendLabel}>High</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FF8A65' }]} />
            <Text style={styles.legendLabel}>Medium</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#FFE082' }]} />
            <Text style={styles.legendLabel}>Low</Text>
          </View>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="fire" size={16} color={Colors.primaryOrange} />
          <Text style={styles.statValue}>{heatmapStats.frequentIssues}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.successGreen} />
          <Text style={styles.statValue}>{heatmapStats.avgResolutionDays}</Text>
          <Text style={styles.statLabel}>Avg Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.emergencyRed} />
          <Text style={styles.statValue}>{heatmapStats.highRecurrenceZones}</Text>
          <Text style={styles.statLabel}>Zones</Text>
        </View>
      </View>

      {/* Hotspot Cards */}
      <ScrollView
        style={styles.hotspotList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.hotspotListContent}
      >
        <Text style={styles.sectionTitle}>Top Hotspots</Text>
        {hotspotAreas.map((hotspot, index) => (
          <TouchableOpacity
            key={hotspot.name}
            style={[
              styles.hotspotCard,
              selectedHotspot?.name === hotspot.name && styles.hotspotCardSelected,
            ]}
            onPress={() => handleHotspotPress(hotspot)}
          >
            <View style={styles.hotspotRank}>
              <Text style={styles.hotspotRankText}>{index + 1}</Text>
            </View>
            <View style={styles.hotspotInfo}>
              <Text style={styles.hotspotName}>{hotspot.name}</Text>
              <Text style={styles.hotspotIssue}>{hotspot.commonIssue}</Text>
            </View>
            <View style={styles.hotspotStats}>
              <Text style={styles.hotspotCount}>{hotspot.reportCount}</Text>
              <Text style={styles.hotspotCountLabel}>reports</Text>
            </View>
            <View style={styles.hotspotMeta}>
              <Text style={styles.hotspotResolution}>
                {hotspot.avgResolutionDays}d avg
              </Text>
              <Text style={styles.hotspotRecurrence}>
                {hotspot.recurrencePercent}% recurring
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  filterRow: {
    maxHeight: 44,
    marginBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginRight: Spacing.sm,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryOrange,
    borderColor: Colors.primaryOrange,
  },
  filterText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  filterTextActive: {
    color: Colors.textWhite,
  },
  mapContainer: {
    height: 260,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    ...Shadows.cardLarge,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.card,
  },
  legendTitle: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.card,
    ...Shadows.card,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.borderLight,
  },
  hotspotList: {
    flex: 1,
  },
  hotspotListContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  hotspotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  hotspotCardSelected: {
    borderWidth: 2,
    borderColor: Colors.primaryOrange,
  },
  hotspotRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryOrange + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  hotspotRankText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryOrange,
  },
  hotspotInfo: {
    flex: 1,
  },
  hotspotName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  hotspotIssue: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  hotspotStats: {
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  hotspotCount: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.emergencyRed,
  },
  hotspotCountLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  hotspotMeta: {
    alignItems: 'flex-end',
  },
  hotspotResolution: {
    fontSize: Fonts.sizes.xs,
    color: Colors.successGreen,
    fontWeight: Fonts.weights.medium,
  },
  hotspotRecurrence: {
    fontSize: Fonts.sizes.xs,
    color: Colors.statusUnderReview,
    marginTop: 2,
  },
});
