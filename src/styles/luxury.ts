/**
 * Bread Coach - Luxury Design System
 * 럭셔리 디자인 시스템 (다크 블랙 & 골드)
 */

import { colors, colorUtils } from './colors';
import { typography, spacing, shadows, borderRadius, durations } from './spacing';

// ============================================================================
// 럭셔리 그라데이션
// ============================================================================

export const luxuryGradients = {
  // 골드 그라데이션
  goldGradient: {
    colors: ['#d4af37', '#b8941f', '#8b7620'],
    locations: [0, 0.5, 1],
  },

  // 블랙 그라데이션
  blackGradient: {
    colors: ['#2a2a2a', '#1a1a1a', '#0f0f0f'],
    locations: [0, 0.5, 1],
  },

  // 대리석 그라데이션
  marbleGradient: {
    colors: ['#3a3a3a', '#2a2a2a', '#1a1a1a'],
    locations: [0, 0.5, 1],
  },

  // 프리미엄 그라데이션 (골드 + 블랙)
  premiumGradient: {
    colors: ['#d4af37', '#1a1a1a'],
    locations: [0, 1],
  },
};

// ============================================================================
// 럭셔리 컴포넌트 스타일
// ============================================================================

export const luxuryStyles = {
  // 프리미엄 카드
  premiumCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },

  // 럭셔리 버튼
  luxuryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  // 럭셔리 입력 필드
  luxuryInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.marble,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
  },

  // 럭셔리 헤더
  luxuryHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.marble,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // 럭셔리 모달
  luxuryModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
};

// ============================================================================
// 럭셔리 애니메이션 설정
// ============================================================================

export const luxuryAnimations = {
  // 부드러운 페이드 인
  fadeIn: {
    duration: durations.normal,
    easing: 'ease-out',
  },

  // 골드 하이라이트 애니메이션
  goldHighlight: {
    duration: durations.slow,
    easing: 'ease-in-out',
    colors: [colors.secondary, colors.secondaryLight, colors.secondary],
  },

  // 구슬 펄스 애니메이션
  orbPulse: {
    duration: durations.slower,
    easing: 'ease-in-out',
    scale: [1, 1.1, 1],
  },

  // 파이프라인 글로우 애니메이션
  pipelineGlow: {
    duration: durations.slow,
    easing: 'ease-in-out',
    opacity: [0.5, 1, 0.5],
  },
};

// ============================================================================
// 럭셔리 텍스트 스타일
// ============================================================================

export const luxuryTextStyles = {
  // 골드 제목
  goldTitle: {
    ...typography.h1,
    color: colors.secondary,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // 골드 부제목
  goldSubtitle: {
    ...typography.h3,
    color: colors.secondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // 럭셔리 본문
  luxuryBody: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    letterSpacing: 0.3,
  },

  // 럭셔리 캡션
  luxuryCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
};

// ============================================================================
// 럭셔리 테마 팔레트
// ============================================================================

export const luxuryTheme = {
  // 주 색상
  primary: colors.primary,
  primaryLight: colors.primaryLight,
  primaryDark: colors.primaryDark,

  // 강조 색상
  accent: colors.secondary,
  accentLight: colors.secondaryLight,
  accentDark: colors.secondaryDark,

  // 표면 색상
  surface: colors.surface,
  surfaceLight: colors.surfaceLight,
  surfaceDark: colors.surfaceDark,

  // 텍스트 색상
  text: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textTertiary: colors.textTertiary,

  // 상태 색상
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,

  // 그라데이션
  gradients: luxuryGradients,

  // 컴포넌트 스타일
  components: luxuryStyles,

  // 애니메이션
  animations: luxuryAnimations,

  // 텍스트 스타일
  textStyles: luxuryTextStyles,
};

// ============================================================================
// 럭셔리 유틸리티 함수
// ============================================================================

export const luxuryUtils = {
  /**
   * 골드 강조 효과 생성
   */
  createGoldAccent: (text: string, intensity: number = 0.8): string => {
    return `<span style="color: ${colorUtils.hexToRgba(colors.secondary, intensity)}">${text}</span>`;
  },

  /**
   * 럭셔리 그림자 생성
   */
  createLuxuryShadow: (
    offsetX: number = 0,
    offsetY: number = 8,
    radius: number = 16,
    opacity: number = 0.3
  ) => {
    return {
      shadowColor: colors.secondary,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation: 12,
    };
  },

  /**
   * 럭셔리 테두리 생성
   */
  createLuxuryBorder: (color: string = colors.secondary, width: number = 2) => {
    return {
      borderWidth: width,
      borderColor: color,
      borderRadius: borderRadius.md,
    };
  },

  /**
   * 럭셔리 배경 생성
   */
  createLuxuryBackground: (
    gradientStart: string = colors.secondary,
    gradientEnd: string = colors.background
  ) => {
    return {
      backgroundColor: gradientStart,
      backgroundImage: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
    };
  },
};

export default {
  luxuryGradients,
  luxuryStyles,
  luxuryAnimations,
  luxuryTextStyles,
  luxuryTheme,
  luxuryUtils,
};
