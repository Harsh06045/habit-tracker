import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, register } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('Saboor');
  const [email, setEmail] = useState('saboor@habittracker.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter email and password');
      return;
    }
    if (isRegistering && !name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigation.navigate('MainTabs');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccount = (demoEmail: string, demoPass: string, demoName?: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (demoName) setName(demoName);
    setErrorMsg('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons color="#FF6B00" name={isRegistering ? 'person-add' : 'shield-checkmark'} size={32} />
            </View>
            <Text style={styles.title}>{isRegistering ? 'Create an account' : 'Welcome back'}</Text>
            <Text style={styles.subtitle}>
              {isRegistering
                ? 'Sign up to sync your habits, track streaks, and back up your routine across devices.'
                : 'Sign in to manage your morning routine, track habits, and view insights.'}
            </Text>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setIsRegistering(false);
                setErrorMsg('');
              }}
              style={[styles.tabButton, !isRegistering && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, !isRegistering && styles.tabButtonTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setIsRegistering(true);
                setErrorMsg('');
              }}
              style={[styles.tabButton, isRegistering && styles.tabButtonActive]}
            >
              <Text style={[styles.tabButtonText, isRegistering && styles.tabButtonTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons color={theme.colors.danger} name="alert-circle" size={16} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Name Field (when registering) */}
            {isRegistering ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons color="#847D77" name="person-outline" size={18} style={styles.inputIcon} />
                  <TextInput
                    autoCapitalize="words"
                    onChangeText={(t) => {
                      setName(t);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Saboor"
                    placeholderTextColor={theme.colors.textFaint}
                    style={styles.input}
                    value={name}
                  />
                </View>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons color="#847D77" name="mail-outline" size={18} style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.colors.textFaint}
                  style={styles.input}
                  value={email}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                {!isRegistering ? (
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={styles.forgotText}>Forgot?</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons color="#847D77" name="lock-closed-outline" size={18} style={styles.inputIcon} />
                <TextInput
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.colors.textFaint}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    color="#847D77"
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberRow}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe ? <Ionicons color="#FFFFFF" name="checkmark" size={13} /> : null}
              </View>
              <Text style={styles.rememberText}>Keep me signed in</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
              disabled={isLoading}
              onPress={handleSubmit}
              size="lg"
              title={
                isLoading
                  ? isRegistering
                    ? 'Creating account...'
                    : 'Signing in...'
                  : isRegistering
                    ? 'Create Account'
                    : 'Sign In'
              }
            />

            {/* Instant Demo Enter Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={async () => {
                setIsLoading(true);
                try {
                  await login(email || 'saboor@habittracker.com', password || 'password123');
                  navigation.navigate('MainTabs');
                } finally {
                  setIsLoading(false);
                }
              }}
              style={styles.instantDemoBtn}
            >
              <Ionicons color="#FF6B00" name="flash" size={16} />
              <Text style={styles.instantDemoBtnText}>⚡ Instant Demo Access (Offline-Ready)</Text>
            </TouchableOpacity>

            {/* Quick Demo Fill Buttons */}
            <View style={styles.demoSection}>
              <Text style={styles.demoSectionLabel}>Quick Demo Fill:</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDemoAccount('saboor@habittracker.com', 'password123', 'Saboor')}
                  style={styles.demoPill}
                >
                  <Text style={styles.demoPillText}>Default (Saboor)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDemoAccount('evelyn@example.com', 'SecurePassword123', 'Evelyn Harper')}
                  style={styles.demoPill}
                >
                  <Text style={styles.demoPillText}>User 2 (Evelyn)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Skip as Guest */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MainTabs')}
              style={styles.guestBtn}
            >
              <Text style={styles.guestText}>Continue as Guest (Offline)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.layout.screenHorizontal,
    paddingTop: theme.spacing.xl,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.cardPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#847D77',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 310,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#EFECE7',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...theme.shadows.card,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#847D77',
  },
  tabButtonTextActive: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1EDE7',
    ...theme.shadows.card,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFECE7',
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  eyeBtn: {
    padding: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#D5CFC9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  rememberText: {
    fontSize: 13,
    color: '#847D77',
    fontWeight: '500',
  },
  demoSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1EDE7',
  },
  demoSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A39E98',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EFECE7',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  guestText: {
    color: '#847D77',
    fontSize: 14,
    fontWeight: '600',
  },
  instantDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FFF4EB',
    borderWidth: 1,
    borderColor: '#FFD4B8',
    borderRadius: theme.radius.md,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  instantDemoBtnText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '700',
  },
});
