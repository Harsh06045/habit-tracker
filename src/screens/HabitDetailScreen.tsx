import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../navigation';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useHabits } from '../context/HabitContext';
import { theme } from '../theme';

type HabitDetailScreenRouteProp = RouteProp<RootStackParamList, 'HabitDetail'>;
type HabitDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HabitDetail'>;

interface HabitDetailScreenProps {
  route: HabitDetailScreenRouteProp;
  navigation: HabitDetailScreenNavigationProp;
}

export const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { habitId } = route.params;
  const { habits, toggleHabit, deleteHabit } = useHabits();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const habit = habits.find((h) => h.id === habitId);

  if (!habit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header onBack={() => navigation.goBack()} showBack title="Habit Details" />
        <View style={styles.notFoundContainer}>
          <Ionicons color={theme.colors.textFaint} name="alert-circle-outline" size={56} />
          <Text style={styles.notFoundTitle}>Habit Not Found</Text>
          <Button onPress={() => navigation.goBack()} title="Go Back" />
        </View>
      </SafeAreaView>
    );
  }

  const handleToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }
    toggleHabit(habit.id);
  };

  const confirmDelete = () => {
    deleteHabit(habit.id);
    setShowDeleteModal(false);
    navigation.goBack();
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'pencil-outline',
          color: theme.colors.text,
          onPress: () => navigation.navigate('EditHabit', { habitId: habit.id }),
        }}
        showBack
        title={habit.name}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Peach Streak Card */}
        <View style={styles.peachBanner}>
          <View style={styles.bannerIconCircle}>
            <Ionicons color="#FF6B00" name="flame" size={32} />
          </View>
          <Text style={styles.bannerStreakNum}>{habit.streak} Days</Text>
          <Text style={styles.bannerStreakLabel}>Current Active Streak</Text>
        </View>

        {/* Action: Check in today */}
        <View style={styles.actionWrapper}>
          <Button
            icon={habit.completed ? 'checkmark-circle' : 'ellipse-outline'}
            onPress={handleToggle}
            size="lg"
            title={habit.completed ? 'Completed Today ✓' : 'Mark as Complete Today'}
            variant={habit.completed ? 'secondary' : 'primary'}
          />
        </View>

        {/* 7-Day Week Activity */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>THIS WEEK'S ROUTINE</Text>
          <View style={styles.weekTrackRow}>
            {dayNames.map((day, idx) => {
              const isToday = idx === 3; // Thursday
              const isChecked = idx < 3 ? true : idx === 3 ? habit.completed : false;

              return (
                <View key={day} style={styles.dayTrackItem}>
                  <Text style={[styles.dayTrackLabel, isToday && styles.dayTrackLabelToday]}>
                    {day}
                  </Text>
                  <View
                    style={[
                      styles.dayTrackCircle,
                      isChecked && styles.dayTrackCircleChecked,
                      isToday && !isChecked && styles.dayTrackCircleToday,
                    ]}
                  >
                    {isChecked ? (
                      <Ionicons color="#FFFFFF" name="checkmark" size={13} />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Habit Settings Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>HABIT SCHEDULE & DETAILS</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons color="#847D77" name="flag-outline" size={18} />
              <Text style={styles.detailLabel}>Daily Target</Text>
            </View>
            <Text style={styles.detailValue}>{habit.goal || '15 min'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons color="#847D77" name="alarm-outline" size={18} />
              <Text style={styles.detailLabel}>Reminder</Text>
            </View>
            <Text style={styles.detailValue}>{habit.reminder || '08:00 AM'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons color="#847D77" name="repeat-outline" size={18} />
              <Text style={styles.detailLabel}>Frequency</Text>
            </View>
            <Text style={styles.detailValue}>{habit.frequency || 'Daily'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Ionicons color="#847D77" name="calendar-outline" size={18} />
              <Text style={styles.detailLabel}>Start Date</Text>
            </View>
            <Text style={styles.detailValue}>{habit.startDate || habit.createdAt || '2026-09-01'}</Text>
          </View>
        </View>

        {/* Action Buttons: Edit and Delete */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })}
            style={styles.editButton}
          >
            <Ionicons color={theme.colors.text} name="pencil-outline" size={16} />
            <Text style={styles.editButtonText}>Edit Habit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowDeleteModal(true)}
            style={styles.deleteButton}
          >
            <Ionicons color={theme.colors.danger} name="trash-outline" size={16} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Modal */}
      <Modal
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
        transparent
        visible={showDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Habit?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to delete "{habit.name}"?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={styles.modalConfirm}
              >
                <Text style={styles.modalConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: theme.spacing.sm,
    paddingBottom: 40,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  peachBanner: {
    backgroundColor: theme.colors.cardPeach,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  bannerIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE2D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bannerStreakNum: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  bannerStreakLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#847D77',
    marginTop: 2,
  },
  actionWrapper: {
    marginBottom: 18,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1EDE7',
    ...theme.shadows.card,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9C958E',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  weekTrackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayTrackItem: {
    alignItems: 'center',
    gap: 8,
  },
  dayTrackLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#847D77',
  },
  dayTrackLabelToday: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  dayTrackCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTrackCircleChecked: {
    backgroundColor: '#FF6B00',
  },
  dayTrackCircleToday: {
    borderWidth: 2,
    borderColor: theme.colors.primaryDark,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  detailValue: {
    fontSize: 14,
    color: '#847D77',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EFEB',
    marginVertical: 4,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE7',
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFF0F0',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: '#847D77',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: '#F3EFEB',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
