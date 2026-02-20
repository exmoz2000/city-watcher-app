import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CommunityAlert } from '../types';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { mockAlerts } from '../constants/mockData';
import AlertCard from '../components/AlertCard';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function AlertsScreen() {
  const navigation = useNavigation<NavProp>();

  const renderItem = ({ item }: { item: CommunityAlert }) => (
    <AlertCard
      alert={item}
      onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.headerText}>
            {mockAlerts.filter((a) => a.isActive).length} active alert(s) in your area
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No alerts at this time</Text>
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
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.section,
  },
  headerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
