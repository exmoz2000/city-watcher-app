import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { categoryDisplayMap } from '../constants/mockData';
import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportForm'>;

export default function ReportFormScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { category } = route.params;
  const catInfo = categoryDisplayMap[category];

  const [description, setDescription] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);

  const handleSubmit = () => {
    const caseId = `CW-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    navigation.navigate('ReportSubmitted', { caseId, category });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={Colors.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{catInfo.label} Report</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Photo Section */}
        <TouchableOpacity
          style={styles.photoArea}
          onPress={() => setPhotoTaken(true)}
          activeOpacity={0.7}
        >
          {photoTaken ? (
            <View style={styles.photoTaken}>
              <MaterialCommunityIcons
                name="check-circle"
                size={48}
                color={Colors.successGreen}
              />
              <Text style={styles.photoTakenText}>Photo captured</Text>
              <Text style={styles.photoTakenSub}>Tap to retake</Text>
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={48}
                color={Colors.textLight}
              />
              <Text style={styles.photoPrompt}>Tap to take a photo</Text>
              <Text style={styles.photoSub}>
                GPS coordinates will be attached automatically
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={Colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={Colors.successGreen}
            />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>
                Current location detected
              </Text>
              <Text style={styles.locationCoords}>
                -33.9249, 18.4241 (±10m)
              </Text>
            </View>
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={20}
              color={Colors.linkBlue}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.card}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            <MaterialCommunityIcons
              name={catInfo.icon as any}
              size={20}
              color={Colors.primaryOrange}
            />
            <Text style={styles.categoryText}>{catInfo.label}</Text>
            <Text style={styles.deptText}>{catInfo.department}</Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !description && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!description}
        >
          <MaterialCommunityIcons name="send" size={20} color="#fff" />
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.section }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  container: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  photoArea: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    minHeight: 180,
  },
  photoPrompt: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  photoSub: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  photoTaken: {
    alignItems: 'center',
  },
  photoTakenText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.successGreen,
    marginTop: Spacing.md,
  },
  photoTakenSub: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.cardWhite,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  textArea: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
    padding: 0,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  deptText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: 'auto',
  },
  submitButton: {
    backgroundColor: Colors.successGreen,
    borderRadius: BorderRadius.button,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadows.button,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
  },
});
