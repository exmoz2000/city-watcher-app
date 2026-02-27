import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { categoryDisplayMap } from '../constants/mockData';
import * as api from '../services/api';
import { NetworkError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { enqueueReport } from '../services/offlineQueue';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportForm'>;

export default function ReportFormScreen({ route, navigation }: Props) {
  const { category } = route.params;
  const categoryInfo = categoryDisplayMap[category];
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Get current location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocation({
            lat: -33.9249,
            lng: 18.4241,
            address: 'Location permission denied',
          });
          setLocationLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Reverse geocode to get address
        const [address] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const addressString = address
          ? `${address.street || ''} ${address.name || ''}, ${address.city || 'Cape Town'}`.trim()
          : 'Current Location';

        setLocation({
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
          address: addressString,
        });
      } catch (error) {
        console.error('Location error:', error);
        setLocation({
          lat: -33.9249,
          lng: 18.4241,
          address: 'Unable to get location',
        });
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const handleTakePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Disable built-in editing
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Error', 'Waiting for location...');
      return;
    }

    setLoading(true);
    const payload = {
      category,
      title: `${categoryInfo.label} Report`,
      description,
      priority: 'medium',
      locationAddress: location.address,
      locationLat: location.lat,
      locationLng: location.lng,
      citizenName: user ? `${user.profile.firstName} ${user.profile.lastName}` : undefined,
      citizenPhone: user?.phoneNumber || undefined,
      citizenEmail: user?.email || undefined,
    };

    try {
      const report = await api.createReport(payload);

      // Upload photo if attached
      if (photoUri) {
        try {
          await api.uploadPhoto(report.id, photoUri);
        } catch {
          // Photo upload failed but report was created — continue
        }
      }

      navigation.navigate('ReportSubmitted', { caseId: report.caseId, category });
    } catch (err) {
      if (err instanceof NetworkError) {
        // Enqueue for offline submission
        const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        await enqueueReport({
          id,
          payload,
          photoUri,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        Alert.alert('Saved Offline', 'Your report has been saved and will be submitted when you are back online.');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to submit report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = description.trim().length >= 10 && !locationLoading && location !== null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xxxl }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Category Badge */}
      <View style={styles.categoryBadge}>
        <MaterialCommunityIcons
          name={categoryInfo.icon as any}
          size={20}
          color={Colors.primaryOrange}
        />
        <Text style={styles.categoryText}>{categoryInfo.label}</Text>
      </View>

      {/* Photo Section */}
      <Text style={styles.sectionLabel}>Photo</Text>
      {photoUri ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={() => setPhotoUri(undefined)}
            >
              <MaterialCommunityIcons name="delete" size={20} color={Colors.emergencyRed} />
              <Text style={styles.photoActionText}>Remove</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoActionButton, styles.photoActionButtonPrimary]}
              onPress={handleTakePhoto}
            >
              <MaterialCommunityIcons name="camera-retake" size={20} color={Colors.textWhite} />
              <Text style={[styles.photoActionText, styles.photoActionTextWhite]}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          <View style={styles.photoPlaceholder}>
            <MaterialCommunityIcons
              name="camera-plus"
              size={40}
              color={Colors.textSecondary}
            />
            <Text style={styles.photoText}>Take a photo of the issue</Text>
            <Text style={styles.photoHint}>GPS coordinates will be auto-tagged</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Description */}
      <Text style={styles.sectionLabel}>Description</Text>
      <View style={styles.textAreaContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{description.length}/500</Text>
      </View>

      {/* Location */}
      <Text style={styles.sectionLabel}>Location</Text>
      <View style={styles.locationCard}>
        {locationLoading ? (
          <>
            <ActivityIndicator size="small" color={Colors.primaryOrange} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>Getting your location...</Text>
            </View>
          </>
        ) : location ? (
          <>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color={Colors.emergencyRed}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>{location.address}</Text>
              <Text style={styles.locationCoords}>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={Colors.successGreen}
            />
          </>
        ) : (
          <>
            <MaterialCommunityIcons
              name="map-marker-off"
              size={24}
              color={Colors.textSecondary}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>Location unavailable</Text>
            </View>
          </>
        )}
      </View>

      {/* Department */}
      <View style={styles.departmentCard}>
        <MaterialCommunityIcons
          name="office-building"
          size={20}
          color={Colors.infoBlue}
        />
        <View style={styles.departmentInfo}>
          <Text style={styles.departmentLabel}>Routed to</Text>
          <Text style={styles.departmentValue}>{categoryInfo.department}</Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, (!canSubmit || loading) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textWhite} />
        ) : (
          <>
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={Colors.textWhite}
            />
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  content: {
    padding: Spacing.xl,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryOrange + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  categoryText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primaryOrange,
  },
  sectionLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  photoButton: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoContainer: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  photoPreview: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  photoActions: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.backgroundCream,
    gap: Spacing.xs,
  },
  photoActionButtonPrimary: {
    backgroundColor: Colors.primaryOrange,
  },
  photoActionText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  photoActionTextWhite: {
    color: Colors.textWhite,
  },
  photoText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  photoHint: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  textAreaContainer: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  textArea: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: 'right',
    marginTop: Spacing.sm,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  locationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  locationAddress: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  locationCoords: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  departmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoBlue + '10',
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  departmentInfo: {
    flex: 1,
  },
  departmentLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  departmentValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.infoBlue,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successGreen,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.button,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.borderMedium,
  },
  submitButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textWhite,
  },
});
