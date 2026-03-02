import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { RootStackParamList, EmergencyServiceType } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencySOS'>;

interface EmergencyOption {
  type: EmergencyServiceType;
  label: string;
  icon: string;
  color: string;
  number: string;
}

const emergencyOptions: EmergencyOption[] = [
  {
    type: EmergencyServiceType.POLICE,
    label: 'Police',
    icon: 'shield-account',
    color: '#1565C0',
    number: '10111',
  },
  {
    type: EmergencyServiceType.AMBULANCE,
    label: 'Ambulance',
    icon: 'ambulance',
    color: '#E74C3C',
    number: '10177',
  },
  {
    type: EmergencyServiceType.FIRE,
    label: 'Fire',
    icon: 'fire-truck',
    color: '#FF6F00',
    number: '10177',
  },
];

export default function EmergencySOSScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [activating, setActivating] = useState<EmergencyServiceType | null>(
    null
  );
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('Fetching location...');
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied');
          setLocationAddress('Location permission required');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);

        // Reverse geocode to get address
        const addresses = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (addresses && addresses.length > 0) {
          const addr = addresses[0];
          const addressParts = [
            addr.street,
            addr.subregion || addr.district,
            addr.city,
          ].filter(Boolean);
          setLocationAddress(addressParts.join(', ') || 'Address unavailable');
        } else {
          setLocationAddress('Address unavailable');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Unable to get location');
        setLocationAddress('Location unavailable');
      }
    })();
  }, []);

  const handleEmergency = (option: EmergencyOption) => {
    Alert.alert(
      `Contact ${option.label}?`,
      `This will send your GPS location to ${option.label} dispatch and initiate an emergency session.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${option.label}`,
          style: 'destructive',
          onPress: () => {
            setActivating(option.type);
            // Mock: simulate connection
            setTimeout(() => {
              setActivating(null);
              Alert.alert(
                'Connected',
                `Emergency session established with ${option.label}. Your location has been transmitted.`,
                [{ text: 'OK' }]
              );
            }, 2000);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.emergencyRed}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
      </View>

      {/* Warning Banner */}
      <View style={styles.warningBanner}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={20}
          color={Colors.emergencyRed}
        />
        <Text style={styles.warningText}>
          Only use in genuine emergencies. Your GPS location will be shared.
        </Text>
      </View>

      {/* Location Status */}
      <View style={styles.locationCard}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={24}
          color={locationError ? Colors.emergencyRed : Colors.successGreen}
        />
        <View style={styles.locationInfo}>
          <Text style={styles.locationLabel}>YOUR CURRENT LOCATION</Text>
          {location ? (
            <>
              <Text style={styles.locationAddress}>{locationAddress}</Text>
              <Text style={styles.locationCoords}>
                {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)} · GPS Active
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.locationAddress}>{locationAddress}</Text>
              {!locationError && (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 4 }} />
              )}
            </>
          )}
        </View>
      </View>

      {/* Emergency Buttons */}
      <View style={styles.buttonsContainer}>
        {emergencyOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.emergencyButton,
              { backgroundColor: option.color },
              activating === option.type && styles.emergencyButtonActive,
            ]}
            onPress={() => handleEmergency(option)}
            disabled={activating !== null}
            accessibilityLabel={`Emergency ${option.label}`}
            accessibilityHint={`Double tap to contact ${option.label} services`}
            accessibilityRole="button"
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconContainer}>
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={40}
                  color={Colors.textWhite}
                />
              </View>
              <Text style={styles.buttonLabel}>{option.label}</Text>
              <Text style={styles.buttonNumber}>{option.number}</Text>
            </View>
            {activating === option.type && (
              <View style={styles.connectingOverlay}>
                <Text style={styles.connectingText}>Connecting...</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Pressing a button will immediately transmit your GPS coordinates to the
          selected emergency service dispatcher.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.emergencyRedLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.emergencyRed,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.emergencyRed,
    lineHeight: 18,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    ...Shadows.card,
  },
  locationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  locationLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  locationCoords: {
    fontSize: Fonts.sizes.xs,
    color: Colors.successGreen,
    marginTop: 2,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  emergencyButton: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    minHeight: 100,
    ...Shadows.cardLarge,
  },
  emergencyButtonActive: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    flex: 1,
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
    marginLeft: Spacing.lg,
  },
  buttonNumber: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius.xl,
  },
  connectingText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.section,
  },
  footerText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
