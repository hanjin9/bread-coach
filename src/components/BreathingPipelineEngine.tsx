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

export default function BreathingPipelineEngine({
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

    // 파이프라인 그리기
    drawPipeline(ctx, canvasWidth, canvasHeight);

    // 구슬 그리기
    drawOrb(ctx, canvasWidth, canvasHeight);

    // 텍스트 오버레이
    drawTextOverlay(ctx, canvasWidth, canvasHeight);
  }, [progress, pipeline, orb, breathing]);

  const drawPipeline = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const startX = pipeline.startExtend;
    const endX = canvasWidth - pipeline.endExtend;
    const centerY = canvasHeight / 2;

    // 파이프라인 경로 생성 (Bezier 곡선)
    const controlY = centerY - pipeline.curvature;
    const midX = (startX + endX) / 2;

    ctx.strokeStyle = pipeline.color;
    ctx.lineWidth = pipeline.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, centerY);

    // 부드러운 Bezier 곡선
    ctx.bezierCurveTo(
      midX * 0.5, controlY,
      midX * 1.5, controlY,
      endX, centerY
    );

    ctx.stroke();

    // 선택적: 파이프라인 끝 원형 처리
    ctx.fillStyle = pipeline.color;
    ctx.beginPath();
    ctx.arc(startX, centerY, pipeline.thickness / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(endX, centerY, pipeline.thickness / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawOrb = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const startX = pipeline.startExtend;
    const endX = canvasWidth - pipeline.endExtend;
    const centerY = canvasHeight / 2;

    // 호흡 단계에 따른 구슬 위치 계산
    const orbX = calculateOrbPosition(startX, endX);

    // 구슬 그리기
    ctx.globalAlpha = orb.opacity;

    // 기본 구슬
    ctx.fillStyle = orb.color;
    ctx.beginPath();
    ctx.arc(orbX, centerY, orb.size, 0, Math.PI * 2);
    ctx.fill();

    // 그림자 효과
    ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
    ctx.beginPath();
    ctx.arc(orbX + 2, centerY + 2, orb.size + 1, 0, Math.PI * 2);
    ctx.fill();

    // 질감 효과
    if (orb.texture === 'glossy') {
      // 광택 효과
      const gradient = ctx.createRadialGradient(
        orbX - orb.size / 3, centerY - orb.size / 3, 0,
        orbX, centerY, orb.size
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orbX, centerY, orb.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (orb.texture === 'metallic') {
      // 메탈릭 효과
      const gradient = ctx.createLinearGradient(orbX - orb.size, centerY, orbX + orb.size, centerY);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orbX, centerY, orb.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  const calculateOrbPosition = (startX: number, endX: number): number => {
    const { inhale, hold1, exhale, hold2 } = breathing;
    const totalDuration = inhale + hold1 + exhale + hold2;
    const currentTime = progress * totalDuration;

    let position = 0;

    if (currentTime < inhale) {
      // 들숨: 좌측 → 우측
      position = startX + ((currentTime / inhale) * (endX - startX));
    } else if (currentTime < inhale + hold1) {
      // 정지 1: 우측 고정
      position = endX;
    } else if (currentTime < inhale + hold1 + exhale) {
      // 날숨: 우측 → 좌측
      const exhaleProgress = (currentTime - (inhale + hold1)) / exhale;
      position = endX - (exhaleProgress * (endX - startX));
    } else {
      // 정지 2: 좌측 고정
      position = startX;
    }

    return position;
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
