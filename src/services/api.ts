import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AuthResponse,
  BackendHabit,
  BackendHabitRequest,
  BadgeItem,
  GamificationProfile,
  Habit,
  HabitFrequency,
  HabitInput,
  HabitUpdate,
  NotificationItem,
  SyncBatchResult,
  User,
} from '../types';

/**
 * API Base URL Configuration
 * Priority:
 *   1. app.json → expo.extra.apiUrl (for production / custom deployments)
 *   2. Platform-specific fallback for local development
 */
function resolveApiUrl(): string {
  try {
    // Dynamically require to avoid hard dependency when Constants isn't available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default;
    const configUrl = Constants?.expoConfig?.extra?.apiUrl;
    if (configUrl && configUrl !== 'http://localhost:8080/api/v1') {
      return configUrl;
    }
  } catch {
    // expo-constants not available, use fallback
  }

  // Development fallbacks
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1'; // Android emulator → host machine
  }
  return 'http://localhost:8080/api/v1'; // Web / iOS
}

export const API_BASE_URL = resolveApiUrl();


const ACCESS_TOKEN_KEY = '@habit_tracker/access_token';
const REFRESH_TOKEN_KEY = '@habit_tracker/refresh_token';
const USER_KEY = '@habit_tracker/user';

// In-memory token cache for ultra-fast header injection
let cachedAccessToken: string | null = null;

export async function getAccessToken(): Promise<string | null> {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    cachedAccessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return cachedAccessToken;
  } catch {
    return null;
  }
}

export async function setAuthData(data: AuthResponse): Promise<void> {
  cachedAccessToken = data.accessToken;
  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)),
  ]);
}

export async function getStoredUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearAuth(): Promise<void> {
  cachedAccessToken = null;
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

interface ApiResponseEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  status?: number;
  errors?: string[] | null;
}

/**
 * Standard fetch wrapper with automatic JWT header injection and token refresh.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 with Token Refresh
  if (response.status === 401 && !isRetry && !endpoint.includes('/auth/')) {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData: ApiResponseEnvelope<AuthResponse> = await refreshRes.json();
          if (refreshData.data?.accessToken) {
            await setAuthData(refreshData.data);
            return apiRequest<T>(endpoint, options, true);
          }
        }
      } catch {
        // Refresh failed, proceed to handle 401
      }
    }
  }

  const resJson = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      resJson?.message ||
      (resJson?.errors && resJson.errors.join(', ')) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return resJson?.data !== undefined ? (resJson.data as T) : (resJson as T);
}

// Convert Backend DTO to Frontend Habit model
export function backendHabitToHabit(b: BackendHabit): Habit {
  const today = new Date().toISOString().slice(0, 10);
  const freq = (b.frequency ? b.frequency.charAt(0) + b.frequency.slice(1).toLowerCase() : 'Daily') as HabitFrequency;

  return {
    id: b.id,
    name: b.name,
    streak: b.streak ?? 0,
    completed: b.completedToday ?? false,
    icon: b.icon || 'sparkles',
    color: b.color || '#FF6B00',
    category: b.category || 'General',
    description: b.description || '',
    frequency: freq,
    goal: `${b.targetCount ?? 15} ${b.targetUnit ?? 'min'}`,
    target: `${b.targetCount ?? 15} ${b.targetUnit ?? 'min'}`,
    reminder: b.reminderTime ? b.reminderTime.slice(0, 5) : undefined,
    startDate: b.startDate || today,
    createdAt: b.createdAt || today,
    totalCompletions: b.totalCompletions ?? 0,
    completedDates: b.completedToday ? [today] : [],
    history: [{ date: today, completed: b.completedToday ?? false }],
  };
}

// Convert Frontend HabitInput to Backend DTO
export function habitInputToBackend(input: HabitInput): BackendHabitRequest {
  const freqMap: Record<HabitFrequency, string> = {
    Daily: 'DAILY',
    Weekdays: 'WEEKDAYS',
    Weekly: 'WEEKLY',
    Custom: 'CUSTOM',
  };

  // Parse goal string (e.g. "20 min" -> count 20, unit "min")
  let targetCount = 15;
  let targetUnit = 'min';
  if (input.goal) {
    const match = input.goal.match(/(\d+)\s*(\w*)/);
    if (match) {
      targetCount = parseInt(match[1], 10) || 15;
      targetUnit = match[2] || 'min';
    }
  }

  // Parse reminder time to "HH:mm"
  let reminderTime: string | undefined;
  if (input.reminder) {
    const timeMatch = input.reminder.match(/(\d+):(\d+)/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const mins = timeMatch[2];
      if (input.reminder.toLowerCase().includes('pm') && hours < 12) hours += 12;
      if (input.reminder.toLowerCase().includes('am') && hours === 12) hours = 0;
      reminderTime = `${hours.toString().padStart(2, '0')}:${mins}`;
    }
  }

  return {
    name: input.name,
    description: input.description,
    category: input.category || 'General',
    color: input.color || '#FF6B00',
    icon: input.icon || 'sparkles',
    frequency: input.frequency ? freqMap[input.frequency] || 'DAILY' : 'DAILY',
    targetCount,
    targetUnit,
    reminderTime,
    startDate: input.startDate || new Date().toISOString().slice(0, 10),
  };
}

export const api = {
  // Authentication
  auth: {
    async login(email: string, password: string): Promise<AuthResponse> {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await setAuthData(data);
      return data;
    },

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      await setAuthData(data);
      return data;
    },

    async logout(): Promise<void> {
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          await apiRequest('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });
        }
      } finally {
        await clearAuth();
      }
    },
  },

  // Habits
  habits: {
    async getAll(): Promise<Habit[]> {
      const backendHabits = await apiRequest<BackendHabit[]>('/habits');
      return backendHabits.map(backendHabitToHabit);
    },

    async getById(id: number): Promise<Habit> {
      const backendHabit = await apiRequest<BackendHabit>(`/habits/${id}`);
      return backendHabitToHabit(backendHabit);
    },

    async create(input: HabitInput): Promise<Habit> {
      const payload = habitInputToBackend(input);
      const created = await apiRequest<BackendHabit>('/habits', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return backendHabitToHabit(created);
    },

    async update(id: number, changes: HabitUpdate): Promise<Habit> {
      const payload = habitInputToBackend({
        name: changes.name || 'Habit',
        ...changes,
      });
      const updated = await apiRequest<BackendHabit>(`/habits/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return backendHabitToHabit(updated);
    },

    async delete(id: number): Promise<void> {
      await apiRequest<void>(`/habits/${id}`, {
        method: 'DELETE',
      });
    },

    async complete(id: number, date?: string): Promise<{ streak: number; completed: boolean }> {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      const res = await apiRequest<{ streak: number; completed: boolean }>(`/habits/${id}/complete${query}`, {
        method: 'POST',
      });
      return res;
    },

    async uncomplete(id: number, date?: string): Promise<{ streak: number; completed: boolean }> {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      const res = await apiRequest<{ streak: number; completed: boolean }>(`/habits/${id}/complete${query}`, {
        method: 'DELETE',
      });
      return res;
    },
  },

  // Statistics & Progress
  statistics: {
    async getTodayStats(): Promise<import('../types').TodayStats> {
      return apiRequest<import('../types').TodayStats>('/statistics/today');
    },

    async getWeekStats(): Promise<import('../types').WeekStats> {
      return apiRequest<import('../types').WeekStats>('/statistics/week');
    },

    async getMonthStats(): Promise<import('../types').MonthStats> {
      return apiRequest<import('../types').MonthStats>('/statistics/month');
    },

    async getHabitStats(habitId: number): Promise<import('../types').HabitStats> {
      return apiRequest<import('../types').HabitStats>(`/habits/${habitId}/statistics`);
    },
  },

  // Notifications & Reminders
  notifications: {
    async getAll(): Promise<NotificationItem[]> {
      return apiRequest<NotificationItem[]>('/notifications');
    },

    async triggerReminder(habitId: number): Promise<NotificationItem> {
      return apiRequest<NotificationItem>(`/notifications/send-reminder/${habitId}`, {
        method: 'POST',
      });
    },
  },

  // Device Tokens
  devices: {
    async registerToken(token: string, platform: string = 'WEB'): Promise<any> {
      return apiRequest<any>('/devices/token', {
        method: 'POST',
        body: JSON.stringify({ token, platform }),
      });
    },

    async removeToken(token: string): Promise<void> {
      return apiRequest<void>(`/devices/token/${encodeURIComponent(token)}`, {
        method: 'DELETE',
      });
    },
  },

  // Offline Sync
  sync: {
    async batchSync(operations: any[]): Promise<SyncBatchResult> {
      return apiRequest<SyncBatchResult>('/sync', {
        method: 'POST',
        body: JSON.stringify({ operations }),
      });
    },
  },

  // Gamification & Points
  gamification: {
    async getProfile(): Promise<GamificationProfile> {
      return apiRequest<GamificationProfile>('/gamification/profile');
    },

    async getBadges(): Promise<BadgeItem[]> {
      return apiRequest<BadgeItem[]>('/gamification/badges');
    },
  },
};


