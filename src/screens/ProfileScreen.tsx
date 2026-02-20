import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../types';
import { mockUser } from '../constants/mockData';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const user = mockUser;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + Spacing.lg },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Profile</Text>

      {/* Avatar + Name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.profile.firstName[0]}
            {user.profile.lastName[0]}
          </Text>
        </View>
        <Text style={styles.fullName}>
          {user.profile.firstName} {user.profile.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Personal Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <ProfileRow
          icon="email-outline"
          label="Email"
          value={user.email}
        />
        <ProfileRow
          icon="phone-outline"
          label="Phone"
          value={user.phoneNumber}
        />
        <ProfileRow
          icon="map-marker-outline"
          label="Address"
          value={user.profile.address ?? 'Not set'}
        />
      </View>

      {/* Emergency Contacts */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {user.profile.emergencyContacts.length === 0 ? (
          <Text style={styles.emptyText}>No emergency contacts added</Text>
        ) : (
          user.profile.emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactRow}>
              <View style={styles.contactIcon}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={Colors.primaryOrange}
                />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactDetail}>
                  {contact.relationship} · {contact.phoneNumber}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Preferences */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.prefLabel}>Notifications</Text>
          </View>
          <Switch
            value={user.preferences.notificationsEnabled}
            trackColor={{
              false: Colors.borderLight,
              true: Colors.primaryOrange + '60',
            }}
            thumbColor={
              user.preferences.notificationsEnabled
                ? Colors.primaryOrange
                : Colors.textLight
            }
          />
        </View>
        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.prefLabel}>Location Sharing</Text>
          </View>
          <Switch
            value={user.preferences.locationSharingEnabled}
            trackColor={{
              false: Colors.borderLight,
              true: Colors.primaryOrange + '60',
            }}
            thumbColor={
              user.preferences.locationSharingEnabled
                ? Colors.primaryOrange
                : Colors.textLight
            }
          />
        </View>
        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <MaterialCommunityIcons
              name="translate"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.prefLabel}>Language</Text>
          </View>
          <Text style={styles.prefValue}>English</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => navigation.navigate('Login')}
      >
        <MaterialCommunityIcons
          name="logout"
          size={20}
          color={Colors.emergencyRed}
        />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.section }} />
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={rowStyles.row}>
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color={Colors.textSecondary}
      />
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  label: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    width: 70,
  },
  value: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  container: {
    paddingHorizontal: Spacing.xl,
  },
  screenTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  fullName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    paddingVertical: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryOrange + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  contactDetail: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  prefValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.emergencyRedLight,
    borderRadius: BorderRadius.button,
    gap: Spacing.sm,
  },
  signOutText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.emergencyRed,
  },
});
