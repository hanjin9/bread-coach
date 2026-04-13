import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';

interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color = colors.secondary,
  message,
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'error' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary' }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.secondary;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ value, onValueChange }) => {
  return (
    <View
      style={[
        styles.switch,
        {
          backgroundColor: value ? colors.secondary : colors.marble,
        },
      ]}
    >
      <View
        style={[
          styles.switchThumb,
          {
            transform: [{ translateX: value ? 20 : 0 }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
});
