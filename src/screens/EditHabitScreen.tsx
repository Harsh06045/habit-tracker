import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useHabits } from '../context/HabitContext';
import { theme } from '../theme';
import { getLocalDateKey } from '../utils/date';
import type { HabitFrequency } from '../types';

type EditHabitScreenRouteProp = RouteProp<RootStackParamList, 'EditHabit'>;
type EditHabitScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditHabit'>;

interface EditHabitScreenProps {
  route: EditHabitScreenRouteProp;
  navigation: EditHabitScreenNavigationProp;
}

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

const ICONS: Array<{ key: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = [
  { key: 'book', icon: 'book', label: 'Reading' },
  { key: 'barbell', icon: 'barbell', label: 'Workout' },
  { key: 'water', icon: 'water', label: 'Drink' },
  { key: 'leaf', icon: 'leaf', label: 'Mind' },
  { key: 'fitness', icon: 'fitness', label: 'Stretch' },
  { key: 'sparkles', icon: 'sparkles', label: 'Custom' },
];

export const EditHabitScreen: React.FC<EditHabitScreenProps> = ({
  route,
  navigation,
}) => {
  const { habitId } = route.params;
  const { habits, updateHabit, deleteHabit } = useHabits();

  const habit = habits.find((h) => h.id === habitId);

  const [habitName, setHabitName] = useState(habit?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(habit?.icon || 'sparkles');
  const [target, setTarget] = useState(habit?.goal || habit?.target || '15 min');
  const [reminder, setReminder] = useState(habit?.reminder || '08:00 AM');
  const [getReminders, setGetReminders] = useState(Boolean(habit?.reminder));
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency || 'Daily');
  const [startDate, setStartDate] = useState(habit?.startDate || habit?.createdAt || getLocalDateKey());
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    if (habit?.daysOfWeek) {
      const backendToKey: Record<string, string> = {
        MON: 'mon', TUE: 'tue', WED: 'wed', THU: 'thu', FRI: 'fri', SAT: 'sat', SUN: 'sun',
      };
      return habit.daysOfWeek.split(',').map((d) => backendToKey[d.trim()] || d.toLowerCase()).filter(Boolean);
    }
    return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!habit) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header onBack={() => navigation.goBack()} showBack title="Edit Habit" />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Habit not found</Text>
          <Button onPress={() => navigation.goBack()} title="Go Back" />
        </View>
      </SafeAreaView>
    );
  }

  const toggleDay = (key: string) => {
    if (selectedDays.includes(key)) {
      setSelectedDays(selectedDays.filter((d) => d !== key));
    } else {
      setSelectedDays([...selectedDays, key]);
    }
  };

  // Map short day keys to backend-compatible day names
  const dayKeyToBackend: Record<string, string> = {
    mon: 'MON', tue: 'TUE', wed: 'WED', thu: 'THU', fri: 'FRI', sat: 'SAT', sun: 'SUN',
  };

  const buildDaysOfWeek = (): string => {
    const orderedKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return orderedKeys
      .filter((k) => selectedDays.includes(k))
      .map((k) => dayKeyToBackend[k])
      .join(',') || 'MON,TUE,WED,THU,FRI,SAT,SUN';
  };

  const handleUpdate = async () => {
    if (!habitName.trim()) {
      setErrorMsg('Please enter a habit name');
      return;
    }

    try {
      await updateHabit(habit.id, {
        name: habitName.trim(),
        description: habit.description || '',
        icon: selectedIcon,
        color: habit.color || '#FF6B00',
        category: habit.category || 'General',
        frequency,
        daysOfWeek: buildDaysOfWeek(),
        goal: target.trim(),
        target: target.trim(),
        reminder: getReminders ? reminder : undefined,
        startDate,
      });

      navigation.goBack();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update habit');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHabit(habit.id);
      setShowDeleteModal(false);
      navigation.navigate('MainTabs');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to delete habit');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'trash-outline',
          color: theme.colors.danger,
          onPress: () => setShowDeleteModal(true),
        }}
        showBack
        title="Edit Habit"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name Field */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Habit Name</Text>
            <View style={[styles.inputBox, Boolean(errorMsg) && styles.inputBoxError]}>
              <TextInput
                onChangeText={(text) => {
                  setHabitName(text);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Habit name"
                placeholderTextColor={theme.colors.textFaint}
                style={styles.textInput}
                value={habitName}
              />
            </View>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          {/* Icon Selector */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Icon</Text>
            <View style={styles.iconRow}>
              {ICONS.map((item) => {
                const isSelected = selectedIcon === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.7}
                    onPress={() => setSelectedIcon(item.key)}
                    style={[
                      styles.iconCircle,
                      isSelected && styles.iconCircleSelected,
                    ]}
                  >
                    <Ionicons
                      color={isSelected ? '#FFFFFF' : theme.colors.text}
                      name={item.icon}
                      size={20}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Target & Start Date Row */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Target & Start Date</Text>
            <View style={styles.twoColumnRow}>
              <View style={styles.inputBoxCol}>
                <Text style={styles.subLabel}>Daily Target</Text>
                <TextInput
                  onChangeText={setTarget}
                  placeholder="e.g. 20 min"
                  placeholderTextColor={theme.colors.textFaint}
                  style={styles.subInput}
                  value={target}
                />
              </View>

              <View style={styles.inputBoxCol}>
                <Text style={styles.subLabel}>Start Date</Text>
                <TextInput
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textFaint}
                  style={styles.subInput}
                  value={startDate}
                />
              </View>
            </View>
          </View>

          {/* Frequency & Days */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Repeat Frequency</Text>
            <View style={styles.frequencyRow}>
              {(['Daily', 'Weekdays', 'Weekly'] as HabitFrequency[]).map((f) => {
                const isSelected = frequency === f;
                return (
                  <TouchableOpacity
                    key={f}
                    activeOpacity={0.7}
                    onPress={() => setFrequency(f)}
                    style={[
                      styles.frequencyPill,
                      isSelected && styles.frequencyPillSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.frequencyPillText,
                        isSelected && styles.frequencyPillTextSelected,
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Day Circles */}
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.key);
                return (
                  <TouchableOpacity
                    key={day.key}
                    activeOpacity={0.7}
                    onPress={() => toggleDay(day.key)}
                    style={[
                      styles.dayCircle,
                      isSelected && styles.dayCircleSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCircleText,
                        isSelected && styles.dayCircleTextSelected,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Reminder Toggle */}
          <View style={styles.fieldSection}>
            <View style={styles.reminderToggleRow}>
              <View>
                <Text style={styles.fieldLabel}>Daily Reminder</Text>
                <Text style={styles.reminderSubtitle}>Set push alert time</Text>
              </View>
              <Switch
                onValueChange={setGetReminders}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#E2DCD5', true: '#FF6B00' }}
                value={getReminders}
              />
            </View>

            {getReminders ? (
              <View style={styles.inputBox}>
                <TextInput
                  onChangeText={setReminder}
                  placeholder="e.g. 08:00 AM"
                  placeholderTextColor={theme.colors.textFaint}
                  style={styles.textInput}
                  value={reminder}
                />
              </View>
            ) : null}
          </View>

          {/* Save / Update Button */}
          <View style={styles.ctaWrapper}>
            <Button
              onPress={handleUpdate}
              size="lg"
              title="Save Changes"
            />
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowDeleteModal(true)}
            style={styles.deleteBtn}
          >
            <Ionicons color={theme.colors.danger} name="trash-outline" size={16} />
            <Text style={styles.deleteBtnText}>Delete Habit</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
              Are you sure you want to permanently delete "{habit.name}"?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
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
  keyboardView: {
    flex: 1,
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
  fieldSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#847D77',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFECE7',
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
  },
  inputBoxError: {
    borderColor: theme.colors.danger,
  },
  textInput: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: 4,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBoxCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFECE7',
    padding: 12,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#847D77',
    marginBottom: 4,
  },
  subInput: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  frequencyPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFECE7',
  },
  frequencyPillSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  frequencyPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#847D77',
  },
  frequencyPillTextSelected: {
    color: '#FFFFFF',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: theme.colors.primaryDark,
  },
  dayCircleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#847D77',
  },
  dayCircleTextSelected: {
    color: '#FFFFFF',
  },
  reminderToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaWrapper: {
    marginTop: 10,
    marginBottom: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFF0F0',
    gap: 8,
  },
  deleteBtnText: {
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
