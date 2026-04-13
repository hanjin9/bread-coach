import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Canvas } from 'react-native';
import { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

/**
 * 🎯 정밀 호흡 애니메이션 엔진
 * 벤치마킹 영상 100% 복제
 * 
 * 분석 기반:
 * - 호흡 패턴: 4-1-3-4 (들숨 4초, 정지 1초, 날숨 3초, 정지 4초)
 * - 파이프 곡률: 28.2 ~ 285.7 (Bezier 3차 곡선)
 * - 구슬 크기: 반지름 29.7px
 * - 구슬 이동: Y축만 (220.8px ~ 497.8px)
 */

interface BreathingEngineConfig {
  // 호흡 타이밍 (밀리초)
  inhaleTime: number;      // 들숨 시간
  holdAfterInhale: number; // 들숨 후 정지
  exhaleTime: number;      // 날숨 시간
  holdAfterExhale: number; // 날숨 후 정지
  
  // 파이프라인 설정
  pipeColor: string;       // 파이프 색상
  pipeThickness: number;   // 파이프 굵기
  pipeStartX: number;      // 시작 X
  pipeStartY: number;      // 시작 Y
  pipeEndX: number;        // 끝 X
  pipeEndY: number;        // 끝 Y
  
  // 구슬 설정
  orbColor: string;        // 구슬 색상
  orbRadius: number;       // 구슬 반지름
  orbX: number;            // 구슬 X (고정)
  orbMinY: number;         // 구슬 최소 Y (상단)
  orbMaxY: number;         // 구슬 최대 Y (하단)
  
  // 곡률 설정
  minCurvature: number;    // 최소 곡률지수
  maxCurvature: number;    // 최대 곡률지수
}

interface BezierControlPoints {
  p0: [number, number]; // 시작점
  p1: [number, number]; // 제어점 1
  p2: [number, number]; // 제어점 2
  p3: [number, number]; // 끝점
}

/**
 * 기본 설정 (벤치마킹 영상 기반)
 */
const DEFAULT_CONFIG: BreathingEngineConfig = {
  // 호흡 타이밍: 4-1-3-4
  inhaleTime: 4000,
  holdAfterInhale: 1000,
  exhaleTime: 3000,
  holdAfterExhale: 4000,
  
  // 파이프라인 (화면 너비 406px 기준)
  pipeColor: '#00CC99',
  pipeThickness: 230,
  pipeStartX: 0,
  pipeStartY: 436,
  pipeEndX: 239,
  pipeEndY: 592,
  
  // 구슬 (반지름 29.7px)
  orbColor: '#FFD700',
  orbRadius: 29.7,
  orbX: 203,
  orbMinY: 220.8,  // 상단
  orbMaxY: 497.8,  // 하단
  
  // 곡률 범위
  minCurvature: 28.2,
  maxCurvature: 285.7
};

/**
 * Bezier 3차 곡선 계산
 */
function calculateBezierPoint(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): [number, number] {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;
  
  const x = mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0];
  const y = mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1];
  
  return [x, y];
}

/**
 * 곡률 지수에 따른 Bezier 제어점 계산
 * 
 * 곡률이 높을수록 제어점이 더 멀리 배치됨
 */
function calculateControlPoints(
  curvatureIndex: number,
  config: BreathingEngineConfig
): BezierControlPoints {
  const p0: [number, number] = [config.pipeStartX, config.pipeStartY];
  const p3: [number, number] = [config.pipeEndX, config.pipeEndY];
  
  // 곡률 지수 정규화 (0 ~ 1)
  const normalizedCurvature = Math.min(
    1,
    (curvatureIndex - config.minCurvature) / (config.maxCurvature - config.minCurvature)
  );
  
  // 제어점 거리 (곡률에 따라 변함)
  // 낮은 곡률: 제어점이 가까움 (거의 직선)
  // 높은 곡률: 제어점이 멀어짐 (많이 구부러짐)
  const controlDistance = 50 + normalizedCurvature * 150;
  
  // 시작점 근처 제어점
  const p1: [number, number] = [
    p0[0] + controlDistance * 0.3,
    p0[1] + controlDistance * 0.1
  ];
  
  // 끝점 근처 제어점
  const p2: [number, number] = [
    p3[0] - controlDistance * 0.3,
    p3[1] - controlDistance * 0.1
  ];
  
  return { p0, p1, p2, p3 };
}

/**
 * 호흡 단계에 따른 곡률 지수 계산
 * 
 * 호흡 단계:
 * - 0 ~ 0.33: 들숨 (곡률 증가)
 * - 0.33 ~ 0.41: 정지 (곡률 유지)
 * - 0.41 ~ 0.66: 날숨 (곡률 감소)
 * - 0.66 ~ 1.0: 정지 (곡률 유지)
 */
function calculateCurvatureForPhase(
  phase: number, // 0 ~ 1
  config: BreathingEngineConfig
): number {
  const totalTime = config.inhaleTime + config.holdAfterInhale + 
                   config.exhaleTime + config.holdAfterExhale;
  
  // 각 단계의 시간 비율
  const inhaleRatio = config.inhaleTime / totalTime;
  const holdInhaleRatio = (config.inhaleTime + config.holdAfterInhale) / totalTime;
  const exhaleRatio = (config.inhaleTime + config.holdAfterInhale + config.exhaleTime) / totalTime;
  
  let curvature = config.minCurvature;
  
  if (phase < inhaleRatio) {
    // 들숨: 곡률 증가
    const inhaleProgress = phase / inhaleRatio;
    curvature = config.minCurvature + 
                (config.maxCurvature - config.minCurvature) * inhaleProgress;
  } else if (phase < holdInhaleRatio) {
    // 정지 (들숨 후): 곡률 유지 (최대)
    curvature = config.maxCurvature;
  } else if (phase < exhaleRatio) {
    // 날숨: 곡률 감소
    const exhaleProgress = (phase - holdInhaleRatio) / (exhaleRatio - holdInhaleRatio);
    curvature = config.maxCurvature - 
                (config.maxCurvature - config.minCurvature) * exhaleProgress;
  } else {
    // 정지 (날숨 후): 곡률 유지 (최소)
    curvature = config.minCurvature;
  }
  
  return curvature;
}

/**
 * 호흡 단계에 따른 구슬 Y 위치 계산
 */
function calculateOrbYPosition(
  phase: number, // 0 ~ 1
  config: BreathingEngineConfig
): number {
  const totalTime = config.inhaleTime + config.holdAfterInhale + 
                   config.exhaleTime + config.holdAfterExhale;
  
  const inhaleRatio = config.inhaleTime / totalTime;
  const holdInhaleRatio = (config.inhaleTime + config.holdAfterInhale) / totalTime;
  const exhaleRatio = (config.inhaleTime + config.holdAfterInhale + config.exhaleTime) / totalTime;
  
  let y = config.orbMaxY;
  
  if (phase < inhaleRatio) {
    // 들숨: 하단 → 상단 (Y 감소)
    const inhaleProgress = phase / inhaleRatio;
    y = config.orbMaxY - (config.orbMaxY - config.orbMinY) * inhaleProgress;
  } else if (phase < holdInhaleRatio) {
    // 정지 (들숨 후): 상단 유지
    y = config.orbMinY;
  } else if (phase < exhaleRatio) {
    // 날숨: 상단 → 하단 (Y 증가)
    const exhaleProgress = (phase - holdInhaleRatio) / (exhaleRatio - holdInhaleRatio);
    y = config.orbMinY + (config.orbMaxY - config.orbMinY) * exhaleProgress;
  } else {
    // 정지 (날숨 후): 하단 유지
    y = config.orbMaxY;
  }
  
  return y;
}

/**
 * 파이프라인 렌더링 (Canvas)
 */
function drawPipeline(
  ctx: CanvasRenderingContext2D,
  curvature: number,
  config: BreathingEngineConfig
) {
  const controlPoints = calculateControlPoints(curvature, config);
  
  // 곡선 그리기
  ctx.strokeStyle = config.pipeColor;
  ctx.lineWidth = config.pipeThickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  
  // Bezier 곡선 그리기
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = calculateBezierPoint(
      t,
      controlPoints.p0,
      controlPoints.p1,
      controlPoints.p2,
      controlPoints.p3
    );
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
}

/**
 * 구슬 렌더링 (Canvas)
 */
function drawOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: BreathingEngineConfig
) {
  // 구슬 그림자 (깊이감)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.arc(x, y + config.orbRadius * 0.3, config.orbRadius * 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  // 구슬 본체 (그라디언트)
  const gradient = ctx.createRadialGradient(
    x - config.orbRadius * 0.3,
    y - config.orbRadius * 0.3,
    0,
    x,
    y,
    config.orbRadius
  );
  gradient.addColorStop(0, '#FFFF99'); // 밝은 노랑
  gradient.addColorStop(0.7, config.orbColor); // 황금색
  gradient.addColorStop(1, '#CC9900'); // 어두운 황금색
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, config.orbRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // 구슬 테두리 (광택 효과)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, config.orbRadius, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * 메인 컴포넌트
 */
interface PrecisionBreathingEngineProps {
  config?: Partial<BreathingEngineConfig>;
  width: number;
  height: number;
  isPlaying: boolean;
  onPhaseChange?: (phase: number) => void;
}

export default function PrecisionBreathingEngine({
  config: customConfig = {},
  width,
  height,
  isPlaying,
  onPhaseChange
}: PrecisionBreathingEngineProps) {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const totalCycleTime = config.inhaleTime + config.holdAfterInhale + 
                        config.exhaleTime + config.holdAfterExhale;
  
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const phase = (elapsed % totalCycleTime) / totalCycleTime;
      
      setCurrentPhase(phase);
      onPhaseChange?.(phase);
      
      // Canvas 렌더링
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 배경 지우기
          ctx.clearRect(0, 0, width, height);
          
          // 곡률 계산
          const curvature = calculateCurvatureForPhase(phase, config);
          
          // 파이프라인 그리기
          drawPipeline(ctx, curvature, config);
          
          // 구슬 위치 계산
          const orbY = calculateOrbYPosition(phase, config);
          
          // 구슬 그리기
          drawOrb(ctx, config.orbX, orbY, config);
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, config, width, height, totalCycleTime, onPhaseChange]);
  
  return (
    <View style={[styles.container, { width, height }]}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={styles.canvas}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0E27',
    overflow: 'hidden'
  },
  canvas: {
    width: '100%',
    height: '100%'
  }
});

// 내보내기
export { DEFAULT_CONFIG, calculateBezierPoint, calculateCurvatureForPhase, calculateOrbYPosition };
