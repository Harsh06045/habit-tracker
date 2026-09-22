import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showClose?: boolean;
  onClose?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
  };
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showClose = false,
  onClose,
  rightAction,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={onBack}
            style={styles.circleButton}
          >
            <Ionicons color={theme.colors.text} name="chevron-back" size={20} />
          </TouchableOpacity>
        ) : title ? (
          <View style={styles.leftTitleContainer}>
            <Text numberOfLines={2} style={styles.title}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}

        {showBack && title ? (
          <View style={styles.centerTitleContainer}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}

        {showClose ? (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={onClose || onBack}
            style={styles.circleButton}
          >
            <Ionicons color={theme.colors.text} name="close" size={20} />
          </TouchableOpacity>
        ) : rightAction ? (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={rightAction.onPress}
            style={styles.circleButton}
          >
            <Ionicons
              color={rightAction.color || theme.colors.text}
              name={rightAction.icon}
              size={20}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.screenHorizontal,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3EFEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftTitleContainer: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  centerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  placeholder: {
    width: 42,
  },
});
