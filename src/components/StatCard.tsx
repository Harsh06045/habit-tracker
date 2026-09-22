import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = theme.colors.primary,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconBox, { backgroundColor: `${color}16` }]}>
        <Ionicons color={color} name={icon} size={20} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
