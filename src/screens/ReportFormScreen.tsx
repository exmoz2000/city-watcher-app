import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { categoryDisplayMap } from '../constants/mockData';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportForm'>;

export default function ReportFormScreen({ route, navigation }: Props) {
  const { category } = route.params;
  const categoryInfo = categoryDisplayMap[category];
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleSubmit = () => {
    const caseId = `CW-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    navigation.navigate('ReportSubmitted', { caseId, category });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.categoryHeader}>
          <MaterialCommunityIcons
            name={categoryInfo.icon as any}
            size={24}
            color={Colors.primaryOrange}
          />
          <Text style={styles.categoryLabel}>{categoryInfo.label}</Text>
        </View>

        <TouchableOpacity
          style={styles.photoBox}
          onPress={() => setHasPhoto(true)}
          activeOpacity={0.7}
        >
          {hasPhoto ? (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons name="check-circle" size={48} color={Colors.successGreen} />
              <Text style={styles.photoPlaceholderText}>Photo captured</Text>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialCommunityIcons name="camera-plus" size={48} color={Colors.textLight} />
              <Text style={styles.photoPlaceholderText}>Tap to take a photo</Text>
              <Text style={styles.photoSubtext}>GPS coordinates will be auto-attached</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.locationCard}>
          <MaterialCommunityIcons name="map-marker" size={20} color={Colors.primaryOrange} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Current Location</Text>
            <Text style={styles.locationAddress}>Detecting your location...</Text>
          </View>
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color={Colors.infoBlue} />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !description && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!description}
        >
          <Text style={styles.submitButtonText}>Submit Report</Text>
          <MaterialCommunityIcons name="send" size={20} color={Colors.textWhite} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryOrange + '15',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  categoryLabel: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primaryOrange,
    marginLeft: Spacing.sm,
  },
  photoBox: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  photoSubtext: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  fieldLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  descriptionInput: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
    marginBottom: Spacing.lg,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadows.card,
  },
  locationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  locationTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
  },
  locationAddress: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: Colors.successGreen,
    borderRadius: BorderRadius.button,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.borderMedium,
  },
  submitButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
    marginRight: Spacing.sm,
  },
});
