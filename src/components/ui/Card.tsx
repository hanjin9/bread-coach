import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing, shadows } from '@/styles/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({ children, style, shadow = 'md' }) => {
  const shadowStyle = shadows[shadow];

  return (
    <View
      style={[
        styles.card,
        {
          ...shadowStyle,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
});
