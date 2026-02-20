import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { mockUser, mockReports } from '../constants/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const userReports = mockReports.filter((r) => r.userId === mockUser.id);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + Spacing.lg }}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {mockUser.profile.firstName[0]}
            {mockUser.profile.lastName[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {mockUser.profile.firstName} {mockUser.profile.lastName}
        </Text>
        <Text style={styles.email}>{mockUser.email}</Text>
        <Text style={styles.phone}>{mockUser.phoneNumber}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{userReports.length}</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {userReports.filter((r) => r.status === 'resolved').length}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {userReports.filter(
              (r) => r.status !== 'resolved' && r.status !== 'closed'
            ).length}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {mockUser.profile.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <MaterialCommunityIcons
                name="account-heart"
                size={24}
                color={Colors.emergencyRed}
              />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
              <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
            </View>
            <TouchableOpacity>
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addContactButton}>
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={20}
            color={Colors.linkBlue}
          />
          <Text style={styles.addContactText}>Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={20}
                color={Colors.textPrimary}
              />
              <Text style={styles.preferenceLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={mockUser.preferences.notificationsEnabled}
              trackColor={{
                false: Colors.borderLight,
                true: Colors.successGreen + '60',
              }}
              thumbColor={
                mockUser.preferences.notificationsEnabled
                  ? Colors.successGreen
                  : Colors.textLight
              }
            />
          </View>

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color={Colors.textPrimary}
              />
              <Text style={styles.preferenceLabel}>Location Sharing</Text>
            </View>
            <Switch
              value={mockUser.preferences.locationSharingEnabled}
              trackColor={{
                false: Colors.borderLight,
                true: Colors.successGreen + '60',
              }}
              thumbColor={
                mockUser.preferences.locationSharingEnabled
                  ? Colors.successGreen
                  : Colors.textLight
              }
            />
          </View>

          <TouchableOpacity style={styles.preferenceRow}>
            <View style={styles.preferenceInfo}>
              <MaterialCommunityIcons
                name="translate"
                size={20}
                color={Colors.textPrimary}
              />
              <Text style={styles.preferenceLabel}>Language</Text>
            </View>
            <View style={styles.preferenceValue}>
              <Text style={styles.preferenceValueText}>English</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={Colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <View style={styles.menuCard}>
          {[
            { icon: 'help-circle-outline', label: 'Help & Support' },
            { icon: 'shield-lock-outline', label: 'Privacy Policy' },
            { icon: 'file-document-outline', label: 'Terms of Service' },
            { icon: 'information-outline', label: 'About City Watcher' },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuRow}>
              <MaterialCommunityIcons
                name={item.icon as any}
                size={20}
                color={Colors.textPrimary}
              />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
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
      </View>

      <Text style={styles.version}>City Watcher v1.0.0</Text>
      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
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
    ...Shadows.card,
  },
  avatarText: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  name: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  phone: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  statNumber: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryOrange,
  },
  statLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.emergencyRedLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  contactRelation: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  contactPhone: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  addContactText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.linkBlue,
    fontWeight: Fonts.weights.medium,
  },
  preferenceCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    ...Shadows.card,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  preferenceLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
  },
  preferenceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  preferenceValueText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  menuCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    ...Shadows.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.emergencyRedLight,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  signOutText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.emergencyRed,
  },
  version: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
