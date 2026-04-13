import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTemplateStore } from '../store/templateStore';

const { width, height } = Dimensions.get('window');

interface EditorCanvasProps {
  selectedLayer: string;
}

export default function EditorCanvas({ selectedLayer }: EditorCanvasProps) {
  const canvasRef = useRef<any>(null);
  const template = useTemplateStore((state) => state.template);

  useEffect(() => {
    drawCanvas();
  }, [template, selectedLayer]);

  const drawCanvas = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    const canvasWidth = width * 0.55;
    const canvasHeight = height * 0.75;

    // 배경 초기화
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 배경 이미지 그리기
    if (template.background.image) {
      const img = new Image();
      img.src = template.background.image;
      img.onload = () => {
        ctx.globalAlpha = template.background.opacity;
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        ctx.globalAlpha = 1;
      };
    }

    // 파이프라인 그리기
    drawPipeline(ctx, canvasWidth, canvasHeight);

    // 구슬 그리기
    drawOrb(ctx, canvasWidth, canvasHeight);

    // 선택된 레이어 하이라이트
    if (selectedLayer) {
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);
      ctx.setLineDash([]);
    }
  };

  const drawPipeline = (ctx: any, canvasWidth: number, canvasHeight: number) => {
    const pipeline = template.pipeline;
    const startX = pipeline.startExtend;
    const endX = canvasWidth - pipeline.endExtend;
    const centerY = canvasHeight / 2;

    ctx.strokeStyle = pipeline.color;
    ctx.lineWidth = pipeline.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, centerY);

    // Bezier 곡선으로 부드러운 파이프라인 그리기
    const controlY1 = centerY - pipeline.curvature;
    const controlY2 = centerY + pipeline.curvature;
    const midX = (startX + endX) / 2;

    ctx.bezierCurveTo(
      midX / 2, controlY1,
      midX * 1.5, controlY2,
      endX, centerY
    );

    ctx.stroke();
  };

  const drawOrb = (ctx: any, canvasWidth: number, canvasHeight: number) => {
    const orb = template.orb;
    const centerY = canvasHeight / 2;
    
    // 호흡 진행도에 따른 X 위치 계산
    const progress = (Date.now() % 10000) / 10000; // 10초 사이클
    const startX = orb.startExtend || 50;
    const endX = canvasWidth - (orb.endExtend || 50);
    const orbX = startX + (endX - startX) * progress;

    // 구슬 그리기
    ctx.fillStyle = orb.color;
    ctx.beginPath();
    ctx.arc(orbX, centerY, orb.size, 0, Math.PI * 2);
    ctx.fill();

    // 그림자 효과
    ctx.fillStyle = `rgba(212, 175, 55, ${orb.shadowOpacity || 0.3})`;
    ctx.beginPath();
    ctx.arc(orbX + 2, centerY + 2, orb.size + 2, 0, Math.PI * 2);
    ctx.fill();

    // 광택 효과
    if (orb.texture === 'glossy') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(orbX - orb.size / 3, centerY - orb.size / 3, orb.size / 3, 0, Math.PI * 2);
      ctx.fill();
    }
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
