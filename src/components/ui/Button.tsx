import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.marble;
    switch (variant) {
      case 'primary':
        return colors.secondary;
      case 'secondary':
        return colors.surface;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return colors.secondary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return colors.textInverse;
      case 'secondary':
        return colors.secondary;
      case 'outline':
        return colors.secondary;
      case 'ghost':
        return colors.textPrimary;
      default:
        return colors.textInverse;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'md':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      case 'lg':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: colors.secondary,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
          ...getBorderStyle(),
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: getTextColor() },
          typography.button,
          textStyle,
        ]}
      >
        {loading ? '로딩 중...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
