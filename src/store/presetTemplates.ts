import { BreathingTemplate } from './templateStore';

/**
 * 호흡 템플릿 프리셋 시스템
 * - 기본 (Default): 표준 4-7-8 호흡법
 * - 럭셔리 (Luxury): 고급 시각 효과 + 프리미엄 배경
 * - 미니멀 (Minimal): 간단하고 깔끔한 디자인
 */

export const PRESET_TEMPLATES: Record<string, BreathingTemplate> = {
  // 기본 템플릿: 4-7-8 호흡법
  default: {
    id: 'preset-default',
    name: '기본 4-7-8 호흡법',
    breathing: {
      inhale: 4,
      hold1: 7,
      exhale: 8,
      hold2: 0,
    },
    pipeline: {
      thickness: 8,
      color: '#d4af37',
      curvature: 30,
      startExtend: 0,
      endExtend: 0,
    },
    orb: {
      size: 25,
      color: '#d4af37',
      opacity: 0.9,
      texture: 'glossy',
      shadowOpacity: 0.3,
    },
    background: {
      image: null,
      opacity: 0.5,
    },
    sound: {
      url: null,
      volume: 0.2,
    },
    style: 'standard',
  },

  // 럭셔리 템플릿: 프리미엄 시각 효과
  luxury: {
    id: 'preset-luxury',
    name: '럭셔리 프리미엄',
    breathing: {
      inhale: 4,
      hold1: 7,
      exhale: 8,
      hold2: 0,
    },
    pipeline: {
      thickness: 12, // 더 굵은 파이프라인
      color: '#ffd700', // 더 밝은 골드
      curvature: 60, // 더 큰 곡률
      startExtend: 20,
      endExtend: 20,
    },
    orb: {
      size: 35, // 더 큰 구슬
      color: '#ffd700',
      opacity: 1.0, // 완전 불투명
      texture: 'metallic', // 메탈릭 질감
      shadowOpacity: 0.5, // 더 진한 그림자
    },
    background: {
      image: 'https://cdn.example.com/backgrounds/fullmoon-night.mp4',
      opacity: 0.7, // 더 진한 배경
    },
    sound: {
      url: 'https://cdn.example.com/sounds/water-flowing.mp3',
      volume: 0.25,
    },
    style: 'penetration', // 변형 스타일 사용
  },

  // 미니멀 템플릿: 간단하고 깔끔
  minimal: {
    id: 'preset-minimal',
    name: '미니멀 심플',
    breathing: {
      inhale: 4,
      hold1: 7,
      exhale: 8,
      hold2: 0,
    },
    pipeline: {
      thickness: 4, // 가는 파이프라인
      color: '#ffffff', // 흰색
      curvature: 15, // 작은 곡률
      startExtend: 0,
      endExtend: 0,
    },
    orb: {
      size: 15, // 작은 구슬
      color: '#ffffff',
      opacity: 0.7,
      texture: 'matte', // 매트 질감
      shadowOpacity: 0.1, // 약한 그림자
    },
    background: {
      image: null,
      opacity: 0.3, // 약한 배경
    },
    sound: {
      url: null,
      volume: 0.1,
    },
    style: 'standard',
  },

  // 박스 호흡법 (4-4-4-4)
  boxBreathing: {
    id: 'preset-box-breathing',
    name: '박스 호흡법 (4-4-4-4)',
    breathing: {
      inhale: 4,
      hold1: 4,
      exhale: 4,
      hold2: 4,
    },
    pipeline: {
      thickness: 8,
      color: '#d4af37',
      curvature: 30,
      startExtend: 0,
      endExtend: 0,
    },
    orb: {
      size: 25,
      color: '#d4af37',
      opacity: 0.9,
      texture: 'glossy',
      shadowOpacity: 0.3,
    },
    background: {
      image: null,
      opacity: 0.5,
    },
    sound: {
      url: null,
      volume: 0.2,
    },
    style: 'standard',
  },

  // 깊은 호흡법 (5-10-7)
  deepBreathing: {
    id: 'preset-deep-breathing',
    name: '깊은 호흡법 (5-10-7)',
    breathing: {
      inhale: 5,
      hold1: 10,
      exhale: 7,
      hold2: 0,
    },
    pipeline: {
      thickness: 10,
      color: '#87ceeb', // 하늘색
      curvature: 40,
      startExtend: 0,
      endExtend: 0,
    },
    orb: {
      size: 28,
      color: '#87ceeb',
      opacity: 0.85,
      texture: 'glossy',
      shadowOpacity: 0.3,
    },
    background: {
      image: 'https://cdn.example.com/backgrounds/ocean-waves.mp4',
      opacity: 0.6,
    },
    sound: {
      url: 'https://cdn.example.com/sounds/birds-chirping.mp3',
      volume: 0.2,
    },
    style: 'standard',
  },

  // 빠른 호흡법 (3-3-3)
  quickBreathing: {
    id: 'preset-quick-breathing',
    name: '빠른 호흡법 (3-3-3)',
    breathing: {
      inhale: 3,
      hold1: 3,
      exhale: 3,
      hold2: 0,
    },
    pipeline: {
      thickness: 6,
      color: '#ff6b6b', // 빨간색
      curvature: 20,
      startExtend: 0,
      endExtend: 0,
    },
    orb: {
      size: 20,
      color: '#ff6b6b',
      opacity: 0.9,
      texture: 'glossy',
      shadowOpacity: 0.3,
    },
    background: {
      image: null,
      opacity: 0.4,
    },
    sound: {
      url: null,
      volume: 0.15,
    },
    style: 'standard',
  },

  // 명상 호흡법 (6-6-6-6)
  meditationBreathing: {
    id: 'preset-meditation-breathing',
    name: '명상 호흡법 (6-6-6-6)',
    breathing: {
      inhale: 6,
      hold1: 6,
      exhale: 6,
      hold2: 6,
    },
    pipeline: {
      thickness: 10,
      color: '#b19cd9', // 보라색
      curvature: 50,
      startExtend: 10,
      endExtend: 10,
    },
    orb: {
      size: 30,
      color: '#b19cd9',
      opacity: 0.95,
      texture: 'glossy',
      shadowOpacity: 0.4,
    },
    background: {
      image: 'https://cdn.example.com/backgrounds/dawn-mist.mp4',
      opacity: 0.8,
    },
    sound: {
      url: 'https://cdn.example.com/sounds/ambient-silence.mp3',
      volume: 0.2,
    },
    style: 'penetration',
  },

  // 에너지 부스트 호흡법 (2-4-4)
  energyBoost: {
    id: 'preset-energy-boost',
    name: '에너지 부스트 (2-4-4)',
    breathing: {
      inhale: 2,
      hold1: 4,
      exhale: 4,
      hold2: 0,
    },
    pipeline: {
      thickness: 7,
      color: '#ffa500', // 주황색
      curvature: 25,
      startExtend: 0,
      endExtend: 0,
    },
    orb: {
      size: 22,
      color: '#ffa500',
      opacity: 0.9,
      texture: 'metallic',
      shadowOpacity: 0.3,
    },
    background: {
      image: 'https://cdn.example.com/backgrounds/forest-light.mp4',
      opacity: 0.6,
    },
    sound: {
      url: 'https://cdn.example.com/sounds/wind-breeze.mp3',
      volume: 0.2,
    },
    style: 'standard',
  },

  // 스트레스 해소 호흡법 (5-5-5-5)
  stressRelief: {
    id: 'preset-stress-relief',
    name: '스트레스 해소 (5-5-5-5)',
    breathing: {
      inhale: 5,
      hold1: 5,
      exhale: 5,
      hold2: 5,
    },
    pipeline: {
      thickness: 9,
      color: '#90ee90', // 연두색
      curvature: 45,
      startExtend: 5,
      endExtend: 5,
    },
    orb: {
      size: 26,
      color: '#90ee90',
      opacity: 0.85,
      texture: 'glossy',
      shadowOpacity: 0.3,
    },
    background: {
      image: 'https://cdn.example.com/backgrounds/flowing-water.mp4',
      opacity: 0.7,
    },
    sound: {
      url: 'https://cdn.example.com/sounds/water-flowing.mp3',
      volume: 0.25,
    },
    style: 'penetration',
  },
};

/**
 * 프리셋 템플릿 목록 조회
 */
export function getPresetTemplates(): BreathingTemplate[] {
  return Object.values(PRESET_TEMPLATES);
}

/**
 * 특정 프리셋 조회
 */
export function getPresetTemplate(id: string): BreathingTemplate | null {
  return PRESET_TEMPLATES[id] || null;
}

/**
 * 프리셋 카테고리별 분류
 */
export const PRESET_CATEGORIES = {
  basic: ['default', 'boxBreathing'],
  advanced: ['deepBreathing', 'quickBreathing', 'meditationBreathing'],
  wellness: ['energyBoost', 'stressRelief'],
  premium: ['luxury'],
  minimal: ['minimal'],
};

/**
 * 카테고리별 프리셋 조회
 */
export function getPresetsByCategory(category: keyof typeof PRESET_CATEGORIES): BreathingTemplate[] {
  const ids = PRESET_CATEGORIES[category];
  return ids.map((id) => PRESET_TEMPLATES[id]).filter(Boolean);
}
