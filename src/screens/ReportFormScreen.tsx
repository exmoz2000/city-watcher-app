import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      category,
      title: `${categoryInfo.label} Report`,
      description,
      priority: 'medium',
      locationAddress: 'Current Location (GPS)',
      locationLat: -33.9249,
      locationLng: 18.4241,
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

  const canSubmit = description.trim().length >= 10;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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
      <TouchableOpacity
        style={styles.photoButton}
        onPress={() => setHasPhoto(true)}
      >
        {hasPhoto ? (
          <View style={styles.photoPlaceholder}>
            <MaterialCommunityIcons
              name="check-circle"
              size={40}
              color={Colors.successGreen}
            />
            <Text style={styles.photoText}>Photo captured</Text>
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialCommunityIcons
              name="camera-plus"
              size={40}
              color={Colors.textSecondary}
            />
            <Text style={styles.photoText}>Take a photo of the issue</Text>
            <Text style={styles.photoHint}>GPS coordinates will be auto-tagged</Text>
          </View>
        )}
      </TouchableOpacity>

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
        <MaterialCommunityIcons
          name="map-marker"
          size={24}
          color={Colors.emergencyRed}
        />
        <View style={styles.locationInfo}>
          <Text style={styles.locationAddress}>
            Current Location (GPS)
          </Text>
          <Text style={styles.locationCoords}>
            -33.9249, 18.4241 · Accuracy: 10m
          </Text>
        </View>
        <MaterialCommunityIcons
          name="check-circle"
          size={20}
          color={Colors.successGreen}
        />
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
