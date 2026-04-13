/**
 * Bread Coach - Luxury Dark Theme Color Palette
 * 럭셔리 다크 테마 색상 팔레트
 */

export const colors = {
  // Primary Colors - 럭셔리 블랙 & 골드
  primary: '#1a1a1a',           // 주 배경색 (럭셔리 블랙)
  primaryLight: '#2a2a2a',      // 밝은 블랙 (호버 상태)
  primaryDark: '#0f0f0f',       // 어두운 블랙 (깊이감)

  // Secondary Colors - 골드
  secondary: '#d4af37',         // 주 강조색 (골드)
  secondaryLight: '#e8c547',    // 밝은 골드
  secondaryDark: '#b8941f',     // 어두운 골드

  // Accent Colors - 대리석 & 그레이
  accent: '#f0f0f0',            // 라이트 그레이 (텍스트)
  accentLight: '#ffffff',       // 화이트
  accentDark: '#a0a0a0',        // 다크 그레이

  // Surface Colors - 표면 색상
  surface: '#1a1a1a',           // 카드, 모달 배경
  surfaceLight: '#2a2a2a',      // 호버 상태
  surfaceDark: '#0f0f0f',       // 깊은 표면

  // Marble Effect - 대리석 효과
  marble: '#2a2a2a',            // 대리석 그레이
  marbleLight: '#3a3a3a',       // 밝은 대리석
  marbleDark: '#1a1a1a',        // 어두운 대리석

  // Background Colors
  background: '#0f0f0f',        // 앱 배경색
  backgroundLight: '#1a1a1a',   // 밝은 배경
  backgroundDark: '#000000',    // 검은색 배경

  // Semantic Colors
  success: '#51cf66',           // 성공 (초록색)
  successLight: '#69db7c',      // 밝은 성공
  error: '#ff6b6b',             // 에러 (빨간색)
  errorLight: '#ff8787',        // 밝은 에러
  warning: '#ffd43b',           // 경고 (노란색)
  warningLight: '#ffe066',      // 밝은 경고
  info: '#74c0fc',              // 정보 (파란색)
  infoLight: '#a5d8ff',         // 밝은 정보

  // Text Colors
  textPrimary: '#f0f0f0',       // 주 텍스트 (라이트 그레이)
  textSecondary: '#a0a0a0',     // 보조 텍스트 (다크 그레이)
  textTertiary: '#707070',      // 3차 텍스트 (더 어두운 그레이)
  textInverse: '#1a1a1a',       // 반전 텍스트 (블랙)

  // Border Colors
  border: '#2a2a2a',            // 기본 테두리
  borderLight: '#3a3a3a',       // 밝은 테두리
  borderDark: '#1a1a1a',        // 어두운 테두리

  // Breathing Animation Colors
  breathingPipelineDefault: '#d4af37',    // 기본 파이프라인 (골드)
  breathingOrbDefault: '#d4af37',         // 기본 구슬 (골드)
  breathingPipelineAlt: '#74c0fc',       // 대체 파이프라인 (파란색)
  breathingOrbAlt: '#74c0fc',            // 대체 구슬 (파란색)

  // Gradient Colors
  gradientStart: '#d4af37',     // 그라데이션 시작 (골드)
  gradientEnd: '#1a1a1a',       // 그라데이션 끝 (블랙)

  // Transparency
  transparent: 'transparent',
  transparentBlack: 'rgba(0, 0, 0, 0.5)',
  transparentWhite: 'rgba(240, 240, 240, 0.1)',
  transparentGold: 'rgba(212, 175, 55, 0.2)',
};

/**
 * Color Utilities
 */
export const colorUtils = {
  /**
   * Hex 색상에 투명도 추가
   * @param hex - Hex 색상 코드 (예: '#d4af37')
   * @param alpha - 투명도 (0-1, 기본값: 0.5)
   * @returns RGBA 색상 문자열
   */
  hexToRgba: (hex: string, alpha: number = 0.5): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  /**
   * 색상 밝기 조정
   * @param hex - Hex 색상 코드
   * @param percent - 조정 비율 (-100 ~ 100)
   * @returns 조정된 Hex 색상
   */
  adjustBrightness: (hex: string, percent: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.min(255, Math.max(0, r + (r * percent) / 100));
    const newG = Math.min(255, Math.max(0, g + (g * percent) / 100));
    const newB = Math.min(255, Math.max(0, b + (b * percent) / 100));

    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  },

  /**
   * 색상 혼합
   * @param color1 - 첫 번째 색상
   * @param color2 - 두 번째 색상
   * @param ratio - 혼합 비율 (0-1)
   * @returns 혼합된 색상
   */
  blendColors: (color1: string, color2: string, ratio: number = 0.5): string => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const newR = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const newG = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const newB = Math.round(b1 * (1 - ratio) + b2 * ratio);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  },
};

export default colors;
