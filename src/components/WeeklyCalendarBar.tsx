import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getLocalDateKey, getMondayOfWeek, getSundayOfWeek } from '../utils/date';
import type { Habit } from '../types';

interface DayItem {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  hasCompletions: boolean;
  completedCount: number;
}

interface WeeklyCalendarBarProps {
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
  habits?: Habit[];
}

export const WeeklyCalendarBar: React.FC<WeeklyCalendarBarProps> = ({
  selectedDate,
  onSelectDate,
  habits = [],
}) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const todayStr = getLocalDateKey();
  const activeDate = selectedDate || todayStr;

  // Sync week offset if user clicks a date outside the current week offset
  React.useEffect(() => {
    if (!selectedDate) return;
    const parts = selectedDate.split('-').map(Number);
    const sel = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((sel.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const targetOffset = Math.floor(diffDays / 7);
    if (Math.abs(targetOffset - weekOffset) > 1) {
      setWeekOffset(targetOffset);
    }
  }, [selectedDate]);

  const { days, weekLabel, rangeLabel } = React.useMemo(() => {
    const monday = getMondayOfWeek(new Date(), weekOffset);
    const sunday = getSundayOfWeek(monday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const result: DayItem[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const dateStr = getLocalDateKey(d);
      const isToday = dateStr === todayStr;

      // Check completions from habits for this date
      let completedCount = 0;
      for (const h of habits) {
        if (dateStr === todayStr) {
          if (h.completed) completedCount++;
        } else if (h.completedDates?.includes(dateStr)) {
          completedCount++;
        } else if (h.history?.some((entry) => entry.date === dateStr && entry.completed)) {
          completedCount++;
        }
      }

      result.push({
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        dateStr,
        isToday,
        hasCompletions: completedCount > 0,
        completedCount,
      });
    }

    // Format week title
    let weekLabel = 'This Week';
    if (weekOffset === -1) weekLabel = 'Last Week';
    else if (weekOffset === 1) weekLabel = 'Next Week';
    else if (weekOffset < -1) weekLabel = `${Math.abs(weekOffset)} weeks ago`;
    else if (weekOffset > 1) weekLabel = `In ${weekOffset} weeks`;

    const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
    const rangeLabel =
      startMonth === endMonth
        ? `${startMonth} ${monday.getDate()} – ${sunday.getDate()}`
        : `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}`;

    return { days: result, weekLabel, rangeLabel };
  }, [weekOffset, habits, todayStr]);

  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
  const handleResetToCurrentWeek = () => {
    setWeekOffset(0);
    onSelectDate?.(todayStr);
  };

  return (
    <View style={styles.wrapper}>
      {/* Week Header with Navigation */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.weekLabelRow}>
            <Text style={styles.weekLabelText}>{weekLabel}</Text>
            <Text style={styles.rangeLabelText}>({rangeLabel})</Text>
          </View>
        </View>

        <View style={styles.navActionsRow}>
          {weekOffset !== 0 || activeDate !== todayStr ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleResetToCurrentWeek}
              style={styles.todayPillBtn}
            >
              <Text style={styles.todayPillText}>Today</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            accessibilityLabel="Previous week"
            activeOpacity={0.7}
            onPress={handlePrevWeek}
            style={styles.navArrowBtn}
          >
            <Ionicons color="#847D77" name="chevron-back" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="Next week"
            activeOpacity={0.7}
            onPress={handleNextWeek}
            style={styles.navArrowBtn}
          >
            <Ionicons color="#847D77" name="chevron-forward" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days Horizontal Strip */}
      <View style={styles.daysContainer}>
        {days.map((item) => {
          const isSelected = activeDate === item.dateStr;

          return (
            <TouchableOpacity
              key={item.dateStr}
              activeOpacity={0.7}
              onPress={() => onSelectDate?.(item.dateStr)}
              style={styles.dayColumn}
            >
              {/* Day Name (Mon, Tue, ...) */}
              <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                {item.dayName}
              </Text>

              {/* Day Number Circle */}
              <View
                style={[
                  styles.numberContainer,
                  item.isToday && !isSelected && styles.numberContainerToday,
                  isSelected && styles.numberContainerSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    item.isToday && !isSelected && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {item.dayNumber}
                </Text>

                {/* Completion Dot Indicator */}
                {item.hasCompletions ? (
                  <View
                    style={[
                      styles.completionDot,
                      isSelected ? styles.completionDotSelected : styles.completionDotActive,
                    ]}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#F2EFEB',
    ...theme.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  titleCol: {
    flex: 1,
  },
  weekLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  weekLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  rangeLabelText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9C9690',
  },
  navActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayPillBtn: {
    backgroundColor: '#FFF2E8',
    borderColor: '#FFD4B8',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B00',
  },
  navArrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#ECE8E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
    minWidth: 38,
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#847D77',
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  numberContainer: {
    width: 38,
    height: 44,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  numberContainerToday: {
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    backgroundColor: '#FFF8F4',
  },
  numberContainerSelected: {
    backgroundColor: theme.colors.primaryDark, // Dark espresso #221C18
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dayNumberToday: {
    color: '#FF6B00',
    fontWeight: '800',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  completionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 5,
  },
  completionDotActive: {
    backgroundColor: '#25B76B',
  },
  completionDotSelected: {
    backgroundColor: '#FF8833',
  },
});
