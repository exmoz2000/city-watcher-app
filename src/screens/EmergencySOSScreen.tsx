import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, EmergencyServiceType } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencySOS'>;

const services = [
  {
    type: EmergencyServiceType.POLICE,
    label: 'Police',
    icon: 'shield-account' as const,
    color: '#1565C0',
    number: '10111',
  },
  {
    type: EmergencyServiceType.AMBULANCE,
    label: 'Ambulance',
    icon: 'ambulance' as const,
    color: '#D32F2F',
    number: '10177',
  },
  {
    type: EmergencyServiceType.FIRE,
    label: 'Fire',
    icon: 'fire-truck' as const,
    color: '#EF6C00',
    number: '10177',
  },
];

export default function EmergencySOSScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activeService, setActiveService] = useState<EmergencyServiceType | null>(null);

  const handleEmergencyPress = (type: EmergencyServiceType) => {
    Alert.alert(
      'Confirm Emergency',
      `Are you sure you want to contact ${type} services? Your GPS location will be transmitted immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            setActiveService(type);
            // Mock: In production this would initiate the emergency session
            setTimeout(() => {
              Alert.alert(
                'Connected',
                `Connected to ${type} dispatch. Your location has been transmitted.`,
                [{ text: 'OK', onPress: () => setActiveService(null) }],
              );
            }, 1500);
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.textWhite}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* GPS Status */}
      <View style={styles.gpsCard}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={22}
          color={Colors.successGreen}
        />
        <View style={styles.gpsInfo}>
          <Text style={styles.gpsTitle}>GPS Location Active</Text>
          <Text style={styles.gpsCoords}>-33.9249, 18.4241 (±10m)</Text>
        </View>
        <View style={styles.gpsDot} />
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={20}
          color={Colors.primaryAmber}
        />
        <Text style={styles.warningText}>
          Only use in genuine emergencies. Your location will be shared with
          emergency services immediately.
        </Text>
      </View>

      {/* Service Buttons */}
      <View style={styles.serviceGrid}>
        {services.map((service) => {
          const isActive = activeService === service.type;

          return (
            <TouchableOpacity
              key={service.type}
              style={[
                styles.serviceButton,
                { backgroundColor: service.color },
                isActive && styles.serviceButtonActive,
              ]}
              onPress={() => handleEmergencyPress(service.type)}
              activeOpacity={0.8}
              disabled={activeService !== null}
            >
              <MaterialCommunityIcons
                name={service.icon as any}
                size={48}
                color="#fff"
              />
              <Text style={styles.serviceLabel}>{service.label}</Text>
              <Text style={styles.serviceNumber}>{service.number}</Text>
              {isActive && (
                <View style={styles.connectingBadge}>
                  <Text style={styles.connectingText}>Connecting...</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Fallback */}
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>
          If the app cannot connect, call{' '}
          <Text style={styles.fallbackNumber}>911</Text> directly
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  gpsInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  gpsTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.successGreen,
  },
  gpsCoords: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  gpsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.successGreen,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: 'rgba(247, 183, 49, 0.12)',
    borderRadius: BorderRadius.md,
  },
  warningText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.primaryAmber,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  serviceGrid: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
  },
  serviceButton: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    ...Shadows.cardLarge,
  },
  serviceButtonActive: {
    opacity: 0.7,
  },
  serviceLabel: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: '#fff',
    marginTop: Spacing.sm,
  },
  serviceNumber: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  connectingBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  connectingText: {
    fontSize: Fonts.sizes.xs,
    color: '#fff',
    fontWeight: Fonts.weights.semiBold,
  },
  fallback: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.section,
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  fallbackNumber: {
    fontWeight: Fonts.weights.bold,
    color: Colors.emergencyRed,
  },
});
