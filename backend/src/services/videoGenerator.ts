import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

interface BreathingPattern {
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale?: number;
}

interface VideoGenerationOptions {
  pattern: BreathingPattern;
  backgroundImagePath?: string;
  effectSoundPath?: string;
  outputPath: string;
  width?: number;
  height?: number;
  fps?: number;
}

export class VideoGenerator {
  /**
   * 호흡 애니메이션 영상 생성
   */
  static generateBreathingVideo(options: VideoGenerationOptions): string {
    const {
      pattern,
      backgroundImagePath,
      effectSoundPath,
      outputPath,
      width = 1080,
      height = 1920,
      fps = 30,
    } = options;

    const totalDuration =
      pattern.inhale + pattern.hold + pattern.exhale + (pattern.holdAfterExhale || 0);
    const totalFrames = totalDuration * fps;

    // FFmpeg 필터 체인 구성
    let filterChain = `color=c=black:s=${width}x${height}:d=${totalDuration}[base]`;

    // 배경 이미지 추가
    if (backgroundImagePath && fs.existsSync(backgroundImagePath)) {
      filterChain += `;[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[bg];[base][bg]overlay=0:0:enable='between(t,0,${totalDuration})'[base]`;
    }

    // 파이프라인 애니메이션 추가 (drawtext 필터)
    const pipelineAnimation = this.generatePipelineAnimation(pattern, width, height, fps);
    filterChain += `;${pipelineAnimation}`;

    // 구슬 애니메이션 추가 (drawcircle 필터)
    const orbAnimation = this.generateOrbAnimation(pattern, width, height, fps);
    filterChain += `;${orbAnimation}`;

    // FFmpeg 명령 구성
    let ffmpegCmd = `ffmpeg -f lavfi -i "${filterChain}" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p`;

    // 효과음 추가
    if (effectSoundPath && fs.existsSync(effectSoundPath)) {
      ffmpegCmd += ` -i "${effectSoundPath}" -c:a aac -b:a 128k -shortest`;
    }

    ffmpegCmd += ` -y "${outputPath}"`;

    try {
      console.log(`🎬 Generating video: ${outputPath}`);
      execSync(ffmpegCmd, { stdio: 'inherit' });
      console.log(`✅ Video generated successfully`);
      return outputPath;
    } catch (error) {
      console.error(`❌ Video generation failed: ${error}`);
      throw error;
    }
  }

  /**
   * 파이프라인 애니메이션 필터 생성
   */
  private static generatePipelineAnimation(
    pattern: BreathingPattern,
    width: number,
    height: number,
    fps: number
  ): string {
    const totalDuration =
      pattern.inhale + pattern.hold + pattern.exhale + (pattern.holdAfterExhale || 0);

    // 파이프라인 경로 정의 (좌상단 → 우상단 → 우하단 → 좌하단)
    const pipelineWidth = 8;
    const pipelineColor = 'd4af37'; // 골드
    const centerY = height / 2;
    const startX = width * 0.1;
    const endX = width * 0.9;

    // 베지에 곡선을 사용한 부드러운 파이프라인
    const pipelineDrawing = `drawpath=path='M ${startX} ${centerY} Q ${(startX + endX) / 2} ${centerY - 100} ${endX} ${centerY}':color=${pipelineColor}:thickness=${pipelineWidth}`;

    return pipelineDrawing;
  }

  /**
   * 구슬 애니메이션 필터 생성
   */
  private static generateOrbAnimation(
    pattern: BreathingPattern,
    width: number,
    height: number,
    fps: number
  ): string {
    const totalDuration =
      pattern.inhale + pattern.hold + pattern.exhale + (pattern.holdAfterExhale || 0);
    const totalFrames = totalDuration * fps;

    const orbSize = 40;
    const orbColor = 'd4af37'; // 골드
    const centerY = height / 2;
    const startX = width * 0.1;
    const endX = width * 0.9;

    // 구슬 위치 계산 (호흡 패턴에 따른 이동)
    const inhaleFrames = pattern.inhale * fps;
    const holdFrames = pattern.hold * fps;
    const exhaleFrames = pattern.exhale * fps;

    // 구슬이 파이프라인을 따라 이동하는 애니메이션
    const orbAnimation = `drawcircle=radius=${orbSize}:color=${orbColor}:thickness=fill:enable='between(t,0,${totalDuration})'`;

    return orbAnimation;
  }

  /**
   * 배경 이미지 다운로드 및 저장
   */
  static async downloadBackgroundImage(
    imageUrl: string,
    outputPath: string
  ): Promise<string> {
    try {
      const wget = `wget -O "${outputPath}" "${imageUrl}"`;
      execSync(wget);
      return outputPath;
    } catch (error) {
      console.error(`❌ Failed to download background image: ${error}`);
      throw error;
    }
  }

  /**
   * 효과음 다운로드 및 저장
   */
  static async downloadEffectSound(soundUrl: string, outputPath: string): Promise<string> {
    try {
      const wget = `wget -O "${outputPath}" "${soundUrl}"`;
      execSync(wget);
      return outputPath;
    } catch (error) {
      console.error(`❌ Failed to download effect sound: ${error}`);
      throw error;
    }
  }

  /**
   * 비디오 썸네일 생성
   */
  static generateThumbnail(videoPath: string, outputPath: string, timestamp: number = 1): string {
    try {
      const ffmpegCmd = `ffmpeg -i "${videoPath}" -ss ${timestamp} -vframes 1 -vf "scale=480:854" -y "${outputPath}"`;
      execSync(ffmpegCmd, { stdio: 'pipe' });
      return outputPath;
    } catch (error) {
      console.error(`❌ Failed to generate thumbnail: ${error}`);
      throw error;
    }
  }

  /**
   * 비디오 정보 조회
   */
  static getVideoInfo(videoPath: string): { duration: number; width: number; height: number } {
    try {
      const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:csv=p=0 "${videoPath}"`;
      const duration = parseFloat(execSync(ffprobeCmd, { encoding: 'utf-8' }).trim());

      return {
        duration,
        width: 1080,
        height: 1920,
      };
    } catch (error) {
      console.error(`❌ Failed to get video info: ${error}`);
      throw error;
    }
  }
}
