import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

interface PipelineEditorProps {
  onConfigChange?: (config: any) => void;
}

export const PipelineEditor: React.FC<PipelineEditorProps> = ({ onConfigChange }) => {
  return (
    <View style={styles.container}>
      {/* 파이프라인 에디터 UI 구현 예정 */}
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
