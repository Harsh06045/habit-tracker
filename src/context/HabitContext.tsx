import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAuth } from './AuthContext';
import { api, habitInputToBackend } from '../services/api';
import { clearHabitsStorage, loadHabitsFromStorage, saveHabitsToStorage } from '../services/storage';
import { isOnline } from '../services/network';
import { syncQueue } from '../services/syncQueue';
import { syncEngine } from '../services/syncEngine';
import { scheduleAllHabitReminders, scheduleHabitReminder } from '../services/notifications';
import { mockHabits } from '../data/mockHabits';
import type { Habit, HabitHistoryEntry, HabitId, HabitInput, HabitUpdate } from '../types';

type HabitAction =
  | { type: 'set_all'; habits: Habit[] }
  | { type: 'set_single'; habit: Habit }
  | { type: 'toggle_optimistic'; id: HabitId; targetDate?: string }
  | { type: 'toggle_confirmed'; id: HabitId; streak: number; completed: boolean; targetDate?: string }
  | { type: 'add'; habit: Habit }
  | { type: 'delete'; id: HabitId }
  | { type: 'update'; id: HabitId; changes: HabitUpdate }
  | { type: 'remap_ids'; mappings: Record<string, number> };

export interface HabitContextValue {
  habits: Habit[];
  isHydrated: boolean;
  isLoading: boolean;
  toggleHabit: (id: HabitId, targetDate?: string) => Promise<void>;
  addHabit: (input: HabitInput) => Promise<Habit>;
  deleteHabit: (id: HabitId) => Promise<void>;
  updateHabit: (id: HabitId, changes: HabitUpdate) => Promise<void>;
  refreshHabits: () => Promise<void>;
  resetHabits: () => Promise<void>;
  syncNow: () => Promise<void>;
}

const HabitContext = createContext<HabitContextValue | undefined>(undefined);

const toDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const updateTodayHistory = (
  history: HabitHistoryEntry[] | undefined,
  date: string,
  completed: boolean,
): HabitHistoryEntry[] => {
  const entries = history ? [...history] : [];
  const entryIndex = entries.findIndex((entry) => entry.date === date);

  if (entryIndex >= 0) {
    entries[entryIndex] = { ...entries[entryIndex], completed };
    return entries;
  }

  return [...entries, { date, completed }];
};

const updateCompletedDates = (
  completedDates: string[] | undefined,
  date: string,
  completed: boolean,
): string[] => {
  const dates = completedDates ? [...completedDates] : [];
  const hasDate = dates.includes(date);

  if (completed && !hasDate) {
    return [...dates, date].sort();
  }

  return completed ? dates : dates.filter((item) => item !== date);
};

export const habitReducer = (state: Habit[], action: HabitAction): Habit[] => {
  switch (action.type) {
    case 'set_all':
      return action.habits;

    case 'set_single':
      return state.map((h) => (h.id === action.habit.id ? action.habit : h));

    case 'toggle_optimistic': {
      const today = toDateKey();
      const targetDate = action.targetDate || today;
      const isTargetToday = targetDate === today;

      return state.map((habit) => {
        if (habit.id !== action.id) return habit;
        const wasCompleted = isTargetToday
          ? habit.completed
          : (habit.completedDates?.includes(targetDate) ||
             habit.history?.some((e) => e.date === targetDate && e.completed) ||
             false);
        const nextCompleted = !wasCompleted;
        const previousTotal = habit.totalCompletions ?? habit.history?.filter((e) => e.completed).length ?? 0;

        return {
          ...habit,
          completed: isTargetToday ? nextCompleted : habit.completed,
          streak: isTargetToday
            ? nextCompleted
              ? habit.streak + 1
              : Math.max(0, habit.streak - 1)
            : habit.streak,
          totalCompletions: Math.max(0, previousTotal + (nextCompleted ? 1 : -1)),
          history: updateTodayHistory(habit.history, targetDate, nextCompleted),
          completedDates: updateCompletedDates(habit.completedDates, targetDate, nextCompleted),
        };
      });
    }

    case 'toggle_confirmed': {
      const today = toDateKey();
      const targetDate = action.targetDate || today;
      const isTargetToday = targetDate === today;

      return state.map((habit) => {
        if (habit.id !== action.id) return habit;
        return {
          ...habit,
          completed: isTargetToday ? action.completed : habit.completed,
          streak: action.streak,
          history: updateTodayHistory(habit.history, targetDate, action.completed),
          completedDates: updateCompletedDates(habit.completedDates, targetDate, action.completed),
        };
      });
    }

    case 'add':
      return [action.habit, ...state];

    case 'delete':
      return state.filter((habit) => habit.id !== action.id);

    case 'update':
      return state.map((habit) =>
        habit.id === action.id ? { ...habit, ...action.changes, id: habit.id } : habit,
      );

    case 'remap_ids':
      return state.map((habit) => {
        const key = String(habit.id);
        if (action.mappings[key] !== undefined) {
          return { ...habit, id: action.mappings[key] };
        }
        return habit;
      });

    default:
      return state;
  }
};

export function HabitProvider({ children }: PropsWithChildren) {
  const [habits, dispatch] = useReducer(habitReducer, []);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load habits from backend API or cached storage
  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && isOnline()) {
        // Fetch from real Spring Boot backend
        const serverHabits = await api.habits.getAll();
        dispatch({ type: 'set_all', habits: serverHabits });
        await saveHabitsToStorage(serverHabits);
        scheduleAllHabitReminders(serverHabits);
      } else {
        // Load offline cache
        const stored = await loadHabitsFromStorage();
        if (stored && stored.length > 0) {
          dispatch({ type: 'set_all', habits: stored });
          scheduleAllHabitReminders(stored);
        } else {
          dispatch({ type: 'set_all', habits: mockHabits });
          await saveHabitsToStorage(mockHabits);
          scheduleAllHabitReminders(mockHabits);
        }
      }
    } catch (err) {
      console.warn('Could not fetch habits from server, using cached storage:', err);
      const stored = await loadHabitsFromStorage();
      if (stored && stored.length > 0) {
        dispatch({ type: 'set_all', habits: stored });
        scheduleAllHabitReminders(stored);
      } else {
        dispatch({ type: 'set_all', habits: mockHabits });
        await saveHabitsToStorage(mockHabits);
        scheduleAllHabitReminders(mockHabits);
      }
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, [isAuthenticated]);

  // Hook sync engine to refresh and remap IDs
  useEffect(() => {
    syncEngine.registerRefreshHandler(loadHabits);
    const unbind = syncEngine.onIdMappings((mappings) => {
      dispatch({ type: 'remap_ids', mappings });
    });
    return () => {
      unbind();
    };
  }, [loadHabits]);

  // Refetch whenever authentication state changes
  useEffect(() => {
    loadHabits();
  }, [loadHabits, user?.id]);

  // Persist habits to local storage as cache
  useEffect(() => {
    if (isHydrated && habits.length > 0) {
      saveHabitsToStorage(habits);
    }
  }, [habits, isHydrated]);

  const toggleHabit = useCallback(
    async (id: HabitId, targetDate?: string) => {
      const targetHabit = habits.find((h) => h.id === id);
      if (!targetHabit) return;

      const dateToUse = targetDate || toDateKey();
      const isTargetToday = dateToUse === toDateKey();

      // 1. Optimistic UI update
      dispatch({ type: 'toggle_optimistic', id, targetDate: dateToUse });

      const wasCompleted = isTargetToday
        ? targetHabit.completed
        : (targetHabit.completedDates?.includes(dateToUse) ||
           targetHabit.history?.some((e) => e.date === dateToUse && e.completed) ||
           false);
      const nextCompleted = !wasCompleted;

      // If offline or toggling past date, enqueue operation
      if (!isOnline() || !isTargetToday) {
        await syncQueue.enqueue({
          type: nextCompleted ? 'COMPLETE_HABIT' : 'UNCOMPLETE_HABIT',
          tempId: id < 0 ? String(id) : undefined,
          habitId: id > 0 ? id : undefined,
          date: dateToUse,
        });
        return;
      }

      try {
        if (isAuthenticated) {
          let res;
          if (nextCompleted) {
            res = await api.habits.complete(id);
          } else {
            res = await api.habits.uncomplete(id);
          }
          dispatch({
            type: 'toggle_confirmed',
            id,
            streak: res.streak,
            completed: res.completed,
            targetDate: dateToUse,
          });
        }
      } catch (err) {
        console.warn('Network call failed, enqueuing offline toggle:', err);
        await syncQueue.enqueue({
          type: nextCompleted ? 'COMPLETE_HABIT' : 'UNCOMPLETE_HABIT',
          tempId: id < 0 ? String(id) : undefined,
          habitId: id > 0 ? id : undefined,
          date: dateToUse,
        });
      }
    },
    [habits, isAuthenticated],
  );

  const addHabit = useCallback(
    async (input: HabitInput): Promise<Habit> => {
      setIsLoading(true);
      const today = toDateKey();
      const backendData = habitInputToBackend(input);

      // Offline flow: assign temporary negative ID and enqueue
      if (!isOnline()) {
        const tempId = -Date.now();
        const fallbackHabit: Habit = {
          ...input,
          id: tempId,
          streak: input.streak ?? 0,
          completed: input.completed ?? false,
          createdAt: input.createdAt ?? today,
          startDate: input.startDate ?? today,
          history: [{ date: today, completed: input.completed ?? false }],
          completedDates: input.completed ? [today] : [],
          totalCompletions: input.completed ? 1 : 0,
        };
        dispatch({ type: 'add', habit: fallbackHabit });
        scheduleHabitReminder(fallbackHabit);
        await syncQueue.enqueue({
          type: 'CREATE_HABIT',
          tempId: String(tempId),
          habitData: backendData,
        });
        setIsLoading(false);
        return fallbackHabit;
      }

      try {
        if (isAuthenticated) {
          const created = await api.habits.create(input);
          dispatch({ type: 'add', habit: created });
          scheduleHabitReminder(created);
          return created;
        } else {
          // Unauthenticated local fallback
          const localId = habits.reduce((max, h) => Math.max(max, h.id), 0) + 1;
          const fallbackHabit: Habit = {
            ...input,
            id: localId,
            streak: input.streak ?? 0,
            completed: input.completed ?? false,
            createdAt: input.createdAt ?? today,
            startDate: input.startDate ?? today,
            history: [{ date: today, completed: input.completed ?? false }],
            completedDates: input.completed ? [today] : [],
            totalCompletions: input.completed ? 1 : 0,
          };
          dispatch({ type: 'add', habit: fallbackHabit });
          scheduleHabitReminder(fallbackHabit);
          return fallbackHabit;
        }
      } catch (err) {
        console.warn('Network call failed, creating habit offline:', err);
        const tempId = -Date.now();
        const fallbackHabit: Habit = {
          ...input,
          id: tempId,
          streak: input.streak ?? 0,
          completed: input.completed ?? false,
          createdAt: input.createdAt ?? today,
          startDate: input.startDate ?? today,
          history: [{ date: today, completed: input.completed ?? false }],
          completedDates: input.completed ? [today] : [],
          totalCompletions: input.completed ? 1 : 0,
        };
        dispatch({ type: 'add', habit: fallbackHabit });
        scheduleHabitReminder(fallbackHabit);
        await syncQueue.enqueue({
          type: 'CREATE_HABIT',
          tempId: String(tempId),
          habitData: backendData,
        });
        return fallbackHabit;
      } finally {
        setIsLoading(false);
      }
    },
    [habits, isAuthenticated],
  );

  const deleteHabit = useCallback(
    async (id: HabitId) => {
      dispatch({ type: 'delete', id });

      if (!isOnline()) {
        await syncQueue.enqueue({
          type: 'DELETE_HABIT',
          tempId: id < 0 ? String(id) : undefined,
          habitId: id > 0 ? id : undefined,
        });
        return;
      }

      if (isAuthenticated) {
        try {
          await api.habits.delete(id);
        } catch (err) {
          console.warn('Failed to delete on server, enqueuing offline delete:', err);
          await syncQueue.enqueue({
            type: 'DELETE_HABIT',
            tempId: id < 0 ? String(id) : undefined,
            habitId: id > 0 ? id : undefined,
          });
        }
      }
    },
    [isAuthenticated],
  );

  const updateHabit = useCallback(
    async (id: HabitId, changes: HabitUpdate) => {
      dispatch({ type: 'update', id, changes });
      const targetHabit = habits.find((h) => h.id === id);
      const updatedMerged = { ...targetHabit, ...changes } as Habit;
      scheduleHabitReminder(updatedMerged);

      const backendData = habitInputToBackend({
        name: changes.name || targetHabit?.name || 'Habit',
        ...changes,
      });

      if (!isOnline()) {
        await syncQueue.enqueue({
          type: 'EDIT_HABIT',
          tempId: id < 0 ? String(id) : undefined,
          habitId: id > 0 ? id : undefined,
          habitData: backendData,
        });
        return;
      }

      if (isAuthenticated) {
        try {
          const updated = await api.habits.update(id, changes);
          dispatch({ type: 'set_single', habit: updated });
        } catch (err) {
          console.warn('Failed to update on server, enqueuing offline update:', err);
          await syncQueue.enqueue({
            type: 'EDIT_HABIT',
            tempId: id < 0 ? String(id) : undefined,
            habitId: id > 0 ? id : undefined,
            habitData: backendData,
          });
        }
      }
    },
    [habits, isAuthenticated],
  );

  const refreshHabits = useCallback(async () => {
    await loadHabits();
  }, [loadHabits]);

  const resetHabits = useCallback(async () => {
    await clearHabitsStorage();
    await syncQueue.clear();
    await loadHabits();
  }, [loadHabits]);

  const syncNow = useCallback(async () => {
    await syncEngine.syncNow();
  }, []);

  const value = useMemo(
    () => ({
      habits,
      isHydrated,
      isLoading,
      toggleHabit,
      addHabit,
      deleteHabit,
      updateHabit,
      refreshHabits,
      resetHabits,
      syncNow,
    }),
    [addHabit, deleteHabit, habits, isHydrated, isLoading, refreshHabits, resetHabits, syncNow, toggleHabit, updateHabit],
  );

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits(): HabitContextValue {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider.');
  }
  return context;
}
