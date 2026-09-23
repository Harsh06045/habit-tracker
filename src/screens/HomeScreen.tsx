import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
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
import { HabitCard } from '../components/HabitCard';
import { WeeklyCalendarBar } from '../components/WeeklyCalendarBar';
import { OfflineBanner } from '../components/OfflineBanner';
import { useAuth } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { api } from '../services/api';
import { theme } from '../theme';
import { getLocalDateKey, formatHeaderDate, formatLiveTime, getTimeGreeting } from '../utils/date';
import type { Habit, GamificationProfile } from '../types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { habits, toggleHabit, isHydrated, isLoading, refreshHabits } = useHabits();
  // Live time synchronization: ticks every 10 seconds to update clock, greeting, and midnight date transition
  const [now, setNow] = useState(() => new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => getLocalDateKey(now), [now]);
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateKey());
  const [filterMode, setFilterMode] = useState<'Today' | 'All' | 'Pending'>('Today');
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [pointsToast, setPointsToast] = useState<string | null>(null);

  // If user was viewing today and midnight rolls over, keep selectedDate synced with new today
  const isViewingToday = selectedDate === todayStr;

  React.useEffect(() => {
    if (isViewingToday) {
      setSelectedDate(todayStr);
    }
  }, [todayStr]);

  const loadGamification = async () => {
    try {
      const data = await api.gamification.getProfile();
      setGamification(data);
    } catch {
      // Offline fallback
    }
  };

  React.useEffect(() => {
    loadGamification();
  }, [habits]);

  const handleToggle = async (habit: Habit) => {
    const willBeCompleted = !habit.completed;
    await toggleHabit(habit.id, selectedDate);
    if (willBeCompleted) {
      const bonus = habit.streak + 1 === 7 ? ' (+50 Streak Bonus! 🔥)' : '';
      setPointsToast(`+10 Points Earned! ⭐${bonus}`);
      setTimeout(() => setPointsToast(null), 3000);
    }
    loadGamification();
  };

  // Dynamically compute greeting according to real local time
  const timeGreeting = useMemo(() => getTimeGreeting(now), [now]);
  const liveTime = useMemo(() => formatLiveTime(now), [now]);

  // Format date like "Wednesday, 23 September, 2026"
  const formattedHeaderDate = useMemo(() => {
    return formatHeaderDate(isViewingToday ? todayStr : selectedDate);
  }, [isViewingToday, todayStr, selectedDate]);

  // Check if a habit was completed on the selectedDate
  const isHabitCompletedOnDate = (habit: Habit, dateStr: string) => {
    if (dateStr === todayStr) return habit.completed;
    if (habit.completedDates?.includes(dateStr)) return true;
    return habit.history?.some((entry) => entry.date === dateStr && entry.completed) ?? false;
  };

  const displayedHabits = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0 = Sun, 1-5 = Mon-Fri, 6 = Sat

    return habits
      .map((h) => ({
        ...h,
        completed: isHabitCompletedOnDate(h, selectedDate),
      }))
      .filter((h) => {
        if (filterMode === 'Today') {
          return true;
        }
        if (filterMode === 'Pending') {
          return !h.completed;
        }
        return true;
      });
  }, [habits, selectedDate, todayStr, filterMode]);

  const renderHabitItem = ({ item, index }: { item: Habit; index: number }) => (
    <HabitCard
      habit={item}
      isFirst={index === 0}
      isLast={index === displayedHabits.length - 1}
      onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
      onToggle={() => handleToggle(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Floating Points Toast */}
        {pointsToast && (
          <View style={styles.pointsToast}>
            <Text style={styles.pointsToastText}>{pointsToast}</Text>
          </View>
        )}

        {/* FlatList with header and routine cards */}
        <FlatList
          contentContainerStyle={styles.scrollContent}
          data={displayedHabits}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              colors={['#FF6B00']}
              onRefresh={refreshHabits}
              refreshing={isLoading}
              tintColor="#FF6B00"
            />
          }
          ListHeaderComponent={
            <View>
              {/* Offline / Synchronization Status Banner */}
              <OfflineBanner />

              {/* Top User Greeting Bar */}
              <View style={styles.topHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.greetingTitle}>
                    {isViewingToday ? `${timeGreeting}\nHi${user?.name ? `, ${user.name}` : ''} 👋` : 'Viewing History'}
                  </Text>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateSubtitle}>{formattedHeaderDate}</Text>
                    {isViewingToday && (
                      <View style={styles.liveClockBadge}>
                        <View style={styles.livePulseDot} />
                        <Text style={styles.liveClockText}>{liveTime}</Text>
                      </View>
                    )}
                  </View>

                  {/* Gamification Points & Level Pill */}
                  <View style={styles.gamificationPill}>
                    <Text style={styles.gamificationStar}>⭐</Text>
                    <Text style={styles.gamificationPoints}>
                      {gamification?.totalPoints ?? 0} pts
                    </Text>
                    <Text style={styles.gamificationDivider}>•</Text>
                    <Text style={styles.gamificationLevel}>
                      Lvl {gamification?.level ?? 1} {gamification?.levelTitle ?? 'Novice Explorer'}
                    </Text>
                  </View>
                </View>

                {/* Profile Avatar with Pink Ring */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('MainTabs')}
                  style={styles.avatarOuterRing}
                >
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarText}>🧑🏻‍💼</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Weekly Calendar Strip */}
              <View style={styles.calendarWrapper}>
                <WeeklyCalendarBar
                  habits={habits}
                  onSelectDate={(date) => setSelectedDate(date)}
                  selectedDate={selectedDate}
                />
              </View>

              {/* Historical Browsing Indicator Banner */}
              {!isViewingToday && (
                <View style={styles.historyBanner}>
                  <View style={styles.historyBannerLeft}>
                    <Ionicons color="#FF6B00" name="time-outline" size={17} />
                    <View>
                      <Text style={styles.historyBannerTitle}>Viewing Past Date Records</Text>
                      <Text style={styles.historyBannerSub}>{formattedHeaderDate}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setSelectedDate(todayStr)}
                    style={styles.returnTodayBtn}
                  >
                    <Ionicons color="#FFFFFF" name="arrow-undo" size={12} />
                    <Text style={styles.returnTodayBtnText}>Today</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* "Set the reminder" Promo Card */}
              <View style={styles.reminderCard}>
                <View style={styles.reminderTextCol}>
                  <Text style={styles.reminderTitle}>Set the reminder</Text>
                  <Text style={styles.reminderBody}>
                    Never miss your morning routine!{'\n'}Set a reminder to stay on track.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('AddHabit')}
                    style={styles.setNowBtn}
                  >
                    <Text style={styles.setNowBtnText}>Set Now</Text>
                  </TouchableOpacity>
                </View>

                {/* 3D Graphic (Calendar + Clock Badge) */}
                <View style={styles.reminderGraphicBox}>
                  <View style={styles.calendarGraphic}>
                    <View style={styles.calendarSpiral}>
                      <View style={styles.spiralDot} />
                      <View style={styles.spiralDot} />
                      <View style={styles.spiralDot} />
                    </View>
                    <View style={styles.calendarGrid}>
                      <View style={styles.calSquareFilled} />
                      <View style={styles.calSquare} />
                      <View style={styles.calSquare} />
                      <View style={styles.calSquare} />
                      <View style={styles.calSquareFilled} />
                      <View style={styles.calSquare} />
                    </View>
                  </View>
                  <View style={styles.clockGraphicBadge}>
                    <Ionicons color="#FF6B00" name="stopwatch" size={18} />
                  </View>
                </View>
              </View>

              {/* "Daily routine" Section Header */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {filterMode === 'Today' ? 'Daily routine' : 'All habits'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setFilterMode(filterMode === 'Today' ? 'All' : 'Today')}
                >
                  <Text style={styles.seeAllText}>
                    {filterMode === 'Today' ? 'See all' : "Today's"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={renderHabitItem}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button (FAB) - Dark Espresso Circle with White Plus */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('AddHabit')}
          style={styles.fab}
        >
          <Ionicons color="#FFFFFF" name="add" size={28} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.layout.screenHorizontal,
    paddingTop: theme.spacing.md,
    paddingBottom: 96,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  dateSubtitle: {
    fontSize: 13,
    color: '#9E9790',
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  liveClockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5ED',
    borderWidth: 1,
    borderColor: '#EFE3D3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25B76B',
  },
  liveClockText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3E2F2B',
  },
  avatarOuterRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.avatarRing, // Soft pink/coral ring from reference
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE9E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  calendarWrapper: {
    marginBottom: 20,
  },
  reminderCard: {
    backgroundColor: theme.colors.cardPeach, // Soft peach #FFE8DB
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  reminderTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  reminderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  reminderBody: {
    fontSize: 12,
    color: '#70645E',
    lineHeight: 17,
    fontWeight: '400',
    marginBottom: 14,
  },
  setNowBtn: {
    backgroundColor: theme.colors.secondaryDark, // Dark chocolate #372823
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
  },
  setNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reminderGraphicBox: {
    width: 88,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarGraphic: {
    width: 64,
    height: 60,
    backgroundColor: '#4A90E2',
    borderRadius: 14,
    padding: 6,
    justifyContent: 'space-between',
    shadowColor: '#2B5E9E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  calendarSpiral: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -2,
  },
  spiralDot: {
    width: 4,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    marginBottom: 4,
  },
  calSquare: {
    width: 12,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  calSquareFilled: {
    width: 12,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  clockGraphicBadge: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary, // Vibrant Orange #FF6B00
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primaryDark, // Dark Espresso Circle
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1412',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  gamificationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7EB',
    borderWidth: 1,
    borderColor: '#FFE3B3',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    marginTop: 6,
    gap: 5,
  },
  gamificationStar: {
    fontSize: 12,
  },
  gamificationPoints: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  gamificationDivider: {
    fontSize: 10,
    color: '#F59E0B',
  },
  gamificationLevel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
  },
  pointsToast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    zIndex: 999,
    backgroundColor: '#2D2320',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: '#FF6B00',
    ...theme.shadows.card,
  },
  pointsToastText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  historyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F4',
    borderWidth: 1,
    borderColor: '#FFD9C2',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  historyBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  historyBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B00',
  },
  historyBannerSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7C736B',
  },
  returnTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#221C18',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  returnTodayBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
