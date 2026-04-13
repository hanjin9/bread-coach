import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  loop,
} from 'react-native-reanimated';
import { colors } from '@/styles/colors';
import type { BreathingPattern, PipelineConfig, OrbConfig } from '@/types';

interface BreathingAnimationProps {
  pattern: BreathingPattern;
  pipelineConfig: PipelineConfig;
  orbConfig: OrbConfig;
  isRunning: boolean;
}

const { width, height } = Dimensions.get('window');

export const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  pattern,
  pipelineConfig,
  orbConfig,
  isRunning,
}) => {
  const progress = useSharedValue(0);
  const animationRef = useRef<any>(null);

  const totalDuration =
    (pattern.inhale + pattern.hold + pattern.exhale + (pattern.holdAfterExhale || 0)) * 1000;

  useEffect(() => {
    if (isRunning) {
      progress.value = loop(
        withTiming(1, {
          duration: totalDuration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    } else {
      progress.value = 0;
    }
  }, [isRunning, totalDuration]);

  // 구슬 위치 계산
  const orbPositionX = interpolate(
    progress.value,
    [0, 1],
    [pipelineConfig.startX, pipelineConfig.endX],
    Extrapolate.CLAMP
  );

  const orbPositionY = interpolate(
    progress.value,
    [0, 0.5, 1],
    [pipelineConfig.startY, pipelineConfig.endY, pipelineConfig.startY],
    Extrapolate.CLAMP
  );

  // 구슬 크기 변화 (들숨/날숨에 따라)
  const orbScale = interpolate(
    progress.value,
    [0, 0.3, 0.6, 1],
    [1, 1.2, 0.9, 1],
    Extrapolate.CLAMP
  );

  const orbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: orbPositionX },
      { translateY: orbPositionY },
      { scale: orbScale },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* 파이프라인 배경 */}
      <View
        style={[
          styles.pipeline,
          {
            borderColor: pipelineConfig.color,
            borderWidth: pipelineConfig.width,
          },
        ]}
      />

      {/* 애니메이션 구슬 */}
      <Animated.View
        style={[
          styles.orb,
          {
            width: orbConfig.size,
            height: orbConfig.size,
            backgroundColor: orbConfig.color,
            borderRadius: orbConfig.size / 2,
          },
          orbAnimatedStyle,
        ]}
      />

      {/* 호흡 단계 표시 */}
      <View style={styles.stageIndicator}>
        <StageDisplay progress={progress} pattern={pattern} totalDuration={totalDuration} />
      </View>
    </View>
  );
};

interface StageDisplayProps {
  progress: Animated.Shared<number>;
  pattern: BreathingPattern;
  totalDuration: number;
}

const StageDisplay: React.FC<StageDisplayProps> = ({ progress, pattern, totalDuration }) => {
  const inhalePercent = (pattern.inhale / (totalDuration / 1000)) * 100;
  const holdPercent = (pattern.hold / (totalDuration / 1000)) * 100;
  const exhalePercent = (pattern.exhale / (totalDuration / 1000)) * 100;

  const stageAnimatedStyle = useAnimatedStyle(() => {
    const currentPercent = progress.value * 100;

    let stage = '들숨';
    if (currentPercent > inhalePercent + holdPercent + exhalePercent) {
      stage = '정지';
    } else if (currentPercent > inhalePercent + holdPercent) {
      stage = '날숨';
    } else if (currentPercent > inhalePercent) {
      stage = '정지';
    }

    return {};
  });

  return (
    <Animated.View style={[styles.stageText, stageAnimatedStyle]}>
      {/* 단계 텍스트는 상위에서 처리 */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pipeline: {
    position: 'absolute',
    width: '90%',
    height: 80,
    borderRadius: 40,
  },
  orb: {
    position: 'absolute',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  stageIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stageText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
});
