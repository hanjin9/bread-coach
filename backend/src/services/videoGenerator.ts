import { execSync, spawnSync } from 'child_process';
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
  orbColor?: string;
  pipelineColor?: string;
}

export class VideoGenerator {
  /**
   * 호흡 애니메이션 영상 생성 (결함 5 수정)
   * FFmpeg lavfi 필터 체인 → 개별 filter_complex 방식으로 수정
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
      orbColor = 'gold',
      pipelineColor = 'd4af37',
    } = options;

    const totalDuration =
      pattern.inhale + pattern.hold + pattern.exhale + (pattern.holdAfterExhale || 0);

    const pipeCy = height / 2;
    const pipeX1 = Math.round(width * 0.1);
    const pipeX2 = Math.round(width * 0.9);
    const pipeY = pipeCy;
    const orbSize = 40;

    // 구슬 X 위치: 호흡 단계별 이동 (들숨→오른쪽, 날숨→왼쪽)
    const inhaleEnd = pattern.inhale;
    const holdEnd = inhaleEnd + pattern.hold;
    const exhaleEnd = holdEnd + pattern.exhale;

    // drawtext 필터로 단계 표시
    const stageFilters = [
      `drawtext=text='들숨':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h*0.35:enable='between(t,0,${inhaleEnd})'`,
      `drawtext=text='정지':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h*0.35:enable='between(t,${inhaleEnd},${holdEnd})'`,
      `drawtext=text='날숨':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h*0.35:enable='between(t,${holdEnd},${exhaleEnd})'`,
    ];
    if (pattern.holdAfterExhale) {
      stageFilters.push(
        `drawtext=text='정지':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h*0.35:enable='between(t,${exhaleEnd},${totalDuration})'`
      );
    }

    // 파이프라인 (drawbox로 선 표현)
    const pipelineFilter = `drawbox=x=${pipeX1}:y=${pipeY - 4}:w=${pipeX2 - pipeX1}:h=8:color=${pipelineColor}@0.8:t=fill`;

    // 구슬 X 위치 애니메이션 (들숨: 왼→오른, 정지: 고정, 날숨: 오른→왼)
    const orbX = `if(lt(t,${inhaleEnd}),${pipeX1}+(${pipeX2 - pipeX1})*t/${inhaleEnd},if(lt(t,${holdEnd}),${pipeX2},if(lt(t,${exhaleEnd}),${pipeX2}-(${pipeX2 - pipeX1})*(t-${holdEnd})/${pattern.exhale},${pipeX1})))`;
    const orbY = pipeY;

    // drawcircle은 FFmpeg 내장 필터가 아님 → geq 필터로 원 그리기
    const orbFilter = `geq=r='if(pow(X-(${orbX}),2)+pow(Y-${orbY},2)<${orbSize * orbSize},255,r(X,Y))':g='if(pow(X-(${orbX}),2)+pow(Y-${orbY},2)<${orbSize * orbSize},215,g(X,Y))':b='if(pow(X-(${orbX}),2)+pow(Y-${orbY},2)<${orbSize * orbSize},0,b(X,Y))'`;

    // 패턴 카운터 텍스트
    const counterFilter = `drawtext=text='${pattern.inhale}-${pattern.hold}-${pattern.exhale}${pattern.holdAfterExhale ? '-' + pattern.holdAfterExhale : ''}':fontsize=40:fontcolor=white@0.6:x=(w-text_w)/2:y=h*0.7`;

    // 전체 filter_complex 조합
    const allFilters = [pipelineFilter, orbFilter, ...stageFilters, counterFilter].join(',');

    const inputs: string[] = [];
    let filterComplex = '';
    let mapArgs = '';

    if (backgroundImagePath && fs.existsSync(backgroundImagePath)) {
      // 배경 이미지 있을 때
      inputs.push(`-loop 1 -i "${backgroundImagePath}"`);
      filterComplex = `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},${allFilters},trim=duration=${totalDuration}[vout]`;
      mapArgs = '-map "[vout]"';
    } else {
      // 배경 없을 때 — 단색 배경 생성
      inputs.push(`-f lavfi -i "color=c=0x0A0E27:s=${width}x${height}:r=${fps}:d=${totalDuration}"`);
      filterComplex = `[0:v]${allFilters}[vout]`;
      mapArgs = '-map "[vout]"';
    }

    let soundArgs = '';
    if (effectSoundPath && fs.existsSync(effectSoundPath)) {
      inputs.push(`-i "${effectSoundPath}"`);
      const soundIdx = inputs.length - 1;
      soundArgs = `-map ${soundIdx}:a -c:a aac -b:a 128k -shortest`;
    } else {
      // 무음 오디오 추가 (재생 호환성)
      inputs.push(`-f lavfi -i "anullsrc=r=44100:cl=stereo:d=${totalDuration}"`);
      const soundIdx = inputs.length - 1;
      soundArgs = `-map ${soundIdx}:a -c:a aac -b:a 64k -shortest`;
    }

    const ffmpegCmd = [
      'ffmpeg',
      ...inputs,
      `-filter_complex "${filterComplex}"`,
      mapArgs,
      soundArgs,
      '-c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p',
      `-t ${totalDuration}`,
      `-y "${outputPath}"`,
    ].join(' ');

    console.log(`🎬 Generating video: ${outputPath}`);
    console.log(`⚙️  Pattern: ${pattern.inhale}-${pattern.hold}-${pattern.exhale}, Duration: ${totalDuration}s`);

    try {
      execSync(ffmpegCmd, { stdio: 'pipe', timeout: 120000 });
      console.log(`✅ Video generated: ${outputPath}`);
      return outputPath;
    } catch (error: any) {
      const stderr = error.stderr?.toString() || '';
      console.error(`❌ FFmpeg error: ${stderr}`);
      throw new Error(`Video generation failed: ${stderr.slice(0, 200)}`);
    }
  }

  /** 비디오 썸네일 생성 */
  static generateThumbnail(videoPath: string, outputPath: string, timestamp = 1): string {
    const cmd = `ffmpeg -i "${videoPath}" -ss ${timestamp} -vframes 1 -vf "scale=540:960" -y "${outputPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    return outputPath;
  }

  /** 비디오 정보 조회 */
  static getVideoInfo(videoPath: string): { duration: number; width: number; height: number } {
    try {
      const durationCmd = `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`;
      const duration = parseFloat(execSync(durationCmd, { encoding: 'utf-8' }).trim());
      const sizeCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`;
      const [w, h] = execSync(sizeCmd, { encoding: 'utf-8' }).trim().split(',').map(Number);
      return { duration, width: w || 1080, height: h || 1920 };
    } catch {
      return { duration: 0, width: 1080, height: 1920 };
    }
  }

  /** FFmpeg 설치 여부 확인 */
  static checkFFmpeg(): boolean {
    const result = spawnSync('ffmpeg', ['-version'], { encoding: 'utf-8' });
    return result.status === 0;
  }
}
