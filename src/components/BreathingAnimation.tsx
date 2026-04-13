import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  Extrapolation,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '@/styles/colors';
import type { BreathingPattern, PipelineConfig, OrbConfig } from '@/types';

interface BreathingAnimationProps {
  pattern: BreathingPattern;
  pipelineConfig: PipelineConfig;
  orbConfig: OrbConfig;
  isRunning: boolean;
  onStageChange?: (stage: string, secondsLeft: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BreathingAnimation: React.FC<BreathingAnimationProps> = ({
  pattern,
  pipelineConfig,
  orbConfig,
  isRunning,
  onStageChange,
}) => {
  // ✅ 결함 7 수정: 각 단계별 sharedValue로 분리
  const inhaleProgress = useSharedValue(0);  // 0→1 들숨
  const holdProgress   = useSharedValue(0);  // 0→1 정지(들숨 후)
  const exhaleProgress = useSharedValue(0);  // 0→1 날숨
  const hold2Progress  = useSharedValue(0);  // 0→1 정지(날숨 후)
  const stageValue     = useSharedValue(0);  // 0=들숨 1=정지 2=날숨 3=정지2

  const inhaleDur  = pattern.inhale * 1000;
  const holdDur    = pattern.hold * 1000;
  const exhaleDur  = pattern.exhale * 1000;
  const hold2Dur   = (pattern.holdAfterExhale || 0) * 1000;

  useEffect(() => {
    if (!isRunning) {
      cancelAnimation(inhaleProgress);
      cancelAnimation(holdProgress);
      cancelAnimation(exhaleProgress);
      cancelAnimation(hold2Progress);
      cancelAnimation(stageValue);
      inhaleProgress.value = withTiming(0, { duration: 300 });
      holdProgress.value   = 0;
      exhaleProgress.value = 0;
      hold2Progress.value  = 0;
      stageValue.value     = 0;
      return;
    }

    // ✅ withSequence + withRepeat으로 올바르게 루프 구성
    const runCycle = () => {
      stageValue.value = 0;
      inhaleProgress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: inhaleDur, easing: Easing.inOut(Easing.ease) })
      );
      holdProgress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: inhaleDur }),  // 들숨 대기
        withTiming(1, { duration: holdDur })
      );
      exhaleProgress.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: inhaleDur + holdDur }),  // 대기
        withTiming(1, { duration: exhaleDur, easing: Easing.inOut(Easing.ease) })
      );
      if (hold2Dur > 0) {
        hold2Progress.value = withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: inhaleDur + holdDur + exhaleDur }),
          withTiming(1, { duration: hold2Dur })
        );
      }
      // stageValue: 전체 사이클 진행
      stageValue.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.99, { duration: inhaleDur }),       // 들숨
          withTiming(1.0, { duration: 0 }),
          withTiming(1.99, { duration: holdDur }),         // 정지
          withTiming(2.0, { duration: 0 }),
          withTiming(2.99, { duration: exhaleDur }),       // 날숨
          withTiming(3.0, { duration: 0 }),
          withTiming(3.99, { duration: Math.max(hold2Dur, 100) }) // 정지2
        ),
        -1, false
      );
    };

    runCycle();
    // 사이클 반복을 위해 루프 시작
    const totalCycle = inhaleDur + holdDur + exhaleDur + hold2Dur;
    inhaleProgress.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: inhaleDur, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: holdDur + exhaleDur + hold2Dur })
      ),
      -1, false
    );
    exhaleProgress.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0, { duration: inhaleDur + holdDur }),
        withTiming(1, { duration: exhaleDur, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: hold2Dur })
      ),
      -1, false
    );
  }, [isRunning, pattern]);

  // ✅ 구슬 X 위치: useAnimatedStyle 안에서 interpolate 수행
  const orbAnimatedStyle = useAnimatedStyle(() => {
    const stage = Math.floor(stageValue.value);
    const frac  = stageValue.value - stage;

    const startX = pipelineConfig.startX ?? 20;
    const endX   = pipelineConfig.endX ?? (SCREEN_WIDTH - 20);
    const midY   = pipelineConfig.startY ?? 0;
    const peakY  = (pipelineConfig.endY ?? -60);

    let x: number, y: number, scale: number;

    if (stage === 0) {
      // 들숨: 왼→오른, 위로 볼록
      x = startX + (endX - startX) * frac;
      y = midY + peakY * Math.sin(frac * Math.PI);
      scale = 1 + 0.3 * frac;  // 커짐
    } else if (stage === 1) {
      // 정지(들숨 후): 오른쪽 고정
      x = endX;
      y = midY;
      scale = 1.3;
    } else if (stage === 2) {
      // 날숨: 오른→왼, 아래로 볼록
      x = endX - (endX - startX) * frac;
      y = midY - peakY * Math.sin(frac * Math.PI);
      scale = 1.3 - 0.3 * frac;  // 작아짐
    } else {
      // 정지(날숨 후): 왼쪽 고정
      x = startX;
      y = midY;
      scale = 1.0;
    }

    return {
      transform: [
        { translateX: x - (orbConfig.size ?? 40) / 2 },
        { translateY: y - (orbConfig.size ?? 40) / 2 },
        { scale },
      ],
    };
  });

  // ✅ 단계 텍스트 애니메이션
  const stageTextStyle = useAnimatedStyle(() => {
    const stage = Math.floor(stageValue.value);
    const opacity = 1;
    return { opacity };
  });

  // 단계 레이블 (JS side에서 계산)
  const getStageLabel = (): string => {
    // 실제 앱에서는 useDerivedValue + useAnimatedReaction 사용
    return isRunning ? '호흡 중' : '시작하기';
  };

  return (
    <View style={styles.container}>
      {/* 파이프라인 배경 */}
      <View
        style={[
          styles.pipeline,
          {
            borderColor: pipelineConfig.color || colors.secondary,
            borderWidth: pipelineConfig.width || 3,
            top: (pipelineConfig.startY ?? 0) + 130,
          },
        ]}
      />

      {/* 구슬 — absolute positioned, animation via transform */}
      <Animated.View
        style={[
          styles.orb,
          {
            width: orbConfig.size ?? 40,
            height: orbConfig.size ?? 40,
            backgroundColor: orbConfig.color || colors.secondary,
            borderRadius: (orbConfig.size ?? 40) / 2,
            top: 110,
            left: 0,
          },
          orbAnimatedStyle,
        ]}
      />

      {/* 단계 표시 */}
      <Animated.View style={[styles.stageContainer, stageTextStyle]}>
        <Text style={styles.stageText}>{getStageLabel()}</Text>
        <Text style={styles.patternText}>
          {`${pattern.inhale} - ${pattern.hold} - ${pattern.exhale}${pattern.holdAfterExhale ? ` - ${pattern.holdAfterExhale}` : ''}`}
        </Text>
      </Animated.View>
    </View>
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
    position: 'relative',
  },
  pipeline: {
    position: 'absolute',
    width: '90%',
    height: 80,
    borderRadius: 40,
    left: '5%',
  },
  orb: {
    position: 'absolute',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 12,
  },
  stageContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stageText: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternText: {
    fontSize: 13,
    color: colors.textSecondary,
    opacity: 0.7,
  },
});
