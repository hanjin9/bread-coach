import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { BreathingTemplate } from '../types/template';

export class TemplateVideoGenerator {
  /**
   * 호흡 템플릿을 MP4 영상으로 생성
   */
  async generateVideo(template: BreathingTemplate, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const totalDuration = 
        template.breathing.inhale +
        template.breathing.hold1 +
        template.breathing.exhale +
        template.breathing.hold2;

      // FFmpeg 필터 구성
      const filters = this.buildFilters(template, totalDuration);

      ffmpeg()
        .input('color=c=black:s=1080x1920:d=' + totalDuration)
        .input(template.background.image || 'color=c=#0a0e27:s=1080x1920:d=' + totalDuration)
        .complexFilter(filters)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * FFmpeg 필터 체인 구성
   */
  private buildFilters(template: BreathingTemplate, totalDuration: number): string {
    const filters = [];

    // 배경 레이어
    if (template.background.image) {
      filters.push(`[1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[bg]`);
    }

    // 파이프라인 + 구슬 애니메이션 (drawtext 또는 drawbox 사용)
    const pipelineFilter = this.generatePipelineFilter(template, totalDuration);
    filters.push(pipelineFilter);

    // 효과음 추가 (오디오)
    if (template.sound.url) {
      filters.push(`[a:0]volume=${template.sound.volume}[audio]`);
    }

    return filters.join(';');
  }

  /**
   * 파이프라인 + 구슬 애니메이션 필터 생성
   */
  private generatePipelineFilter(template: BreathingTemplate, totalDuration: number): string {
    const { inhale, hold1, exhale, hold2 } = template.breathing;
    const { thickness, color, curvature, startExtend, endExtend } = template.pipeline;
    const { size, orbColor } = template.orb;

    // 구슬의 X 위치 애니메이션 (0 ~ 1920)
    const orbX = `if(lt(t\\,${inhale})\\,${startExtend}+t/${inhale}*${1920-startExtend-endExtend}\\,if(lt(t\\,${inhale+hold1})\\,${1920-endExtend}\\,if(lt(t\\,${inhale+hold1+exhale})\\,${1920-endExtend}-(t-${inhale+hold1})/${exhale}*${1920-startExtend-endExtend}\\,${startExtend})))`;

    // drawbox를 사용한 파이프라인 그리기
    const pipelineDrawBox = `drawbox=x=${startExtend}:y=960-${thickness/2}:w=${1920-startExtend-endExtend}:w=${thickness}:color=${color}:thickness=${thickness}`;

    // drawcircle을 사용한 구슬 그리기
    const orbDrawCircle = `drawcircle=x=${orbX}:y=960:r=${size}:color=${orbColor}:thickness=fill`;

    return `[0:v]${pipelineDrawBox},${orbDrawCircle}[out]`;
  }

  /**
   * 템플릿 프리셋 생성
   */
  getPresets() {
    return [
      {
        name: '기본 (4-7-8)',
        template: {
          breathing: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
          pipeline: { thickness: 8, color: '#d4af37', curvature: 30, startExtend: 20, endExtend: 20 },
          orb: { size: 25, color: '#d4af37', opacity: 1, texture: 'glossy', shadowOpacity: 0.3 },
        },
      },
      {
        name: '럭셔리 골드',
        template: {
          breathing: { inhale: 5, hold1: 5, exhale: 5, hold2: 0 },
          pipeline: { thickness: 12, color: '#ffd700', curvature: 50, startExtend: 30, endExtend: 30 },
          orb: { size: 35, color: '#ffd700', opacity: 0.9, texture: 'glossy', shadowOpacity: 0.5 },
        },
      },
      {
        name: '미니멀',
        template: {
          breathing: { inhale: 3, hold1: 3, exhale: 3, hold2: 0 },
          pipeline: { thickness: 4, color: '#ffffff', curvature: 20, startExtend: 10, endExtend: 10 },
          orb: { size: 15, color: '#ffffff', opacity: 0.8, texture: 'matte', shadowOpacity: 0.2 },
        },
      },
    ];
  }
}

export default new TemplateVideoGenerator();
