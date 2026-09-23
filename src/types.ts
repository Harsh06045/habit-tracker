export type HabitId = number;

export type HabitFrequency = 'Daily' | 'Weekdays' | 'Weekly' | 'Custom';

export interface HabitHistoryEntry {
  /** ISO calendar date in YYYY-MM-DD form. */
  date: string;
  completed: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface BackendHabit {
  id: number;
  name: string;
  description?: string | null;
  category?: string | null;
  color?: string | null;
  icon?: string | null;
  frequency?: string | null;
  daysOfWeek?: string | null;
  targetCount?: number | null;
  targetUnit?: string | null;
  streak: number;
  longestStreak: number;
  completedToday: boolean;
  reminderTime?: string | null;
  startDate?: string | null;
  totalCompletions?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BackendHabitRequest {
  name: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  frequency?: string;
  daysOfWeek?: string;
  targetCount?: number;
  targetUnit?: string;
  reminderTime?: string;
  startDate?: string;
}

export interface Habit {
  id: HabitId;
  name: string;
  streak: number;
  completed: boolean;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
  frequency?: HabitFrequency;
  daysOfWeek?: string;
  goal?: string;
  target?: string;
  reminder?: string;
  startDate?: string;
  createdAt?: string;
  history?: HabitHistoryEntry[];
  completedDates?: string[];
  totalCompletions?: number;
}

/** Input accepted by the Add Habit form. */
export interface HabitInput {
  name: string;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
  frequency?: HabitFrequency;
  daysOfWeek?: string;
  goal?: string;
  target?: string;
  reminder?: string;
  startDate?: string;
  createdAt?: string;
  streak?: number;
  completed?: boolean;
  history?: HabitHistoryEntry[];
  completedDates?: string[];
  totalCompletions?: number;
}

export type HabitUpdate = Partial<Omit<Habit, 'id'>>;

export interface HabitProgress {
  id: number;
  name: string;
  category?: string;
  icon?: string;
  color?: string;
  streak: number;
  longestStreak: number;
  totalCompletions: number;
  completionPercentage: number;
  completedToday: boolean;
}

export interface TodayStats {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionPercentage: number;
  habits: HabitProgress[];
}

export interface DailyStat {
  date: string;
  dayName: string;
  totalHabits: number;
  completedHabits: number;
  completionPercentage: number;
}

export interface WeekStats {
  startDate: string;
  endDate: string;
  totalScheduled: number;
  totalCompleted: number;
  completionPercentage: number;
  dailyBreakdown: DailyStat[];
  habits: HabitProgress[];
}

export interface MonthStats {
  year: number;
  month: string;
  daysInMonth: number;
  totalCompleted: number;
  completionPercentage: number;
  bestStreak: number;
  currentStreak: number;
  habits: HabitProgress[];
}

export interface HabitStats {
  habitId: number;
  habitName: string;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  completedToday: boolean;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  allTimeCompletionRate: number;
  recentCompletions: string[];
}

export interface NotificationItem {
  id: number;
  habitId?: number;
  habitName?: string;
  title: string;
  message: string;
  scheduledTime?: string;
  sent: boolean;
  sentAt?: string;
}

export type SyncOpType = 'CREATE_HABIT' | 'COMPLETE_HABIT' | 'UNCOMPLETE_HABIT' | 'EDIT_HABIT' | 'DELETE_HABIT';

export interface SyncOperation {
  id: string; // queue item ID
  type: SyncOpType;
  tempId?: string;
  habitId?: number;
  date?: string;
  habitData?: BackendHabitRequest;
  timestamp: number;
}

export interface SyncBatchResult {
  success: boolean;
  replayedCount: number;
  idMappings: Record<string, number>;
  message: string;
}

export interface BadgeItem {
  code: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GamificationProfile {
  totalPoints: number;
  level: number;
  levelTitle: string;
  nextLevelPoints: number;
  progressToNextLevel: number;
  completedHabitCount: number;
  longestStreakAchieved: number;
  badgesCount: number;
  badges: BadgeItem[];
}


