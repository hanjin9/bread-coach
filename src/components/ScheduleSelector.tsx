import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

interface ScheduleSelectorProps {
  onScheduleChange?: (schedule: any) => void;
}

export const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({ onScheduleChange }) => {
  return (
    <View style={styles.container}>
      {/* 스케줄 선택 UI 구현 예정 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
});
