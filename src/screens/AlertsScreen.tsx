import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../types';
import { mockAlerts } from '../constants/mockData';
import { Colors, Fonts, Spacing } from '../constants/theme';
import AlertCard from '../components/AlertCard';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Alerts'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AlertsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Alerts</Text>
        <Text style={styles.count}>
          {mockAlerts.filter((a) => a.isActive).length} active
        </Text>
      </View>

      <FlatList
        data={mockAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onPress={(a) => navigation.navigate('AlertDetail', { alertId: a.id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active alerts</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  count: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  list: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
});
