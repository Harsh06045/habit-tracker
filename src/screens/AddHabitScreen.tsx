import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useHabits } from '../context/HabitContext';
import { theme } from '../theme';
import { getLocalDateKey } from '../utils/date';
import type { HabitFrequency } from '../types';

type AddHabitScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddHabit'>;

interface AddHabitScreenProps {
  navigation: AddHabitScreenNavigationProp;
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

export const AddHabitScreen: React.FC<AddHabitScreenProps> = ({ navigation }) => {
  const { addHabit } = useHabits();

  const [habitName, setHabitName] = useState('');
  const [goalEnabled, setGoalEnabled] = useState(true);
  const [repeatEnabled, setRepeatEnabled] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>(['thu']);
  const [goalDate, setGoalDate] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [getReminders, setGetReminders] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (key: string) => {
    if (selectedDays.includes(key)) {
      setSelectedDays(selectedDays.filter((d) => d !== key));
    } else {
      setSelectedDays([...selectedDays, key]);
    }
  };

  // Map short day keys to backend-compatible day names
  const dayKeyToBackend: Record<string, string> = {
    mon: 'MON',
    tue: 'TUE',
    wed: 'WED',
    thu: 'THU',
    fri: 'FRI',
    sat: 'SAT',
    sun: 'SUN',
  };

  // Derive frequency from selected days
  const deriveFrequency = (): HabitFrequency => {
    if (!repeatEnabled || selectedDays.length === 0) return 'Daily';
    if (selectedDays.length === 7) return 'Daily';
    const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const isWeekdays =
      selectedDays.length === 5 && weekdays.every((d) => selectedDays.includes(d));
    if (isWeekdays) return 'Weekdays';
    if (selectedDays.length === 1) return 'Weekly';
    return 'Custom';
  };

  // Build daysOfWeek string from selected day buttons (e.g. "MON,THU,FRI")
  const buildDaysOfWeek = (): string => {
    if (!repeatEnabled || selectedDays.length === 0) {
      return 'MON,TUE,WED,THU,FRI,SAT,SUN';
    }
    const orderedKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    return orderedKeys
      .filter((k) => selectedDays.includes(k))
      .map((k) => dayKeyToBackend[k])
      .join(',');
  };

  // Parse goalDate into ISO startDate (YYYY-MM-DD) if user entered one
  const parseStartDate = (): string => {
    if (!goalDate.trim()) {
      return getLocalDateKey();
    }
    // If already ISO format (YYYY-MM-DD), use directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(goalDate.trim())) {
      return goalDate.trim();
    }
    // Try to parse any other date format
    const parsed = new Date(goalDate.replace(',', ''));
    if (!isNaN(parsed.getTime())) {
      return getLocalDateKey(parsed);
    }
    return getLocalDateKey();
  };

  const handleSave = async () => {
    if (!habitName.trim()) {
      setErrorMsg('Please enter a habit name');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      const frequency = deriveFrequency();
      const daysOfWeek = buildDaysOfWeek();
      const startDate = goalEnabled ? parseStartDate() : getLocalDateKey();
      const goalValue = goalEnabled && goalAmount.trim() ? goalAmount.trim() : '15 min';

      await addHabit({
        name: habitName.trim(),
        description: '',
        category: 'General',
        color: '#FF6B00',
        icon: 'sparkles',
        frequency,
        daysOfWeek,
        goal: goalValue,
        target: goalValue,
        reminder: getReminders ? '8:00 AM' : undefined,
        startDate,
        streak: 0,
        completed: false,
      });
      navigation.goBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save habit';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onClose={() => navigation.goBack()}
        showClose
        title="New habit"
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
          {/* 3D Mascot Illustration Badge (Peach Circle with Cute Flower in Pot) */}
          <View style={styles.mascotContainer}>
            <View style={styles.mascotCircle}>
              {/* Cute Plant Mascot */}
              <View style={styles.flowerPlant}>
                {/* Flower Head */}
                <View style={styles.flowerPetals}>
                  <View style={[styles.petal, styles.petalTop]} />
                  <View style={[styles.petal, styles.petalBottom]} />
                  <View style={[styles.petal, styles.petalLeft]} />
                  <View style={[styles.petal, styles.petalRight]} />
                  <View style={[styles.petal, styles.petalDiag1]} />
                  <View style={[styles.petal, styles.petalDiag2]} />
                  {/* Flower Center with Plus Badge */}
                  <View style={styles.flowerCenter}>
                    <Ionicons color="#FFFFFF" name="add" size={16} />
                  </View>
                </View>

                {/* Stem & Leaf */}
                <View style={styles.stemContainer}>
                  <View style={styles.stem} />
                  <View style={styles.leaf} />
                </View>

                {/* Pot */}
                <View style={styles.pot}>
                  <View style={styles.potRim} />
                </View>
              </View>
            </View>
          </View>

          {/* Form: Name your habit */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Name your habit</Text>
            <View style={[styles.inputBox, Boolean(errorMsg) && styles.inputBoxError]}>
              <TextInput
                onChangeText={(text) => {
                  setHabitName(text);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Morning Meditations"
                placeholderTextColor={theme.colors.textFaint}
                style={styles.textInput}
                value={habitName}
              />
            </View>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          {/* Form: Set a goal */}
          <View style={styles.fieldSection}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>Set a goal</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setGoalEnabled(!goalEnabled)}
                style={[styles.checkbox, goalEnabled && styles.checkboxActive]}
              >
                {goalEnabled ? <Ionicons color="#FFFFFF" name="checkmark" size={12} /> : null}
              </TouchableOpacity>
            </View>

            <View style={styles.twoColumnRow}>
              {/* Goal Date Input */}
              <View style={styles.pillInput}>
                <TextInput
                  onChangeText={setGoalDate}
                  placeholder="e.g. 2026-10-01"
                  placeholderTextColor="#847D77"
                  style={styles.pillInputField}
                  value={goalDate}
                />
                <Ionicons color="#847D77" name="calendar-outline" size={16} />
              </View>

              {/* Goal Amount Input */}
              <View style={styles.pillInput}>
                <TextInput
                  onChangeText={setGoalAmount}
                  placeholder="e.g. 15 min"
                  placeholderTextColor="#847D77"
                  style={styles.pillInputField}
                  value={goalAmount}
                />
                <Ionicons color="#847D77" name="timer-outline" size={16} />
              </View>
            </View>
          </View>

          {/* Form: Repeat days */}
          <View style={styles.fieldSection}>
            <View style={styles.fieldHeaderRow}>
              <Text style={styles.fieldLabel}>Repeat days</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRepeatEnabled(!repeatEnabled)}
                style={[styles.checkbox, repeatEnabled && styles.checkboxActive]}
              >
                {repeatEnabled ? <Ionicons color="#FFFFFF" name="checkmark" size={12} /> : null}
              </TouchableOpacity>
            </View>

            {/* Day Circles: M T W T F S S */}
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

          {/* Form: Get reminders toggle */}
          <View style={styles.reminderToggleRow}>
            <Text style={styles.fieldLabel}>Get reminders</Text>
            <Switch
              onValueChange={setGetReminders}
              thumbColor="#FFFFFF"
              trackColor={{ false: '#E2DCD5', true: '#FF6B00' }}
              value={getReminders}
            />
          </View>

          {/* Save Habit Button (Vibrant Orange Pill) */}
          <View style={styles.ctaWrapper}>
            <Button
              onPress={handleSave}
              size="lg"
              title="Save Habit"
            />
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
    paddingTop: theme.spacing.sm,
    paddingBottom: 40,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  mascotCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFEEDB', // Soft warm peach backdrop from reference
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  flowerPlant: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  flowerPetals: {
    width: 60,
    height: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petal: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF9447',
  },
  petalTop: { top: 0 },
  petalBottom: { bottom: 0 },
  petalLeft: { left: 0 },
  petalRight: { right: 0 },
  petalDiag1: { top: 6, left: 6 },
  petalDiag2: { top: 6, right: 6 },
  flowerCenter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#FFEEDB',
  },
  stemContainer: {
    alignItems: 'center',
    height: 22,
    position: 'relative',
    width: 30,
  },
  stem: {
    width: 5,
    height: 22,
    backgroundColor: '#789F42',
    borderRadius: 2,
  },
  leaf: {
    position: 'absolute',
    right: 4,
    top: 6,
    width: 12,
    height: 7,
    backgroundColor: '#8CB84D',
    borderRadius: 6,
    transform: [{ rotate: '25deg' }],
  },
  pot: {
    width: 38,
    height: 26,
    backgroundColor: '#D99B82',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
  },
  potRim: {
    width: 44,
    height: 6,
    backgroundColor: '#C8856B',
    borderRadius: 3,
  },
  fieldSection: {
    marginBottom: 20,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
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
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pillInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFECE7',
    paddingHorizontal: 16,
    height: 48,
  },
  pillInputText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#847D77',
  },
  pillInputField: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#221C18',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: theme.colors.primaryDark, // Solid black/espresso circle from reference
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
    marginVertical: 14,
  },
  ctaWrapper: {
    marginTop: 18,
    marginBottom: 20,
  },
});
