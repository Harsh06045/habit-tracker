import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

interface DayItem {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
}

interface WeeklyCalendarBarProps {
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

export const WeeklyCalendarBar: React.FC<WeeklyCalendarBarProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const days: DayItem[] = React.useMemo(() => {
    // Generate Monday-Sunday around current week or March 10 reference
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon
    const mondayDiff = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayDiff);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const result: DayItem[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = dateStr === today.toISOString().slice(0, 10);
      result.push({
        dayName: dayNames[i],
        dayNumber: d.getDate(),
        dateStr,
        isToday,
      });
    }

    return result;
  }, []);

  return (
    <View style={styles.container}>
      {days.map((item) => {
        const isSelected = selectedDate === item.dateStr || (!selectedDate && item.isToday);

        return (
          <TouchableOpacity
            key={item.dateStr}
            activeOpacity={0.7}
            disabled={!onSelectDate}
            onPress={() => onSelectDate?.(item.dateStr)}
            style={styles.dayColumn}
          >
            <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
              {item.dayName}
            </Text>

            <View style={[styles.numberContainer, isSelected && styles.numberContainerSelected]}>
              <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                {item.dayNumber}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
    minWidth: 38,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#847D77',
  },
  dayNameSelected: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  numberContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberContainerSelected: {
    backgroundColor: theme.colors.primaryDark, // Solid dark black/espresso #2D2320
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
