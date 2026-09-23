import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { api } from '../services/api';
import { theme } from '../theme';
import { getLocalDateKey, getMondayOfWeek, getSundayOfWeek } from '../utils/date';
import type { MonthStats, WeekStats, GamificationProfile } from '../types';

type ProgressScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Progress'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ProgressScreenProps {
  navigation: ProgressScreenNavigationProp;
}

const DEFAULT_COLORS = ['#3E2F2B', '#A84D1E', '#7B9A36', '#DF68C6', '#2563EB', '#FF6B00'];

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const { habits } = useHabits();

  const [weekStats, setWeekStats] = useState<WeekStats | null>(null);
  const [monthStats, setMonthStats] = useState<MonthStats | null>(null);
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'Week' | 'Month'>('Week');

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [w, m, g] = await Promise.all([
        api.statistics.getWeekStats().catch(() => null),
        api.statistics.getMonthStats().catch(() => null),
        api.gamification.getProfile().catch(() => null),
      ]);
      if (w) setWeekStats(w);
      if (m) setMonthStats(m);
      if (g) setGamification(g);
    } catch (err) {
      console.warn('Failed to fetch statistics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Derive dynamic time ranges based on current time and date
  const now = new Date();
  const currentMonday = getMondayOfWeek(now);
  const currentSunday = getSundayOfWeek(currentMonday);
  const weekStartShort = currentMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEndShort = currentSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekDateRange = `${weekStartShort} – ${weekEndShort}`;
  const currentMonthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate this week's 7 ISO date keys (Mon - Sun)
  const currentWeekDates = React.useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + i);
      dates.push(getLocalDateKey(d));
    }
    return dates;
  }, [currentMonday]);

  const currentYearMonth = getLocalDateKey(now).slice(0, 7); // e.g. "2026-09"

  // Derive top capsule charts
  const activeHabitsList = (timeframe === 'Week' ? weekStats?.habits : monthStats?.habits) || [];

  const chartItems = activeHabitsList.length > 0
    ? activeHabitsList.slice(0, 4).map((h, idx) => ({
        id: h.id,
        label: h.name.length > 9 ? h.name.slice(0, 8) + '…' : h.name,
        fullName: h.name,
        percentage: Math.min(100, Math.max(0, Math.round(h.completionPercentage))),
        streak: h.streak,
        fillColor: h.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      }))
    : habits.length > 0
    ? habits.slice(0, 4).map((h, idx) => {
        let pct = 0;
        if (timeframe === 'Week') {
          const completedThisWeek = currentWeekDates.filter((d) => {
            if (d === getLocalDateKey()) return h.completed;
            return h.completedDates?.includes(d) || h.history?.some((e) => e.date === d && e.completed);
          }).length;
          const dayIdx = ((now.getDay() + 6) % 7) + 1; // 1 for Mon ... 7 for Sun
          pct = Math.round((completedThisWeek / Math.max(1, dayIdx)) * 100);
        } else {
          const completedThisMonth = (h.completedDates || []).filter((d) => d.startsWith(currentYearMonth)).length +
            (h.completed && !h.completedDates?.includes(getLocalDateKey()) ? 1 : 0);
          pct = Math.round((completedThisMonth / Math.max(1, now.getDate())) * 100);
        }
        return {
          id: h.id,
          label: h.name.length > 9 ? h.name.slice(0, 8) + '…' : h.name,
          fullName: h.name,
          percentage: Math.min(100, Math.max(0, pct)),
          streak: h.streak,
          fillColor: h.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        };
      })
    : [
        { id: 1, label: 'Read Book', fullName: 'Read Book', percentage: 0, streak: 0, fillColor: '#3E2F2B' },
        { id: 2, label: 'Workout', fullName: 'Workout', percentage: 0, streak: 0, fillColor: '#A84D1E' },
        { id: 3, label: 'Drink Water', fullName: 'Drink a glass of water', percentage: 0, streak: 0, fillColor: '#7B9A36' },
        { id: 4, label: 'Meditate', fullName: 'Meditate to relax', percentage: 0, streak: 0, fillColor: '#DF68C6' },
      ];

  // Calculate points and metrics from current state
  const totalCompleted = weekStats?.totalCompleted ?? habits.filter((h) => h.completed).length;
  const bestStreak = monthStats?.bestStreak ?? (habits.length > 0 ? Math.max(...habits.map((h) => h.streak), 0) : 0);
  const points = gamification?.totalPoints ?? (totalCompleted * 10);
  const overallPercentage = timeframe === 'Week'
    ? (weekStats?.completionPercentage ?? (chartItems.length > 0 ? Math.round(chartItems.reduce((acc, c) => acc + c.percentage, 0) / chartItems.length) : 0))
    : (monthStats?.completionPercentage ?? (chartItems.length > 0 ? Math.round(chartItems.reduce((acc, c) => acc + c.percentage, 0) / chartItems.length) : 0));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        onClose={() => navigation.navigate('Home')}
        showClose
        title={`Your progress\nand insights`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={['#FF6B00']}
            onRefresh={loadStats}
            refreshing={isLoading}
            tintColor="#FF6B00"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Timeframe Switcher */}
        <View style={styles.timeframeTabs}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setTimeframe('Week')}
            style={[styles.timeframeTab, timeframe === 'Week' && styles.timeframeTabActive]}
          >
            <Text style={[styles.timeframeText, timeframe === 'Week' && styles.timeframeTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setTimeframe('Month')}
            style={[styles.timeframeTab, timeframe === 'Month' && styles.timeframeTabActive]}
          >
            <Text style={[styles.timeframeText, timeframe === 'Month' && styles.timeframeTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4 Vertical Capsule Bar Charts matching reference design */}
        <View style={styles.chartContainer}>
          {chartItems.map((item) => (
            <View key={item.id} style={styles.chartColumn}>
              {/* Tall Pill Capsule */}
              <View style={styles.pillContainer}>
                {/* Upper Hatch Striped Pattern Area */}
                <View style={styles.hatchedArea}>
                  <View style={styles.hatchStripe} />
                  <View style={styles.hatchStripe} />
                  <View style={styles.hatchStripe} />
                  <View style={styles.hatchStripe} />
                  <View style={styles.hatchStripe} />
                  <View style={styles.hatchStripe} />
                  <View style={styles.hatchStripe} />
                </View>

                {/* Lower Filled Portion */}
                <View
                  style={[
                    styles.pillFill,
                    {
                      height: `${Math.max(12, item.percentage)}%`,
                      backgroundColor: item.fillColor,
                    },
                  ]}
                >
                  <Text style={styles.percentageText}>{item.percentage}%</Text>
                </View>
              </View>

              {/* Label below pill */}
              <Text numberOfLines={1} style={styles.columnLabel}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Your Progress Section (Horizontal Progress Bars requested in prompt) */}
        <View style={styles.progressCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.sectionSubBadge}>
              {timeframe === 'Week' ? `Week of ${weekStartShort}` : currentMonthName}
            </Text>
          </View>

          {chartItems.map((habit) => (
            <View key={habit.id} style={styles.progressItem}>
              <View style={styles.progressItemHeader}>
                <Text style={styles.habitItemName}>{habit.fullName}</Text>
                <View style={styles.progressRightMeta}>
                  <Text style={styles.streakIndicator}>🔥 {habit.streak}d</Text>
                  <Text style={styles.progressItemPercent}>{habit.percentage}%</Text>
                </View>
              </View>

              {/* Horizontal Progress Track and Bar */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${habit.percentage}%`,
                      backgroundColor: habit.fillColor,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Points Earned Card matching reference design */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeaderRow}>
            <View>
              <Text style={styles.pointsTitle}>Points Earned</Text>
              <Text style={styles.pointsSubtitle}>
                {timeframe === 'Week' ? `This week (${weekDateRange})` : `This month (${currentMonthName})`}
              </Text>
            </View>
            <Text style={styles.pointsValue}>
              {gamification?.totalPoints ?? points} Points
            </Text>
          </View>

          {/* 3-Column Sub-metrics with Vertical Dividers */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Completion</Text>
              <Text style={styles.metricValue}>{Math.round(overallPercentage)}%</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Done Habits</Text>
              <Text style={styles.metricValue}>{totalCompleted}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Best Streak</Text>
              <Text style={styles.metricValue}>🔥 {bestStreak}d</Text>
            </View>
          </View>
        </View>

        {/* Phase 11 Level Progression & Badges Section */}
        <View style={styles.achievementsCard}>
          <View style={styles.levelHeaderRow}>
            <View>
              <Text style={styles.levelTitleText}>
                Level {gamification?.level ?? 1} • {gamification?.levelTitle ?? 'Novice Explorer'}
              </Text>
              <Text style={styles.levelSubText}>
                {gamification?.totalPoints ?? points} / {gamification?.nextLevelPoints ?? 100} points to next level
              </Text>
            </View>
            <View style={styles.levelBadgePill}>
              <Text style={styles.levelBadgePillText}>Lvl {gamification?.level ?? 1}</Text>
            </View>
          </View>

          {/* Level Progress Bar */}
          <View style={styles.levelProgressBar}>
            <View
              style={[
                styles.levelProgressFill,
                {
                  width: `${Math.min(
                    100,
                    Math.max(0, gamification?.progressToNextLevel ?? Math.round((points / 100) * 100)),
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={styles.badgesSectionHeader}>
            <Text style={styles.badgesSectionTitle}>
              Badges & Achievements ({gamification?.badgesCount ?? (totalCompleted > 0 ? 1 : 0)} Unlocked)
            </Text>
          </View>

          {/* Badges List */}
          <View style={styles.badgesGrid}>
            {(gamification?.badges && gamification.badges.length > 0
              ? gamification.badges
              : [
                  {
                    code: 'FIRST_STEP',
                    name: 'First Step',
                    description: 'Completed your first habit!',
                    icon: 'footprints',
                    unlocked: totalCompleted > 0,
                  },
                  {
                    code: 'STREAK_7',
                    name: '7-Day Champion',
                    description: 'Maintained a 7-day streak',
                    icon: 'flame',
                    unlocked: bestStreak >= 7,
                  },
                  {
                    code: 'PERFECT_DAY',
                    name: 'Daily Perfection',
                    description: 'Completed all habits today',
                    icon: 'sparkles',
                    unlocked: habits.length > 0 && habits.every((h) => h.completed),
                  },
                  {
                    code: 'STREAK_30',
                    name: 'Habit Master',
                    description: 'Unbroken 30-day streak',
                    icon: 'trophy',
                    unlocked: bestStreak >= 30,
                  },
                  {
                    code: 'CENTURY_CLUB',
                    name: 'Century Club',
                    description: '100 habit completions',
                    icon: 'award',
                    unlocked: totalCompleted >= 100,
                  },
                ]
            ).map((badge) => (
              <View
                key={badge.code}
                style={[
                  styles.badgeCard,
                  badge.unlocked ? styles.badgeCardUnlocked : styles.badgeCardLocked,
                ]}
              >
                <View
                  style={[
                    styles.badgeIconBox,
                    badge.unlocked ? styles.badgeIconUnlocked : styles.badgeIconLocked,
                  ]}
                >
                  <Text style={styles.badgeEmoji}>
                    {badge.code === 'FIRST_STEP'
                      ? '👟'
                      : badge.code === 'STREAK_7'
                      ? '🔥'
                      : badge.code === 'PERFECT_DAY'
                      ? '✨'
                      : badge.code === 'STREAK_30'
                      ? '🏆'
                      : '🎖️'}
                  </Text>
                </View>
                <View style={styles.badgeInfo}>
                  <Text
                    style={[
                      styles.badgeName,
                      !badge.unlocked && styles.badgeNameLocked,
                    ]}
                  >
                    {badge.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.badgeDesc}>
                    {badge.description}
                  </Text>
                </View>
                {badge.unlocked ? (
                  <Text style={styles.badgeCheck}>✅</Text>
                ) : (
                  <Text style={styles.badgeLock}>🔒</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Share Progress Action Button */}
        <View style={styles.ctaWrapper}>
          <Button
            onPress={() => {
              if (typeof window !== 'undefined' && window.alert) {
                window.alert(`🎉 Great job! You have earned ${points} Points with an average of ${Math.round(overallPercentage)}% completion!`);
              }
            }}
            size="lg"
            title="Share Progress"
          />
        </View>
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
    paddingTop: theme.spacing.sm,
    paddingBottom: 96,
  },
  timeframeTabs: {
    flexDirection: 'row',
    backgroundColor: '#EFECE7',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  timeframeTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  timeframeTabActive: {
    backgroundColor: '#FFFFFF',
    ...theme.shadows.card,
  },
  timeframeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#847D77',
  },
  timeframeTextActive: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 290,
    marginTop: 6,
    marginBottom: 26,
    paddingHorizontal: 4,
  },
  chartColumn: {
    alignItems: 'center',
    width: '22%',
  },
  pillContainer: {
    width: '100%',
    height: 250,
    borderRadius: theme.radius.pill,
    backgroundColor: '#EFECE7',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  hatchedArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.25,
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  hatchStripe: {
    height: 2,
    width: '140%',
    backgroundColor: '#9E9790',
    transform: [{ rotate: '-35deg' }, { translateX: -10 }],
  },
  pillFill: {
    width: '100%',
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 14,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1EDE7',
    ...theme.shadows.card,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  sectionSubBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  progressRightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B00',
  },
  progressItemPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EFECE7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  pointsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1EDE7',
    ...theme.shadows.card,
    marginBottom: 24,
  },
  pointsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
  },
  pointsSubtitle: {
    fontSize: 12,
    color: '#9C958E',
    marginTop: 2,
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#9C958E',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#EAE6E1',
  },
  achievementsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1EDE7',
    ...theme.shadows.card,
    marginBottom: 24,
  },
  levelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  levelTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  levelSubText: {
    fontSize: 12,
    color: '#9C958E',
    marginTop: 2,
    fontWeight: '500',
  },
  levelBadgePill: {
    backgroundColor: '#FFF4EB',
    borderWidth: 1,
    borderColor: '#FCD9BD',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  levelBadgePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  levelProgressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EFECE7',
    overflow: 'hidden',
    marginBottom: 20,
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  badgesSectionHeader: {
    marginBottom: 12,
    paddingTop: 4,
  },
  badgesSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badgesGrid: {
    gap: 10,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  badgeCardUnlocked: {
    backgroundColor: '#FCFAF7',
    borderColor: '#EFEAE3',
  },
  badgeCardLocked: {
    backgroundColor: '#F9F8F6',
    borderColor: '#ECEAE6',
    opacity: 0.65,
  },
  badgeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeIconUnlocked: {
    backgroundColor: '#FFF2E6',
  },
  badgeIconLocked: {
    backgroundColor: '#ECEAE6',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  badgeNameLocked: {
    color: '#8A847E',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#9C958E',
    marginTop: 2,
  },
  badgeCheck: {
    fontSize: 16,
  },
  badgeLock: {
    fontSize: 15,
  },
  ctaWrapper: {
    marginTop: 4,
    marginBottom: 16,
  },
});
