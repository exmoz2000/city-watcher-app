import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
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
import { useAuth } from '../contexts/AuthContext';
import { ApiError, NetworkError } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const auth = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
    setErrorMessage('');
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await auth.register({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
      });
      navigation.replace('MainTabs');
    } catch (err) {
      if (err instanceof NetworkError) {
        setErrorMessage('No internet connection');
      } else if (err instanceof ApiError && err.status === 409) {
        setErrorMessage('Email already registered');
      } else if (err instanceof ApiError && err.status === 400) {
        setErrorMessage(err.serverMessage || 'Please check your input');
      } else if (err instanceof ApiError) {
        setErrorMessage(err.serverMessage || 'Registration failed');
      } else {
        setErrorMessage('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join City Watcher to report issues and stay informed
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={styles.input}
                placeholder="First name"
                placeholderTextColor={Colors.textLight}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor={Colors.textLight}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={Colors.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={Colors.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={[styles.signUpButton, loading && styles.signUpButtonDisabled]} onPress={handleSignUp} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.emergencyRed} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCream,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.section,
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    marginBottom: Spacing.xxl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
  },
  signUpButton: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: BorderRadius.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    ...Shadows.button,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textWhite,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.emergencyRed + '10',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.emergencyRed,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primaryOrange,
  },
});
