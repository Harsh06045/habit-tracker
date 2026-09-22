import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import type { Habit } from '../types';

const DEVICE_TOKEN_KEY = '@habit_tracker/device_token';
const NOTIFICATION_PERMISSION_KEY = '@habit_tracker/notif_permission';

/**
 * Check if the current environment supports standard Web Notifications
 */
export function isNotificationSupported(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    return true;
  }
  return false;
}

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);
    if (permission === 'granted') {
      await registerDeviceToken();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[Notifications] Failed to request permission:', error);
    return false;
  }
}

/**
 * Get or create a persistent device token and register it with the backend
 */
export async function registerDeviceToken(): Promise<string | null> {
  try {
    let token = await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
    if (!token) {
      token = `dev_token_${Platform.OS}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
    }

    // Register with backend
    await api.devices.registerToken(token, Platform.OS.toUpperCase());
    console.log('[Notifications] Device token registered with backend:', token);
    return token;
  } catch (err) {
    console.warn('[Notifications] Could not register device token with backend:', err);
    return null;
  }
}

/**
 * Display a local notification immediately
 */
export function showNotification(title: string, options?: { body?: string; icon?: string }): void {
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: options?.body,
        icon: options?.icon || 'https://raw.githubusercontent.com/feathericons/feather/master/icons/bell.svg',
      });
      return;
    } catch (e) {
      console.warn('[Notifications] Failed to show browser notification:', e);
    }
  }

  // Graceful fallback for environments where Notification API is restricted or not granted
  console.log(`[Notification Fallback] ${title} - ${options?.body || ''}`);
}

/**
 * Format and trigger a habit reminder matching the user specification:
 * Habit: Workout
 * Reminder: 7:00 AM
 * -> "🔔 Time for your Workout!"
 */
export async function triggerHabitReminder(habit: Habit): Promise<void> {
  const title = `🔔 Time for your ${habit.name}!`;
  const body = habit.goal
    ? `Goal: ${habit.goal}. Keep your ${habit.streak}-day streak going!`
    : `Keep your ${habit.streak}-day streak going! Tap to mark complete.`;

  // 1. Show immediate local browser notification
  showNotification(title, { body });

  // 2. Persist notification record in backend if online and authenticated
  if (habit.id > 0) {
    try {
      await api.notifications.triggerReminder(habit.id);
    } catch (e) {
      console.warn('[Notifications] Could not record reminder on backend:', e);
    }
  }
}

// Active in-memory timers for scheduled habit reminders
const activeTimers: Map<number, any> = new Map();

/**
 * Schedule a habit reminder based on habit.reminder (e.g. "07:00 AM" or "21:30")
 */
export function scheduleHabitReminder(habit: Habit): void {
  // Clear any existing timer for this habit
  if (activeTimers.has(habit.id)) {
    clearTimeout(activeTimers.get(habit.id));
    activeTimers.delete(habit.id);
  }

  if (!habit.reminder) return;

  const timeMatch = habit.reminder.match(/(\d+):(\d+)/);
  if (!timeMatch) return;

  let targetHours = parseInt(timeMatch[1], 10);
  const targetMinutes = parseInt(timeMatch[2], 10);

  if (habit.reminder.toLowerCase().includes('pm') && targetHours < 12) targetHours += 12;
  if (habit.reminder.toLowerCase().includes('am') && targetHours === 12) targetHours = 0;

  const now = new Date();
  const target = new Date();
  target.setHours(targetHours, targetMinutes, 0, 0);

  let msUntilReminder = target.getTime() - now.getTime();
  // If the time already passed today, schedule for tomorrow
  if (msUntilReminder <= 0) {
    msUntilReminder += 24 * 60 * 60 * 1000;
  }

  // Cap timer to 24 hours max
  const timer = setTimeout(() => {
    triggerHabitReminder(habit);
    // Reschedule for next day
    scheduleHabitReminder(habit);
  }, msUntilReminder);

  activeTimers.set(habit.id, timer);
  console.log(`[Notifications] Scheduled reminder for "${habit.name}" in ${Math.round(msUntilReminder / 60000)} minutes`);
}

/**
 * Schedule reminders for all habits with a reminder set
 */
export function scheduleAllHabitReminders(habits: Habit[]): void {
  habits.forEach((h) => {
    if (h.reminder) {
      scheduleHabitReminder(h);
    }
  });
}
