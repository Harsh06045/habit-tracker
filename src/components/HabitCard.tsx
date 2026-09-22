import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import type { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
  onToggle: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onPress,
  onToggle,
  isFirst = false,
  isLast = false,
  style,
}) => {
  const handleToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    onToggle();
  };

  // Icon and soft pastel colors matching reference design
  const getIconConfig = () => {
    const name = habit.name.toLowerCase();
    if (name.includes('milk') || name.includes('water') || name.includes('drink')) {
      return {
        icon: 'water' as const,
        iconColor: '#C9773B',
        bgColor: '#F6EBE2',
        duration: '5 min',
      };
    }
    if (name.includes('meditat') || name.includes('relax') || name.includes('mind')) {
      return {
        icon: 'leaf' as const,
        iconColor: '#25B76B',
        bgColor: '#EAF6EE',
        duration: '15 min',
      };
    }
    if (name.includes('stretch') || name.includes('yoga')) {
      return {
        icon: 'fitness' as const,
        iconColor: '#4F8CFF',
        bgColor: '#EBF0FA',
        duration: '10 min',
      };
    }
    if (name.includes('workout') || name.includes('exercise') || name.includes('gym')) {
      return {
        icon: 'barbell' as const,
        iconColor: '#DF68C6',
        bgColor: '#FCEBF0',
        duration: '30 min',
      };
    }
    if (name.includes('book') || name.includes('read') || name.includes('study')) {
      return {
        icon: 'book' as const,
        iconColor: '#FF7A00',
        bgColor: '#FFF0E6',
        duration: '20 min',
      };
    }
    return {
      icon: 'sparkles' as const,
      iconColor: '#FF7A00',
      bgColor: '#FFF0E6',
      duration: habit.goal || '15 min',
    };
  };

  const config = getIconConfig();

  return (
    <View style={[styles.timelineRow, style]}>
      {/* Left Timeline Indicator */}
      <View style={styles.timelineColumn}>
        <View style={[styles.timelineTopLine, isFirst && styles.timelineLineInvisible]} />
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={handleToggle}
          style={[
            styles.checkCircle,
            habit.completed && styles.checkCircleCompleted,
          ]}
        >
          {habit.completed ? (
            <Ionicons color="#FFFFFF" name="checkmark" size={13} />
          ) : null}
        </TouchableOpacity>
        <View style={[styles.timelineBottomLine, isLast && styles.timelineLineInvisible]} />
      </View>

      {/* Main Habit Card */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.card}
      >
        {/* Pastel Icon Container */}
        <View style={[styles.iconBox, { backgroundColor: config.bgColor }]}>
          <Ionicons color={config.iconColor} name={config.icon} size={22} />
        </View>

        {/* Content: Title & Streak */}
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.habitTitle}>
            {habit.name}
          </Text>
          <Text style={styles.streakText}>
            Streak {habit.streak} days
          </Text>
        </View>

        {/* Right Duration with Clock */}
        <View style={styles.durationBox}>
          <Ionicons color="#221C18" name="time" size={16} />
          <Text style={styles.durationText}>{config.duration}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineColumn: {
    width: 32,
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginRight: 6,
  },
  timelineTopLine: {
    flex: 1,
    width: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E6E1DC',
  },
  timelineBottomLine: {
    flex: 1,
    width: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E6E1DC',
  },
  timelineLineInvisible: {
    borderColor: 'transparent',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D8D3CD',
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  checkCircleCompleted: {
    backgroundColor: '#FF7A00', // Reference vibrant orange check circle
    borderColor: '#FF7A00',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: '#F3EFEB',
    ...theme.shadows.card,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9C958E',
  },
  durationBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#847D77',
  },
});
