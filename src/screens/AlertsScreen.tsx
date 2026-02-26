import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { RootStackParamList, CommunityAlert, AlertSeverity } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import * as api from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getSeverityStyle(severity: AlertSeverity) {
  switch (severity) {
    case AlertSeverity.CRITICAL:
      return {
        bg: Colors.emergencyRedLight,
        color: Colors.emergencyRed,
        icon: 'alert-circle' as const,
      };
    case AlertSeverity.WARNING:
      return {
        bg: '#FFF3E0',
        color: '#E65100',
        icon: 'alert' as const,
      };
    case AlertSeverity.INFO:
      return {
        bg: '#E3F2FD',
        color: '#1565C0',
        icon: 'information' as const,
      };
  }
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    water_main_break: 'water',
    gas_leak: 'fire',
    road_closure: 'road-variant',
    severe_weather: 'weather-lightning-rainy',
    public_safety: 'shield-alert',
  };
  return icons[category] || 'alert';
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAlerts = useCallback(async () => {
    try {
      setError('');
      let lat: number | undefined;
      let lng: number | undefined;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      } catch {
        // Location unavailable — fetch without geo filter
      }

      const data = await api.getAlerts(lat, lng);
      setAlerts(data);
    } catch {
      setError('Failed to load alerts');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAlerts();
      setLoading(false);
    })();
  }, [fetchAlerts]);

  const renderAlert = ({ item }: { item: CommunityAlert }) => {
    const severityStyle = getSeverityStyle(item.severity);

    return (
      <TouchableOpacity
        style={styles.alertCard}
        onPress={() =>
          navigation.navigate('AlertDetail', { alertId: item.id })
        }
      >
        <View style={styles.alertHeader}>
          <View style={[styles.severityBadge, { backgroundColor: severityStyle.bg }]}>
            <MaterialCommunityIcons
              name={severityStyle.icon}
              size={14}
              color={severityStyle.color}
            />
            <Text style={[styles.severityText, { color: severityStyle.color }]}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={12}
              color={Colors.textSecondary}
            />
            <Text style={styles.timeText}>
              {item.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.alertBody}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: severityStyle.bg },
            ]}
          >
            <MaterialCommunityIcons
              name={getCategoryIcon(item.category) as any}
              size={24}
              color={severityStyle.color}
            />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{item.title}</Text>
            <Text style={styles.alertMessage} numberOfLines={2}>
              {item.message}
            </Text>
          </View>
        </View>

        {item.actionRequired && (
          <View style={styles.actionBar}>
            <MaterialCommunityIcons
              name="information-outline"
              size={14}
              color={Colors.infoBlue}
            />
            <Text style={styles.actionText}>{item.actionRequired}</Text>
          </View>
        )}

        <View style={styles.alertFooter}>
          <Text style={styles.recipientText}>
            {item.recipientCount} residents notified
          </Text>
          {item.isActive && (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Community Alerts</Text>
          <Text style={styles.subtitle}>
            {alerts.filter((a) => a.isActive).length} active alerts in your
            area
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="bell-check-outline"
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.emptyText}>
                {error || 'No alerts at this time'}
              </Text>
              <Text style={styles.emptySubtext}>
                You'll be notified of any alerts in your area
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
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  alertCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  severityText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  alertBody: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  alertTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  alertMessage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBlue + '10',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.infoBlue,
    fontWeight: Fonts.weights.medium,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  recipientText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.successGreen,
  },
  activeText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.successGreen,
    fontWeight: Fonts.weights.medium,
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
  emptySubtext: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.section,
  },
});
