import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'dark' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = () => {
    switch (variant) {
      case 'dark':
        return styles.darkContainer;
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'ghost':
        return styles.ghostContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'dark':
        return styles.darkText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      case 'md':
      default:
        return styles.sizeMd;
    }
  };

  const getIconColor = () => {
    if (disabled) return theme.colors.textFaint;
    switch (variant) {
      case 'secondary':
        return theme.colors.primary;
      case 'outline':
      case 'ghost':
        return theme.colors.text;
      case 'dark':
      case 'danger':
      case 'primary':
      default:
        return theme.colors.white;
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.white}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' ? (
            <Ionicons
              color={getIconColor()}
              name={icon}
              size={iconSize}
              style={styles.iconLeft}
            />
          ) : null}
          <Text
            style={[
              styles.baseText,
              getTextStyle(),
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' ? (
            <Ionicons
              color={getIconColor()}
              name={icon}
              size={iconSize}
              style={styles.iconRight}
            />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  sizeSm: {
    height: 38,
    paddingHorizontal: 16,
  },
  sizeMd: {
    height: 48,
    paddingHorizontal: 22,
  },
  sizeLg: {
    height: 54,
    paddingHorizontal: 26,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primary, // Vibrant Orange
  },
  primaryText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  darkContainer: {
    backgroundColor: theme.colors.secondaryDark, // Dark Chocolate #372823
  },
  darkText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryContainer: {
    backgroundColor: theme.colors.cardPeachSoft,
  },
  secondaryText: {
    color: theme.colors.primary,
    fontSize: 15,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  outlineText: {
    color: theme.colors.text,
    fontSize: 15,
  },
  dangerContainer: {
    backgroundColor: theme.colors.danger,
  },
  dangerText: {
    color: theme.colors.white,
    fontSize: 15,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  disabledContainer: {
    backgroundColor: theme.colors.surfaceMuted,
    borderColor: theme.colors.border,
  },
  disabledText: {
    color: theme.colors.textFaint,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
