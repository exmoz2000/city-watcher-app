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
import { AuthError, ApiError, NetworkError } from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await auth.login(email, password);
      navigation.replace('MainTabs');
    } catch (err) {
      if (err instanceof NetworkError) {
        setErrorMessage('No internet connection');
      } else if (err instanceof AuthError) {
        setErrorMessage('Invalid email or password');
      } else if (err instanceof ApiError && err.status === 403) {
        setErrorMessage('Account is deactivated');
      } else if (err instanceof ApiError) {
        setErrorMessage(err.serverMessage || 'Login failed');
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
          <MaterialCommunityIcons
            name="shield-check"
            size={48}
            color={Colors.primaryOrange}
          />
          <Text style={styles.title}>City Watcher</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
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
              autoCorrect={false}
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
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={Colors.emergencyRed} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons
                name="google"
                size={22}
                color={Colors.googleDark}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
            >
              <MaterialCommunityIcons
                name="facebook"
                size={22}
                color={Colors.textWhite}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons
                name="apple"
                size={22}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
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
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    marginBottom: Spacing.xxl,
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
  eyeButton: {
    padding: Spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.xl,
  },
  forgotPasswordText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.linkBlue,
  },
  loginButton: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: BorderRadius.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
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
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.emergencyRed,
    flex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookButton: {
    backgroundColor: Colors.facebookBlue,
    borderColor: Colors.facebookBlue,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.primaryOrange,
  },
});
