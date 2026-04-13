import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';

interface VideoPlayerProps {
  videoUrl: string;
  onPlaybackStatusUpdate?: (status: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onPlaybackStatusUpdate }) => {
  return (
    <View style={styles.container}>
      {/* Expo Video 또는 React Native Video 통합 예정 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
});
