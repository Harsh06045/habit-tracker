import React, { useEffect, useRef } from 'react';
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Button } from '../components/Button';
import { theme } from '../theme';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Mascot / App Hero Badge */}
        <View style={styles.mascotRing}>
          <View style={styles.mascotInner}>
            <Ionicons color="#FF6B00" name="sparkles" size={54} />
          </View>
        </View>

        <Text style={styles.title}>Habit Tracker</Text>
        <Text style={styles.subtitle}>
          Build better habits, maintain daily routines, and watch your consistency grow.
        </Text>

        {/* Feature Pills */}
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Text style={styles.pillEmoji}>🔥</Text>
            <Text style={styles.pillText}>Streaks</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillEmoji}>📊</Text>
            <Text style={styles.pillText}>Insights</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillEmoji}>⏰</Text>
            <Text style={styles.pillText}>Routines</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            onPress={() => navigation.navigate('Login')}
            size="lg"
            title="Get Started"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs')}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip to Habits (Guest Mode)</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Text style={styles.footerNote}>Phase 1 • Mobile UI Foundation</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    width: '100%',
  },
  mascotRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: theme.colors.cardPeach, // Soft peach #FFE8DB
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mascotInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFE1D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#847D77',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
    marginBottom: 28,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#EFECE7',
    gap: 6,
    ...theme.shadows.card,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  skipBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#847D77',
  },
  footerNote: {
    fontSize: 12,
    color: '#B5AFA9',
    fontWeight: '500',
  },
});
