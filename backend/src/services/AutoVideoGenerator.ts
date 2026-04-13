import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

/**
 * 🎯 자동 호흡 영상 생성 엔진
 * 
 * 벤치마킹 영상 분석 기반 100% 복제
 * 호흡 패턴만 입력하면 자동으로 영상 생성
 */

interface BreathingPattern {
  inhaleTime: number;      // 들숨 시간 (초)
  holdAfterInhale: number; // 들숨 후 정지 (초)
  exhaleTime: number;      // 날숨 시간 (초)
  holdAfterExhale: number; // 날숨 후 정지 (초)
}

interface VideoGenerationConfig {
  // 호흡 패턴
  pattern: BreathingPattern;
  
  // 비디오 설정
  width: number;
  height: number;
  fps: number;
  duration: number;  // 전체 영상 길이 (초)
  
  // 파이프라인 설정
  pipeColor: string;
  pipeThickness: number;
  
  // 구슬 설정
  orbColor: string;
  orbRadius: number;
  
  // 배경
  backgroundImage?: string;
  backgroundOpacity: number;
  
  // 효과음
  audioFile?: string;
  audioVolume: number;
}

/**
 * 기본 설정 (벤치마킹 영상 기반)
 */
const DEFAULT_CONFIG: VideoGenerationConfig = {
  pattern: {
    inhaleTime: 4,
    holdAfterInhale: 1,
    exhaleTime: 3,
    holdAfterExhale: 4
  },
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 12,
  pipeColor: '#00CC99',
  pipeThickness: 230,
  orbColor: '#FFD700',
  orbRadius: 29.7,
  backgroundOpacity: 0.3
};

/**
 * Python 스크립트로 프레임 생성
 */
function generateFramesWithPython(
  outputDir: string,
  config: VideoGenerationConfig
): void {
  const pythonScript = `
import cv2
import numpy as np
import os
from pathlib import Path

# 설정
WIDTH = ${config.width}
HEIGHT = ${config.height}
FPS = ${config.fps}
PATTERN = {
    'inhale': ${config.pattern.inhaleTime},
    'hold_inhale': ${config.pattern.holdAfterInhale},
    'exhale': ${config.pattern.exhaleTime},
    'hold_exhale': ${config.pattern.holdAfterExhale}
}
TOTAL_CYCLE = sum(PATTERN.values())
TOTAL_FRAMES = int(${config.duration} * FPS)

PIPE_COLOR = (${hexToRgb(config.pipeColor).join(', ')})  # BGR
ORB_COLOR = (${hexToRgb(config.orbColor).join(', ')})    # BGR
PIPE_THICKNESS = ${config.pipeThickness}
ORB_RADIUS = ${config.orbRadius}

# 출력 디렉토리
OUTPUT_DIR = "${outputDir}"
Path(OUTPUT_DIR).mkdir(exist_ok=True)

def hex_to_bgr(hex_color):
    """Hex 색상을 BGR로 변환"""
    hex_color = hex_color.lstrip('#')
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return (b, g, r)  # OpenCV는 BGR 사용

def draw_bezier_curve(frame, p0, p1, p2, p3, color, thickness):
    """Bezier 3차 곡선 그리기"""
    points = []
    for i in range(101):
        t = i / 100.0
        mt = 1 - t
        
        x = (mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 
             3 * mt * t**2 * p2[0] + t**3 * p3[0])
        y = (mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 
             3 * mt * t**2 * p2[1] + t**3 * p3[1])
        
        points.append([int(x), int(y)])
    
    points = np.array(points, dtype=np.int32)
    cv2.polylines(frame, [points], False, color, thickness, cv2.LINE_AA)

def calculate_curvature(phase):
    """호흡 단계에 따른 곡률 계산"""
    min_curv = 28.2
    max_curv = 285.7
    
    inhale_ratio = PATTERN['inhale'] / TOTAL_CYCLE
    hold_inhale_ratio = (PATTERN['inhale'] + PATTERN['hold_inhale']) / TOTAL_CYCLE
    exhale_ratio = (PATTERN['inhale'] + PATTERN['hold_inhale'] + PATTERN['exhale']) / TOTAL_CYCLE
    
    if phase < inhale_ratio:
        # 들숨: 곡률 증가
        progress = phase / inhale_ratio
        return min_curv + (max_curv - min_curv) * progress
    elif phase < hold_inhale_ratio:
        # 정지 (들숨 후): 곡률 유지
        return max_curv
    elif phase < exhale_ratio:
        # 날숨: 곡률 감소
        progress = (phase - hold_inhale_ratio) / (exhale_ratio - hold_inhale_ratio)
        return max_curv - (max_curv - min_curv) * progress
    else:
        # 정지 (날숨 후): 곡률 유지
        return min_curv

def calculate_orb_y(phase):
    """호흡 단계에 따른 구슬 Y 위치"""
    orb_min_y = HEIGHT * 0.15  # 상단
    orb_max_y = HEIGHT * 0.75  # 하단
    
    inhale_ratio = PATTERN['inhale'] / TOTAL_CYCLE
    hold_inhale_ratio = (PATTERN['inhale'] + PATTERN['hold_inhale']) / TOTAL_CYCLE
    exhale_ratio = (PATTERN['inhale'] + PATTERN['hold_inhale'] + PATTERN['exhale']) / TOTAL_CYCLE
    
    if phase < inhale_ratio:
        # 들숨: 하단 → 상단
        progress = phase / inhale_ratio
        return orb_max_y - (orb_max_y - orb_min_y) * progress
    elif phase < hold_inhale_ratio:
        # 정지 (들숨 후): 상단
        return orb_min_y
    elif phase < exhale_ratio:
        # 날숨: 상단 → 하단
        progress = (phase - hold_inhale_ratio) / (exhale_ratio - hold_inhale_ratio)
        return orb_min_y + (orb_max_y - orb_min_y) * progress
    else:
        # 정지 (날숨 후): 하단
        return orb_max_y

def draw_frame(frame_num):
    """프레임 생성"""
    frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    frame[:] = (10, 14, 39)  # 배경색 #0A0E27
    
    # 현재 위치 (사이클 내)
    cycle_frame = frame_num % int(TOTAL_CYCLE * FPS)
    phase = cycle_frame / (TOTAL_CYCLE * FPS)
    
    # 곡률 계산
    curvature = calculate_curvature(phase)
    
    # Bezier 제어점 계산
    p0 = [0, int(HEIGHT * 0.6)]
    p3 = [int(WIDTH * 0.6), int(HEIGHT * 0.8)]
    
    norm_curv = min(1, (curvature - 28.2) / (285.7 - 28.2))
    control_dist = 50 + norm_curv * 150
    
    p1 = [int(p0[0] + control_dist * 0.3), int(p0[1] + control_dist * 0.1)]
    p2 = [int(p3[0] - control_dist * 0.3), int(p3[1] - control_dist * 0.1)]
    
    # 파이프라인 그리기
    draw_bezier_curve(frame, p0, p1, p2, p3, hex_to_bgr('${config.pipeColor}'), 
                      ${config.pipeThickness})
    
    # 구슬 위치
    orb_x = WIDTH // 2
    orb_y = int(calculate_orb_y(phase))
    
    # 구슬 그리기 (그라디언트)
    cv2.circle(frame, (orb_x, orb_y), ${config.orbRadius}, 
               hex_to_bgr('${config.orbColor}'), -1, cv2.LINE_AA)
    
    # 구슬 광택 효과
    cv2.circle(frame, (orb_x - ${config.orbRadius}//3, orb_y - ${config.orbRadius}//3), 
               ${config.orbRadius}//3, (255, 255, 200), -1, cv2.LINE_AA)
    
    return frame

# 프레임 생성
print(f"Generating {TOTAL_FRAMES} frames...")
for i in range(TOTAL_FRAMES):
    frame = draw_frame(i)
    output_path = os.path.join(OUTPUT_DIR, f"frame_{i:06d}.png")
    cv2.imwrite(output_path, frame)
    
    if (i + 1) % 30 == 0:
        print(f"  Generated {i + 1}/{TOTAL_FRAMES} frames")

print("✅ Frame generation complete!")
`;

  // Python 스크립트 저장 및 실행
  const scriptPath = path.join(outputDir, 'generate_frames.py');
  fs.writeFileSync(scriptPath, pythonScript);
  
  try {
    execSync(`python3 ${scriptPath}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Frame generation failed:', error);
    throw error;
  }
}

/**
 * Hex 색상을 RGB로 변환
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

/**
 * FFmpeg로 영상 생성
 */
function createVideoWithFFmpeg(
  framesDir: string,
  outputPath: string,
  config: VideoGenerationConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg()
      .input(path.join(framesDir, 'frame_%06d.png'))
      .inputFPS(config.fps)
      .outputOptions([
        `-c:v libx264`,
        `-preset fast`,
        `-crf 18`,
        `-pix_fmt yuv420p`
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('✅ Video creation complete!');
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      });
    
    command.run();
  });
}

/**
 * 메인 함수: 호흡 패턴 기반 자동 영상 생성
 */
export async function generateBreathingVideo(
  outputPath: string,
  pattern: BreathingPattern,
  customConfig?: Partial<VideoGenerationConfig>
): Promise<void> {
  const config: VideoGenerationConfig = {
    ...DEFAULT_CONFIG,
    pattern,
    ...customConfig
  };
  
  // 임시 디렉토리
  const tempDir = path.join('/tmp', `breathing_video_${Date.now()}`);
  const framesDir = path.join(tempDir, 'frames');
  
  try {
    // 디렉토리 생성
    fs.mkdirSync(framesDir, { recursive: true });
    
    console.log('🎬 Starting video generation...');
    console.log(`Pattern: ${config.pattern.inhaleTime}s inhale, ${config.pattern.holdAfterInhale}s hold, ${config.pattern.exhaleTime}s exhale, ${config.pattern.holdAfterExhale}s hold`);
    
    // 프레임 생성
    console.log('📸 Generating frames...');
    generateFramesWithPython(framesDir, config);
    
    // 영상 생성
    console.log('🎞️ Creating video...');
    await createVideoWithFFmpeg(framesDir, outputPath, config);
    
    // 정리
    console.log('🧹 Cleaning up temporary files...');
    execSync(`rm -rf ${tempDir}`);
    
    console.log(`✅ Video saved to: ${outputPath}`);
  } catch (error) {
    console.error('Video generation failed:', error);
    throw error;
  }
}

// 내보내기
export { BreathingPattern, VideoGenerationConfig, DEFAULT_CONFIG };
