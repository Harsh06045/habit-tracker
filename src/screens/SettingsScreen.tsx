import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { theme } from '../theme';
import {
  isNotificationSupported,
  requestNotificationPermission,
  triggerHabitReminder,
} from '../services/notifications';
import {
  isOnline,
  isSimulatedOffline,
  setSimulatedOffline,
  addNetworkListener,
} from '../services/network';
import { syncQueue } from '../services/syncQueue';
import { syncEngine, type SyncStatus } from '../services/syncEngine';
import type { Habit } from '../types';

type SettingsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Settings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { habits, resetHabits, syncNow } = useHabits();

  const [dailyReminders, setDailyReminders] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [simulated, setSimulated] = useState(isSimulatedOffline());
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncEngine.getStatus());
  const [reminderStatusText, setReminderStatusText] = useState<string | null>(null);

  React.useEffect(() => {
    const unbindNet = addNetworkListener((isNowOnline) => {
      setOnline(isNowOnline);
      setSimulated(isSimulatedOffline());
    });

    const unbindSync = syncEngine.addListener((status, count) => {
      setSyncStatus(status);
      setPendingCount(count);
    });

    syncQueue.count().then(setPendingCount);

    return () => {
      unbindNet();
      unbindSync();
    };
  }, []);

  const handleReset = async () => {
    await resetHabits();
    if (Platform.OS === 'web') {
      window.alert('Habits have been reset to default seeds and saved to storage.');
    } else {
      Alert.alert('Reset Complete', 'Habits have been reset to defaults.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigation.navigate('Login');
    }
  };

  const handleTestReminder = async () => {
    if (isNotificationSupported()) {
      await requestNotificationPermission();
    }
    const sampleWorkout: Habit = {
      id: habits.find((h) => h.name.toLowerCase().includes('workout'))?.id || 2,
      name: 'Workout',
      streak: 4,
      completed: false,
      reminder: '7:00 AM',
      goal: '45 mins daily',
    };
    await triggerHabitReminder(sampleWorkout);
    setReminderStatusText('Sent: "🔔 Time for your Workout!"');
    setTimeout(() => setReminderStatusText(null), 4000);
  };

  const handleToggleOffline = () => {
    const next = !simulated;
    setSimulatedOffline(next);
    setSimulated(next);
    setOnline(!next);
  };

  const handleManualSync = async () => {
    await syncNow();
  };

  const handleClearQueue = async () => {
    await syncQueue.clear();
    setPendingCount(0);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>🧑🏻‍💼</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Saboor'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'saboor@habittracker.com'}</Text>
            <Text style={styles.profileMeta}>
              {habits.length} habits active • Spring Boot Sync
            </Text>
          </View>
        </View>

        {/* Phase 8: Habit Reminders & Notifications */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>PHASE 8 — REMINDERS & NOTIFICATIONS</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF0E6' }]}>
                <Ionicons color="#FF6B00" name="notifications-outline" size={18} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Habit Reminders</Text>
                <Text style={styles.settingSubtitle}>Local & Web notification triggers</Text>
              </View>
            </View>
            <Switch
              onValueChange={setDailyReminders}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#E2DCD5', true: '#FF6B00' }}
              value={dailyReminders}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleTestReminder}
            style={styles.actionRowBtn}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFE9E5' }]}>
                <Ionicons color="#FF4961" name="alarm-outline" size={18} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Test Workout Reminder (7:00 AM)</Text>
                <Text style={styles.settingSubtitle}>
                  {reminderStatusText || 'Simulate scheduled reminder: "🔔 Time for your Workout!"'}
                </Text>
              </View>
            </View>
            <View style={styles.testBtnPill}>
              <Text style={styles.testBtnPillText}>Trigger</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Phase 9: Offline-First & Cloud Synchronization */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>PHASE 9 — OFFLINE-FIRST & SYNC QUEUE</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: online ? '#EAF6EE' : '#FFF3E0' },
                ]}
              >
                <Ionicons
                  color={online ? '#25B76B' : '#FF9500'}
                  name={online ? 'cloud-done-outline' : 'cloud-offline-outline'}
                  size={18}
                />
              </View>
              <View>
                <Text style={styles.settingTitle}>
                  Network Status: {online ? 'Online 🟢' : 'Offline ⚡'}
                </Text>
                <Text style={styles.settingSubtitle}>
                  {online
                    ? 'Connected to Spring Boot API'
                    : 'Mutations queued locally in AsyncStorage'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F0EAF8' }]}>
                <Ionicons color="#8A3FFC" name="toggle-outline" size={18} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Simulate Offline Mode</Text>
                <Text style={styles.settingSubtitle}>
                  Test creating & completing habits offline
                </Text>
              </View>
            </View>
            <Switch
              onValueChange={handleToggleOffline}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#E2DCD5', true: '#8A3FFC' }}
              value={simulated}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#EBF0FA' }]}>
                <Ionicons color="#4F8CFF" name="layers-outline" size={18} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Pending Sync Queue</Text>
                <Text style={styles.settingSubtitle}>
                  {pendingCount === 0
                    ? 'All actions synchronized'
                    : `${pendingCount} mutation${pendingCount > 1 ? 's' : ''} awaiting sync`}
                </Text>
              </View>
            </View>
            {online && pendingCount > 0 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleManualSync}
                style={styles.syncNowBtn}
              >
                <Text style={styles.syncNowBtnText}>
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>
                  {pendingCount === 0 ? 'Synced' : 'Queued'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Preferences & Reset */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#F6EBE2' }]}>
                <Ionicons color="#372823" name="phone-portrait-outline" size={18} />
              </View>
              <Text style={styles.settingTitle}>Haptic Feedback</Text>
            </View>
            <Switch
              onValueChange={setHapticsEnabled}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#E2DCD5', true: '#FF6B00' }}
              value={hapticsEnabled}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleReset}
            style={styles.settingRow}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFF0E6' }]}>
                <Ionicons color="#FF6B00" name="refresh-outline" size={18} />
              </View>
              <View>
                <Text style={styles.settingTitle}>Reset to Default Habits</Text>
                <Text style={styles.settingSubtitle}>Restore original routine seeds</Text>
              </View>
            </View>
            <Ionicons color="#847D77" name="chevron-forward" size={18} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.layout.screenHorizontal,
    paddingTop: theme.spacing.md,
    paddingBottom: 96,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1EDE7',
    ...theme.shadows.card,
    marginBottom: 20,
    gap: 16,
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.avatarRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFE9E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: '#847D77',
    marginTop: 2,
  },
  profileMeta: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1EDE7',
    ...theme.shadows.card,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9C958E',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#847D77',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EFEB',
    marginVertical: 4,
  },
  badgePill: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  signOutButton: {
    backgroundColor: '#F3EFEB',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actionRowBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  testBtnPill: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  testBtnPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  syncNowBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  syncNowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
