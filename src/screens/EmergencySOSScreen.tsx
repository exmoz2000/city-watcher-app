import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, EmergencyServiceType } from '../types';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EmergencySOS'>;

const services = [
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
    color: '#E53935',
    number: '10177',
  },
  {
    type: EmergencyServiceType.FIRE,
    label: 'Fire',
    icon: 'fire-truck',
    color: '#EF6C00',
    number: '10177',
  },
];

export default function EmergencySOSScreen({ navigation }: Props) {
  const [activeService, setActiveService] = useState<EmergencyServiceType | null>(null);

  const handlePress = (service: (typeof services)[number]) => {
    Alert.alert(
      `Contact ${service.label}?`,
      `This will transmit your GPS location and connect you to ${service.label} services.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${service.label}`,
          style: 'destructive',
          onPress: () => setActiveService(service.type),
        },
      ],
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'End Emergency?',
      'Are you sure you want to end this emergency session?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, End Session',
          style: 'destructive',
          onPress: () => setActiveService(null),
        },
      ],
    );
  };

  if (activeService) {
    const service = services.find((s) => s.type === activeService)!;
    return (
      <View style={[styles.container, { backgroundColor: service.color }]}>
        <View style={styles.activeSession}>
          <View style={styles.pulseCircle}>
            <MaterialCommunityIcons name={service.icon as any} size={64} color="#FFFFFF" />
          </View>
          <Text style={styles.activeTitle}>Connecting to {service.label}...</Text>
          <Text style={styles.activeSubtitle}>Your GPS location is being transmitted</Text>

          <View style={styles.locationCard}>
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color={Colors.successGreen} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <Text style={styles.locationValue}>-33.9249, 18.4241</Text>
              <Text style={styles.locationAccuracy}>Accuracy: ±10m</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>End Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="alert-circle" size={40} color={Colors.emergencyRed} />
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <Text style={styles.headerSubtitle}>
          Select a service below. Your GPS location will be automatically transmitted.
        </Text>
      </View>

      <View style={styles.serviceGrid}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.type}
            style={[styles.serviceButton, { backgroundColor: service.color }]}
            onPress={() => handlePress(service)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={service.icon as any} size={48} color="#FFFFFF" />
            <Text style={styles.serviceLabel}>{service.label}</Text>
            <Text style={styles.serviceNumber}>{service.number}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.gpsStatus}>
        <MaterialCommunityIcons name="crosshairs-gps" size={18} color={Colors.successGreen} />
        <Text style={styles.gpsText}>GPS Active · Location ready to transmit</Text>
      </View>

      <Text style={styles.disclaimer}>
        In a life-threatening emergency, please also call 112 or your local emergency number
        directly.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.extraBold,
    color: Colors.emergencyRed,
    marginTop: Spacing.md,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  serviceGrid: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
    ...Shadows.cardLarge,
  },
  serviceLabel: {
    flex: 1,
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    marginLeft: Spacing.lg,
  },
  serviceNumber: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.medium,
    color: 'rgba(255,255,255,0.8)',
  },
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  gpsText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.successGreen,
    fontWeight: Fonts.weights.medium,
    marginLeft: Spacing.xs,
  },
  disclaimer: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
  // Active session styles
  activeSession: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  activeTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  activeSubtitle: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.xxl,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.xxl,
  },
  locationInfo: {
    marginLeft: Spacing.md,
  },
  locationLabel: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  locationValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    marginTop: 2,
  },
  locationAccuracy: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
  },
  cancelButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
  },
});
