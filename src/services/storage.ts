import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Habit } from '../types';

const HABITS_STORAGE_KEY = '@habit_tracker/habits_v2';

/**
 * Loads the saved habits from local persistent storage (AsyncStorage).
 * Returns null if no habits are stored yet.
 */
export async function loadHabitsFromStorage(): Promise<Habit[] | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue);
      if (Array.isArray(parsed)) {
        return parsed as Habit[];
      }
    }
  } catch (error) {
    console.error('Error loading habits from AsyncStorage:', error);
  }
  return null;
}

/**
 * Persists the current habits array to local persistent storage.
 */
export async function saveHabitsToStorage(habits: Habit[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(habits);
    await AsyncStorage.setItem(HABITS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving habits to AsyncStorage:', error);
  }
}

/**
 * Clears the habits from local storage.
 */
export async function clearHabitsStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HABITS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing habits storage:', error);
  }
}
