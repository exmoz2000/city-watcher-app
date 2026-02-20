import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';
import { mockUser } from '../constants/mockData';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isToggle,
  toggleValue,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isToggle?: boolean;
  toggleValue?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} disabled={isToggle}>
      <MaterialCommunityIcons name={icon as any} size={22} color={Colors.textSecondary} />
      <Text style={styles.settingsLabel}>{label}</Text>
      {isToggle ? (
        <Switch
          value={toggleValue}
          trackColor={{ true: Colors.primaryOrange, false: Colors.borderLight }}
          thumbColor={Colors.backgroundWhite}
        />
      ) : (
        <View style={styles.settingsRight}>
          {value && <Text style={styles.settingsValue}>{value}</Text>}
          <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textLight} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
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

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {mockUser.profile.emergencyContacts.map((contact, index) => (
          <View key={index} style={styles.contactRow}>
            <MaterialCommunityIcons name="account-heart" size={20} color={Colors.emergencyRed} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactDetail}>
                {contact.relationship} · {contact.phoneNumber}
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={18} color={Colors.primaryOrange} />
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <SettingsRow
          icon="bell-outline"
          label="Notifications"
          isToggle
          toggleValue={mockUser.preferences.notificationsEnabled}
        />
        <SettingsRow
          icon="map-marker-outline"
          label="Location Sharing"
          isToggle
          toggleValue={mockUser.preferences.locationSharingEnabled}
        />
        <SettingsRow icon="translate" label="Language" value="English" />
        <SettingsRow icon="shield-lock-outline" label="Privacy & Security" />
        <SettingsRow icon="help-circle-outline" label="Help & Support" />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
      >
        <MaterialCommunityIcons name="logout" size={20} color={Colors.emergencyRed} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.section,
  },
  profileCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  name: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  phone: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  contactInfo: {
    marginLeft: Spacing.md,
  },
  contactName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  contactDetail: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addButtonText: {
    fontSize: Fonts.sizes.md,
    color: Colors.primaryOrange,
    fontWeight: Fonts.weights.medium,
    marginLeft: Spacing.xs,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingsLabel: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.emergencyRedLight,
    borderRadius: BorderRadius.button,
    marginTop: Spacing.sm,
  },
  logoutText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.emergencyRed,
    marginLeft: Spacing.sm,
  },
});
