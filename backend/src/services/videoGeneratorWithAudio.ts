import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

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
  style: 'standard' | 'penetration';
}

/**
 * 배경 영상 + 효과음 통합 영상 생성기
 * - 배경 영상 다운로드
 * - 효과음 다운로드
 * - FFmpeg로 통합 영상 생성
 * - 배경 투명도 조절
 * - 효과음 볼륨 조절
 */
export class VideoGeneratorWithAudio {
  private tempDir = '/tmp/breathing-video-gen/';

  async generateVideo(template: BreathingTemplate, outputPath: string): Promise<string> {
    const totalDuration =
      template.breathing.inhale +
      template.breathing.hold1 +
      template.breathing.exhale +
      template.breathing.hold2;

    // 임시 디렉토리 생성
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    try {
      // 배경 영상 다운로드
      let backgroundPath: string | null = null;
      if (template.background.image) {
        backgroundPath = await this.downloadFile(
          template.background.image,
          path.join(this.tempDir, 'background.mp4')
        );
      }

      // 효과음 다운로드
      let audioPath: string | null = null;
      if (template.sound.url) {
        audioPath = await this.downloadFile(
          template.sound.url,
          path.join(this.tempDir, 'sound.mp3')
        );
      }

      // 파이프라인 + 구슬 애니메이션 영상 생성
      const animationVideoPath = path.join(this.tempDir, 'animation.mp4');
      await this.generateAnimationVideo(template, totalDuration, animationVideoPath);

      // 배경 + 애니메이션 합성
      let composedVideoPath = animationVideoPath;
      if (backgroundPath) {
        composedVideoPath = path.join(this.tempDir, 'composed.mp4');
        await this.composeWithBackground(
          backgroundPath,
          animationVideoPath,
          composedVideoPath,
          template.background.opacity,
          totalDuration
        );
      }

      // 효과음 추가
      let finalVideoPath = composedVideoPath;
      if (audioPath) {
        finalVideoPath = outputPath;
        await this.addAudio(
          composedVideoPath,
          audioPath,
          finalVideoPath,
          template.sound.volume,
          totalDuration
        );
      } else {
        // 효과음이 없으면 최종 영상 복사
        fs.copyFileSync(composedVideoPath, outputPath);
      }

      return outputPath;
    } finally {
      // 임시 파일 정리
      this.cleanupTempFiles();
    }
  }

  /**
   * 파이프라인 + 구슬 애니메이션 영상 생성
   */
  private async generateAnimationVideo(
    template: BreathingTemplate,
    totalDuration: number,
    outputPath: string
  ): Promise<void> {
    const pythonScript = this.generateAnimationScript(template, totalDuration);
    const scriptPath = path.join(this.tempDir, 'generate_animation.py');

    fs.writeFileSync(scriptPath, pythonScript);

    try {
      const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${outputPath}"`);
      console.log('Animation video generated:', stdout);

      if (!fs.existsSync(outputPath)) {
        throw new Error('Animation video generation failed');
      }
    } finally {
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
    }
  }

  /**
   * 배경 영상과 애니메이션 합성
   */
  private async composeWithBackground(
    backgroundPath: string,
    animationPath: string,
    outputPath: string,
    opacity: number,
    duration: number
  ): Promise<void> {
    // FFmpeg 필터 체인 구성
    const alphaValue = Math.round(opacity * 255);

    const ffmpegCommand = `
      ffmpeg -y \
        -i "${backgroundPath}" \
        -i "${animationPath}" \
        -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,colorkey=0x000000:0.3[bg];[1:v][bg]overlay=0:0[v]" \
        -c:v libx264 \
        -preset fast \
        -crf 23 \
        -t ${duration} \
        "${outputPath}"
    `;

    try {
      const { stdout, stderr } = await execAsync(ffmpegCommand);
      console.log('Background composition completed:', stdout);

      if (!fs.existsSync(outputPath)) {
        throw new Error('Background composition failed');
      }
    } catch (error) {
      console.error('FFmpeg composition error:', error);
      throw error;
    }
  }

  /**
   * 효과음 추가
   */
  private async addAudio(
    videoPath: string,
    audioPath: string,
    outputPath: string,
    volume: number,
    duration: number
  ): Promise<void> {
    // 볼륨을 0.1~0.3 범위로 조절
    const adjustedVolume = Math.min(Math.max(volume, 0.1), 0.3);

    const ffmpegCommand = `
      ffmpeg -y \
        -i "${videoPath}" \
        -i "${audioPath}" \
        -c:v copy \
        -c:a aac \
        -filter:a "volume=${adjustedVolume}" \
        -shortest \
        -t ${duration} \
        "${outputPath}"
    `;

    try {
      const { stdout, stderr } = await execAsync(ffmpegCommand);
      console.log('Audio added:', stdout);

      if (!fs.existsSync(outputPath)) {
        throw new Error('Audio addition failed');
      }
    } catch (error) {
      console.error('FFmpeg audio error:', error);
      throw error;
    }
  }

  /**
   * 파일 다운로드
   */
  private async downloadFile(url: string, outputPath: string): Promise<string> {
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      const writer = fs.createWriteStream(outputPath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`File downloaded: ${outputPath}`);
          resolve(outputPath);
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Failed to download file from ${url}:`, error);
      throw error;
    }
  }

  /**
   * 애니메이션 생성 Python 스크립트
   */
  private generateAnimationScript(template: BreathingTemplate, totalDuration: number): string {
    const { inhale, hold1, exhale, hold2 } = template.breathing;
    const { thickness, color, curvature } = template.pipeline;
    const { size, color: orbColor, opacity, texture } = template.orb;

    const pipelineRGB = this.hexToRGB(color);
    const orbRGB = this.hexToRGB(orbColor);

    const styleScript =
      template.style === 'penetration'
        ? this.generatePenetrationScript(template, totalDuration)
        : this.generateStandardScript(template, totalDuration);

    return styleScript;
  }

  /**
   * 표준 스타일 애니메이션 스크립트
   */
  private generateStandardScript(template: BreathingTemplate, totalDuration: number): string {
    const { inhale, hold1, exhale, hold2 } = template.breathing;
    const { thickness, color, curvature } = template.pipeline;
    const { size, color: orbColor, opacity, texture } = template.orb;

    const pipelineRGB = this.hexToRGB(color);
    const orbRGB = this.hexToRGB(orbColor);

    return `
import cv2
import numpy as np
import sys

output_path = sys.argv[1]

width, height = 1080, 1920
fps = 30
total_frames = int(${totalDuration} * fps)

pipeline_color = ${pipelineRGB}
orb_color = ${orbRGB}
bg_color = (10, 14, 39)

orb_center_x = width // 2
orb_center_y = height // 2
orb_size = ${size}

thickness = ${thickness}
curvature = ${curvature}

inhale_frames = int(${inhale} * fps)
hold1_frames = int(${hold1} * fps)
exhale_frames = int(${exhale} * fps)
hold2_frames = int(${hold2} * fps)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

def draw_bezier_pipeline(img, start_x, end_x, center_y, thickness, color, curvature):
    points = []
    for t in np.linspace(0, 1, 200):
        control_y = center_y - curvature
        mid_x = (start_x + end_x) / 2
        
        x = (1-t)**3 * start_x + 3*(1-t)**2*t * (mid_x*0.5) + 3*(1-t)*t**2 * (mid_x*1.5) + t**3 * end_x
        y = (1-t)**3 * center_y + 3*(1-t)**2*t * control_y + 3*(1-t)*t**2 * control_y + t**3 * center_y
        
        points.append([int(x), int(y)])
    
    points = np.array(points, dtype=np.int32)
    cv2.polylines(img, [points], False, color, thickness, cv2.LINE_AA)

def draw_moving_orb(img, x, y, size, color, opacity, texture):
    cv2.circle(img, (int(x), int(y)), int(size), color, -1, cv2.LINE_AA)
    
    shadow_color = (0, 0, 0)
    cv2.circle(img, (int(x+2), int(y+2)), int(size+1), shadow_color, -1, cv2.LINE_AA)
    
    if texture == 'glossy':
        highlight_color = (255, 255, 255)
        cv2.circle(img, (int(x - size/3), int(y - size/3)), int(size/3), highlight_color, -1, cv2.LINE_AA)

for frame_num in range(total_frames):
    frame = np.full((height, width, 3), bg_color, dtype=np.uint8)
    
    # 파이프라인 (고정)
    start_x = 50
    end_x = width - 50
    draw_bezier_pipeline(frame, start_x, end_x, orb_center_y, thickness, pipeline_color, curvature)
    
    # 구슬 위치 계산 (이동)
    if frame_num < inhale_frames:
        progress = frame_num / inhale_frames
        orb_x = start_x + progress * (end_x - start_x)
    elif frame_num < inhale_frames + hold1_frames:
        orb_x = end_x
    elif frame_num < inhale_frames + hold1_frames + exhale_frames:
        progress = (frame_num - (inhale_frames + hold1_frames)) / exhale_frames
        orb_x = end_x - progress * (end_x - start_x)
    else:
        orb_x = start_x
    
    # 구슬 그리기
    draw_moving_orb(frame, orb_x, orb_center_y, orb_size, orb_color, ${opacity}, '${texture}')
    
    # 텍스트
    font = cv2.FONT_HERSHEY_SIMPLEX
    current_time = frame_num / fps
    
    if frame_num < inhale_frames:
        text = f"Inhale ({int(${inhale} - current_time)}s)"
    elif frame_num < inhale_frames + hold1_frames:
        text = f"Hold ({int(${hold1} - (current_time - ${inhale}))}s)"
    elif frame_num < inhale_frames + hold1_frames + exhale_frames:
        text = f"Exhale ({int(${exhale} - (current_time - ${inhale + hold1}))}s)"
    else:
        text = f"Hold ({int(${hold2} - (current_time - ${inhale + hold1 + exhale}))}s)"
    
    text_size = cv2.getTextSize(text, font, 1.2, 2)[0]
    text_x = (width - text_size[0]) // 2
    cv2.putText(frame, text, (text_x, 80), font, 1.2, (255, 255, 255), 2, cv2.LINE_AA)
    
    out.write(frame)

out.release()
print("Standard animation video generated")
`;
  }

  /**
   * 변형 스타일 애니메이션 스크립트
   */
  private generatePenetrationScript(template: BreathingTemplate, totalDuration: number): string {
    const { inhale, hold1, exhale, hold2 } = template.breathing;
    const { thickness, color, curvature } = template.pipeline;
    const { size, color: orbColor, opacity, texture } = template.orb;

    const pipelineRGB = this.hexToRGB(color);
    const orbRGB = this.hexToRGB(orbColor);

    return `
import cv2
import numpy as np
import sys

output_path = sys.argv[1]

width, height = 1080, 1920
fps = 30
total_frames = int(${totalDuration} * fps)

pipeline_color = ${pipelineRGB}
orb_color = ${orbRGB}
bg_color = (10, 14, 39)

orb_center_x = width // 2
orb_center_y = height // 2
orb_size = ${size}

thickness = ${thickness}
curvature = ${curvature}

inhale_frames = int(${inhale} * fps)
hold1_frames = int(${hold1} * fps)
exhale_frames = int(${exhale} * fps)
hold2_frames = int(${hold2} * fps)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

def draw_moving_bezier_pipeline(img, start_x, end_x, center_y, thickness, color, curvature):
    points = []
    for t in np.linspace(0, 1, 200):
        control_y = center_y - curvature
        mid_x = (start_x + end_x) / 2
        
        x = (1-t)**3 * start_x + 3*(1-t)**2*t * (mid_x*0.5) + 3*(1-t)*t**2 * (mid_x*1.5) + t**3 * end_x
        y = (1-t)**3 * center_y + 3*(1-t)**2*t * control_y + 3*(1-t)*t**2 * control_y + t**3 * center_y
        
        points.append([int(x), int(y)])
    
    points = np.array(points, dtype=np.int32)
    cv2.polylines(img, [points], False, color, thickness, cv2.LINE_AA)

def draw_fixed_orb(img, x, y, size, color, opacity, texture):
    cv2.circle(img, (int(x), int(y)), int(size), color, -1, cv2.LINE_AA)
    
    shadow_color = (0, 0, 0)
    cv2.circle(img, (int(x+2), int(y+2)), int(size+1), shadow_color, -1, cv2.LINE_AA)
    
    if texture == 'glossy':
        highlight_color = (255, 255, 255)
        cv2.circle(img, (int(x - size/3), int(y - size/3)), int(size/3), highlight_color, -1, cv2.LINE_AA)

for frame_num in range(total_frames):
    frame = np.full((height, width, 3), bg_color, dtype=np.uint8)
    
    # 파이프라인 위치 계산 (이동)
    if frame_num < inhale_frames:
        progress = frame_num / inhale_frames
        start_x = width - progress * (width - orb_center_x)
        end_x = width - progress * width
    elif frame_num < inhale_frames + hold1_frames:
        start_x = orb_center_x
        end_x = 0
    elif frame_num < inhale_frames + hold1_frames + exhale_frames:
        progress = (frame_num - (inhale_frames + hold1_frames)) / exhale_frames
        start_x = orb_center_x - progress * orb_center_x
        end_x = -progress * (width - orb_center_x)
    else:
        start_x = 0
        end_x = -width * 0.3
    
    # 파이프라인 그리기 (이동)
    draw_moving_bezier_pipeline(frame, start_x, end_x, orb_center_y, thickness, pipeline_color, curvature)
    
    # 구슬 그리기 (고정)
    draw_fixed_orb(frame, orb_center_x, orb_center_y, orb_size, orb_color, ${opacity}, '${texture}')
    
    # 텍스트
    font = cv2.FONT_HERSHEY_SIMPLEX
    current_time = frame_num / fps
    
    if frame_num < inhale_frames:
        text = f"Inhale ({int(${inhale} - current_time)}s)"
    elif frame_num < inhale_frames + hold1_frames:
        text = f"Hold ({int(${hold1} - (current_time - ${inhale}))}s)"
    elif frame_num < inhale_frames + hold1_frames + exhale_frames:
        text = f"Exhale ({int(${exhale} - (current_time - ${inhale + hold1}))}s)"
    else:
        text = f"Hold ({int(${hold2} - (current_time - ${inhale + hold1 + exhale}))}s)"
    
    text_size = cv2.getTextSize(text, font, 1.2, 2)[0]
    text_x = (width - text_size[0]) // 2
    cv2.putText(frame, text, (text_x, 80), font, 1.2, (255, 255, 255), 2, cv2.LINE_AA)
    
    out.write(frame)

out.release()
print("Penetration animation video generated")
`;
  }

  /**
   * Hex 색상을 RGB로 변환
   */
  private hexToRGB(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `(${b}, ${g}, ${r})`; // BGR 순서 (OpenCV)
    }
    return '(212, 175, 55)'; // 기본값: 골드
  }

  /**
   * 임시 파일 정리
   */
  private cleanupTempFiles(): void {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        files.forEach((file) => {
          const filePath = path.join(this.tempDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        fs.rmdirSync(this.tempDir);
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }
}

export default new VideoGeneratorWithAudio();
