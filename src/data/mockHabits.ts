import type { Habit } from '../types';

const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const d0 = getPastDateStr(0); // Today
const d1 = getPastDateStr(1); // Yesterday
const d2 = getPastDateStr(2);
const d3 = getPastDateStr(3);
const d4 = getPastDateStr(4);
const d5 = getPastDateStr(5);
const d6 = getPastDateStr(6);

/**
 * Seed data for Habit Tracker matching Phase 1 requirements
 * with "Read Book" (streak: 7, completed: true) and "Workout" (streak: 4, completed: false),
 * plus routines matching the user's reference design with rich historical dates.
 */
export const mockHabits: Habit[] = [
  {
    id: 1,
    name: 'Read Book',
    streak: 7,
    completed: true,
    icon: 'book',
    color: '#FF6B00',
    category: 'Learning',
    description: 'Read 20 focused pages every day.',
    frequency: 'Daily',
    goal: '20 min',
    reminder: '8:00 PM',
    createdAt: '2026-09-01',
    totalCompletions: 21,
    completedDates: [d0, d1, d2, d3, d4, d5, d6],
    history: [
      { date: d0, completed: true },
      { date: d1, completed: true },
      { date: d2, completed: true },
      { date: d3, completed: true },
      { date: d4, completed: true },
      { date: d5, completed: true },
      { date: d6, completed: true },
    ],
  },
  {
    id: 2,
    name: 'Workout',
    streak: 4,
    completed: false,
    icon: 'barbell',
    color: '#DF68C6',
    category: 'Fitness',
    description: 'Strength or mobility training.',
    frequency: 'Daily',
    goal: '30 min',
    reminder: '6:30 AM',
    createdAt: '2026-09-04',
    totalCompletions: 16,
    completedDates: [d1, d2, d3, d4],
    history: [
      { date: d0, completed: false },
      { date: d1, completed: true },
      { date: d2, completed: true },
      { date: d3, completed: true },
      { date: d4, completed: true },
    ],
  },
  {
    id: 3,
    name: 'Drink a glass of milk',
    streak: 3,
    completed: true,
    icon: 'water',
    color: '#C9773B',
    category: 'Health',
    description: 'Morning healthy drink for nutrition.',
    frequency: 'Daily',
    goal: '5 min',
    reminder: '7:30 AM',
    createdAt: '2026-09-10',
    totalCompletions: 12,
    completedDates: [d0, d1, d2],
    history: [
      { date: d0, completed: true },
      { date: d1, completed: true },
      { date: d2, completed: true },
    ],
  },
  {
    id: 4,
    name: 'Meditate to relax',
    streak: 6,
    completed: true,
    icon: 'leaf',
    color: '#25B76B',
    category: 'Mindfulness',
    description: 'Calm mindful breathing session.',
    frequency: 'Daily',
    goal: '15 min',
    reminder: '7:00 AM',
    createdAt: '2026-09-06',
    totalCompletions: 19,
    completedDates: [d0, d1, d2, d3, d4, d5],
    history: [
      { date: d0, completed: true },
      { date: d1, completed: true },
      { date: d2, completed: true },
      { date: d3, completed: true },
      { date: d4, completed: true },
      { date: d5, completed: true },
    ],
  },
  {
    id: 5,
    name: 'Stretch for 10 minutes',
    streak: 5,
    completed: false,
    icon: 'fitness',
    color: '#4F8CFF',
    category: 'Health',
    description: 'Full body mobility and flexibility.',
    frequency: 'Daily',
    goal: '10 min',
    reminder: '9:00 AM',
    createdAt: '2026-09-08',
    totalCompletions: 14,
    completedDates: [d1, d2, d3, d4, d5],
    history: [
      { date: d0, completed: false },
      { date: d1, completed: true },
      { date: d2, completed: true },
      { date: d3, completed: true },
      { date: d4, completed: true },
      { date: d5, completed: true },
    ],
  },
];

export const habits = mockHabits;
