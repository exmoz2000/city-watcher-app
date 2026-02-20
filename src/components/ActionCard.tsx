import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Fonts, Spacing, BorderRadius, Shadows } from '../constants/theme';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  backgroundColor: string;
  onPress: () => void;
}

export default function ActionCard({ title, subtitle, icon, backgroundColor, onPress }: ActionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name={icon as any} size={32} color="#FFFFFF" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  title: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textAlign: 'center',
  },
});
