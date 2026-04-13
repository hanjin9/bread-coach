import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface PipelineConfig {
  thickness: number;
  color: string;
  curvature: number;
  startExtend: number;
  endExtend: number;
}

interface OrbConfig {
  size: number;
  color: string;
  opacity: number;
  texture: 'glossy' | 'matte' | 'metallic';
}

interface BreathingPattern {
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
}

/**
 * 변형 스타일: 파이프라인이 구슬을 관통하며 이동
 * - 구슬: 정중앙 고정 (움직이지 않음)
 * - 파이프라인: 우측 → 좌측으로 이동 (호흡 초시간에 맞춰진 굴곡)
 */
export default function BreathingPipelinePenetrationEngine({
  pipeline,
  orb,
  breathing,
  isPlaying = true,
}: {
  pipeline: PipelineConfig;
  orb: OrbConfig;
  breathing: BreathingPattern;
  isPlaying?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();

  const totalDuration = breathing.inhale + breathing.hold1 + breathing.exhale + breathing.hold2;

  // 애니메이션 루프
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) % (totalDuration * 1000);
      const newProgress = elapsed / (totalDuration * 1000);
      setProgress(newProgress);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  // 캔버스 렌더링
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = width * 0.55;
    const canvasHeight = height * 0.75;

    // 배경 초기화
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 파이프라인 그리기 (움직임)
    drawMovingPipeline(ctx, canvasWidth, canvasHeight);

    // 구슬 그리기 (고정)
    drawFixedOrb(ctx, canvasWidth, canvasHeight);

    // 텍스트 오버레이
    drawTextOverlay(ctx, canvasWidth, canvasHeight);
  }, [progress, pipeline, orb, breathing]);

  const drawMovingPipeline = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const { inhale, hold1, exhale, hold2 } = breathing;
    const totalDuration = inhale + hold1 + exhale + hold2;
    const currentTime = progress * totalDuration;

    const centerY = canvasHeight / 2;
    const orbCenterX = canvasWidth / 2;

    // 파이프라인의 시작점과 끝점 계산 (우측 → 좌측 이동)
    let pipelineStartX = canvasWidth; // 우측 시작
    let pipelineEndX = 0; // 좌측 끝

    // 호흡 단계에 따른 파이프라인 위치 계산
    if (currentTime < inhale) {
      // 들숨: 우측 → 중앙 (구슬 도달)
      const progress = currentTime / inhale;
      pipelineStartX = canvasWidth - progress * (canvasWidth - orbCenterX);
      pipelineEndX = canvasWidth - progress * canvasWidth;
    } else if (currentTime < inhale + hold1) {
      // 정지 1: 중앙 고정 (구슬을 관통)
      pipelineStartX = orbCenterX;
      pipelineEndX = 0;
    } else if (currentTime < inhale + hold1 + exhale) {
      // 날숨: 중앙 → 좌측 (구슬 통과)
      const progress = (currentTime - (inhale + hold1)) / exhale;
      pipelineStartX = orbCenterX - progress * orbCenterX;
      pipelineEndX = -progress * (canvasWidth - orbCenterX);
    } else {
      // 정지 2: 좌측 고정
      pipelineStartX = 0;
      pipelineEndX = -canvasWidth * 0.3;
    }

    // 파이프라인 경로 생성 (Bezier 곡선)
    const controlY = centerY - pipeline.curvature;
    const midX = (pipelineStartX + pipelineEndX) / 2;

    ctx.strokeStyle = pipeline.color;
    ctx.lineWidth = pipeline.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(pipelineStartX, centerY);

    // 부드러운 Bezier 곡선
    ctx.bezierCurveTo(
      midX * 0.5, controlY,
      midX * 1.5, controlY,
      pipelineEndX, centerY
    );

    ctx.stroke();

    // 파이프라인 끝 원형 처리
    ctx.fillStyle = pipeline.color;
    ctx.beginPath();
    ctx.arc(pipelineStartX, centerY, pipeline.thickness / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pipelineEndX, centerY, pipeline.thickness / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFixedOrb = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const centerY = canvasHeight / 2;
    const orbCenterX = canvasWidth / 2; // 정중앙 고정

    // 구슬 그리기
    ctx.globalAlpha = orb.opacity;

    // 기본 구슬
    ctx.fillStyle = orb.color;
    ctx.beginPath();
    ctx.arc(orbCenterX, centerY, orb.size, 0, Math.PI * 2);
    ctx.fill();

    // 그림자 효과
    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
    ctx.beginPath();
    ctx.arc(orbCenterX + 2, centerY + 2, orb.size + 1, 0, Math.PI * 2);
    ctx.fill();

    // 질감 효과
    if (orb.texture === 'glossy') {
      // 광택 효과
      const gradient = ctx.createRadialGradient(
        orbCenterX - orb.size / 3, centerY - orb.size / 3, 0,
        orbCenterX, centerY, orb.size
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orbCenterX, centerY, orb.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (orb.texture === 'metallic') {
      // 메탈릭 효과
      const gradient = ctx.createLinearGradient(orbCenterX - orb.size, centerY, orbCenterX + orb.size, centerY);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orbCenterX, centerY, orb.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  const drawTextOverlay = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const { inhale, hold1, exhale, hold2 } = breathing;
    const totalDuration = inhale + hold1 + exhale + hold2;
    const currentTime = progress * totalDuration;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';

    let text = '';
    let remainingTime = 0;

    if (currentTime < inhale) {
      text = 'Inhale';
      remainingTime = Math.ceil(inhale - currentTime);
    } else if (currentTime < inhale + hold1) {
      text = 'Hold';
      remainingTime = Math.ceil(inhale + hold1 - currentTime);
    } else if (currentTime < inhale + hold1 + exhale) {
      text = 'Exhale';
      remainingTime = Math.ceil(inhale + hold1 + exhale - currentTime);
    } else {
      text = 'Hold';
      remainingTime = Math.ceil(totalDuration - currentTime);
    }

    // 상단 텍스트
    ctx.fillText(`${text} (${remainingTime}s)`, canvasWidth / 2, 50);

    // 하단 진행률 표시
    ctx.fillStyle = '#d4af37';
    ctx.font = '12px Arial';
    ctx.fillText(`${Math.round(progress * 100)}% Complete`, canvasWidth / 2, canvasHeight - 20);

    // 스타일 표시
    ctx.fillStyle = '#d4af37';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Style: Pipeline Penetration', canvasWidth - 20, 30);
  };

  return (
    <View style={styles.container}>
      <canvas
        ref={canvasRef}
        width={width * 0.55}
        height={height * 0.75}
        style={styles.canvas}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e27',
  },
  canvas: {
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 8,
  },
});
