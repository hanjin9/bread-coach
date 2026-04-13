import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BreathingTemplate {
  breathing: {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
  };
  pipeline: {
    thickness: number;
    color: string;
    curvature: number;
    startExtend: number;
    endExtend: number;
  };
  orb: {
    size: number;
    color: string;
    opacity: number;
    texture: 'glossy' | 'matte' | 'metallic';
  };
  background: {
    image?: string;
    opacity: number;
  };
  sound: {
    url?: string;
    volume: number;
  };
}

export class AdvancedVideoGenerator {
  /**
   * 호흡 템플릿을 MP4 영상으로 생성 (FFmpeg 필터 체인 사용)
   */
  async generateVideo(template: BreathingTemplate, outputPath: string): Promise<string> {
    const totalDuration =
      template.breathing.inhale +
      template.breathing.hold1 +
      template.breathing.exhale +
      template.breathing.hold2;

    // Python 스크립트를 사용하여 복잡한 애니메이션 생성
    const pythonScript = this.generatePythonScript(template, totalDuration);
    const scriptPath = path.join('/tmp', `generate_breathing_${Date.now()}.py`);

    fs.writeFileSync(scriptPath, pythonScript);

    try {
      // Python 스크립트 실행
      const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${outputPath}"`);
      console.log('Video generation output:', stdout);

      if (fs.existsSync(outputPath)) {
        return outputPath;
      } else {
        throw new Error('Video generation failed');
      }
    } finally {
      // 임시 파일 정리
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
    }
  }

  /**
   * Python 스크립트 생성 (OpenCV 기반 고급 렌더링)
   */
  private generatePythonScript(template: BreathingTemplate, totalDuration: number): string {
    const { inhale, hold1, exhale, hold2 } = template.breathing;
    const { thickness, color, curvature, startExtend, endExtend } = template.pipeline;
    const { size, orbColor, opacity, texture } = template.orb;

    // Hex 색상을 RGB로 변환
    const pipelineRGB = this.hexToRGB(color);
    const orbRGB = this.hexToRGB(orbColor);

    return `
import cv2
import numpy as np
import sys
from math import sin, cos, pi

output_path = sys.argv[1]

# 설정
width, height = 1080, 1920
fps = 30
total_frames = int(${totalDuration} * fps)

# 색상
pipeline_color = ${pipelineRGB}
orb_color = ${orbRGB}
bg_color = (10, 14, 39)  # 다크 블루

# 파이프라인 설정
start_x = ${startExtend}
end_x = width - ${endExtend}
center_y = height // 2
thickness = ${thickness}
curvature = ${curvature}

# 호흡 단계 (초)
inhale_frames = int(${inhale} * fps)
hold1_frames = int(${hold1} * fps)
exhale_frames = int(${exhale} * fps)
hold2_frames = int(${hold2} * fps)

# 비디오 라이터
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (4, 2, 0))

def draw_bezier_curve(img, start, end, center_y, thickness, color, curvature):
    """베지에 곡선으로 파이프라인 그리기"""
    points = []
    for t in np.linspace(0, 1, 200):
        # 베지에 곡선 계산
        control_y = center_y - curvature
        mid_x = (start + end) / 2
        
        # 3차 베지에 곡선
        x = (1-t)**3 * start + 3*(1-t)**2*t * (mid_x*0.5) + 3*(1-t)*t**2 * (mid_x*1.5) + t**3 * end
        y = (1-t)**3 * center_y + 3*(1-t)**2*t * control_y + 3*(1-t)*t**2 * control_y + t**3 * center_y
        
        points.append([int(x), int(y)])
    
    points = np.array(points, dtype=np.int32)
    cv2.polylines(img, [points], False, color, thickness, cv2.LINE_AA)

def draw_orb(img, x, y, size, color, opacity, texture):
    """구슬 그리기 (광택 효과 포함)"""
    # 기본 구슬
    cv2.circle(img, (int(x), int(y)), int(size), color, -1, cv2.LINE_AA)
    
    # 그림자
    shadow_color = (0, 0, 0)
    cv2.circle(img, (int(x+2), int(y+2)), int(size+1), shadow_color, -1, cv2.LINE_AA)
    
    # 광택 효과
    if texture == 'glossy':
        highlight_color = (255, 255, 255)
        cv2.circle(img, (int(x - size/3), int(y - size/3)), int(size/3), highlight_color, -1, cv2.LINE_AA)

def calculate_orb_position(frame_num):
    """호흡 단계에 따른 구슬 위치 계산"""
    if frame_num < inhale_frames:
        # 들숨: 좌측 → 우측
        progress = frame_num / inhale_frames
        return start_x + progress * (end_x - start_x)
    elif frame_num < inhale_frames + hold1_frames:
        # 정지 1: 우측 고정
        return end_x
    elif frame_num < inhale_frames + hold1_frames + exhale_frames:
        # 날숨: 우측 → 좌측
        progress = (frame_num - (inhale_frames + hold1_frames)) / exhale_frames
        return end_x - progress * (end_x - start_x)
    else:
        # 정지 2: 좌측 고정
        return start_x

# 프레임 생성
for frame_num in range(total_frames):
    # 배경 생성
    frame = np.full((height, width, 3), bg_color, dtype=np.uint8)
    
    # 파이프라인 그리기
    draw_bezier_curve(frame, start_x, end_x, center_y, thickness, pipeline_color, curvature)
    
    # 구슬 위치 계산 및 그리기
    orb_x = calculate_orb_position(frame_num)
    draw_orb(frame, orb_x, center_y, ${size}, orb_color, ${opacity}, '${texture}')
    
    # 텍스트 오버레이
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1.2
    font_thickness = 2
    text_color = (255, 255, 255)
    
    current_time = frame_num / fps
    if frame_num < inhale_frames:
        text = f"Inhale ({int(${inhale} - current_time)}s)"
    elif frame_num < inhale_frames + hold1_frames:
        text = f"Hold ({int(${hold1} - (current_time - ${inhale}))}s)"
    elif frame_num < inhale_frames + hold1_frames + exhale_frames:
        text = f"Exhale ({int(${exhale} - (current_time - ${inhale + hold1}))}s)"
    else:
        text = f"Hold ({int(${hold2} - (current_time - ${inhale + hold1 + exhale}))}s)"
    
    text_size = cv2.getTextSize(text, font, font_scale, font_thickness)[0]
    text_x = (width - text_size[0]) // 2
    text_y = 80
    
    cv2.putText(frame, text, (text_x, text_y), font, font_scale, text_color, font_thickness, cv2.LINE_AA)
    
    # 진행률 표시
    progress_text = f"{int((frame_num / total_frames) * 100)}%"
    progress_size = cv2.getTextSize(progress_text, font, 0.8, 1)[0]
    progress_x = (width - progress_size[0]) // 2
    progress_y = height - 40
    
    cv2.putText(frame, progress_text, (progress_x, progress_y), font, 0.8, (212, 175, 55), 1, cv2.LINE_AA)
    
    # 프레임 저장
    out.write(frame)
    
    if (frame_num + 1) % 30 == 0:
        print(f"Generated {frame_num + 1}/{total_frames} frames")

out.release()
print(f"Video saved to {output_path}")
`;
  }

  /**
   * Hex 색상을 RGB로 변환
   */
  private hexToRGB(hex: string): string {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `(${b}, ${g}, ${r})`; // BGR 순서 (OpenCV)
    }
    return '(212, 175, 55)'; // 기본값: 골드
  }

  /**
   * 템플릿 프리셋
   */
  getPresets() {
    return [
      {
        name: '기본 (4-7-8)',
        template: {
          breathing: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
          pipeline: { thickness: 8, color: '#d4af37', curvature: 30, startExtend: 20, endExtend: 20 },
          orb: { size: 25, color: '#d4af37', opacity: 1, texture: 'glossy' },
          background: { opacity: 0.8 },
          sound: { volume: 0.5 },
        },
      },
      {
        name: '럭셔리 골드',
        template: {
          breathing: { inhale: 5, hold1: 5, exhale: 5, hold2: 0 },
          pipeline: { thickness: 12, color: '#ffd700', curvature: 50, startExtend: 30, endExtend: 30 },
          orb: { size: 35, color: '#ffd700', opacity: 0.9, texture: 'glossy' },
          background: { opacity: 0.9 },
          sound: { volume: 0.3 },
        },
      },
      {
        name: '미니멀',
        template: {
          breathing: { inhale: 3, hold1: 3, exhale: 3, hold2: 0 },
          pipeline: { thickness: 4, color: '#ffffff', curvature: 20, startExtend: 10, endExtend: 10 },
          orb: { size: 15, color: '#ffffff', opacity: 0.8, texture: 'matte' },
          background: { opacity: 0.7 },
          sound: { volume: 0.4 },
        },
      },
    ];
  }
}

export default new AdvancedVideoGenerator();
