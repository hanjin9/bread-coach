/**
 * VIP Service - VIP 카드 승급 시스템
 * 10단계: Bronze → Silver → Gold → Emerald → Sapphire → Diamond → Platinum → Black Platinum
 */

import { api } from './api';

export type VipLevel = 
  | 'bronze' 
  | 'silver' 
  | 'gold' 
  | 'emerald' 
  | 'sapphire' 
  | 'diamond' 
  | 'platinum' 
  | 'black_platinum';

export interface VipCard {
  userId: number;
  currentLevel: VipLevel;
  pointsRequired: number;
  pointsEarned: number;
  progressPercentage: number;
  benefits: string[];
  nextLevelPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface VipBenefit {
  level: VipLevel;
  name: string;
  color: string;
  pointsRequired: number;
  benefits: string[];
  discountRate: number;
  monthlyBonus: number;
}

export class VipService {
  // VIP 레벨 정의
  static readonly VIP_LEVELS: Record<VipLevel, VipBenefit> = {
    bronze: {
      level: 'bronze',
      name: '브론즈',
      color: '#CD7F32',
      pointsRequired: 0,
      benefits: ['기본 호흡 가이드', '1일 1회 영상'],
      discountRate: 0,
      monthlyBonus: 0,
    },
    silver: {
      level: 'silver',
      name: '실버',
      color: '#C0C0C0',
      pointsRequired: 1000,
      benefits: ['모든 호흡 패턴', '1일 3회 영상', '5% 할인'],
      discountRate: 5,
      monthlyBonus: 100,
    },
    gold: {
      level: 'gold',
      name: '골드',
      color: '#FFD700',
      pointsRequired: 3000,
      benefits: ['1일 5회 영상', '광고 없음', '10% 할인', '커스텀 알림'],
      discountRate: 10,
      monthlyBonus: 200,
    },
    emerald: {
      level: 'emerald',
      name: '에메랄드',
      color: '#50C878',
      pointsRequired: 6000,
      benefits: ['무제한 영상', '우선 지원', '15% 할인', '월간 보너스 포인트'],
      discountRate: 15,
      monthlyBonus: 300,
    },
    sapphire: {
      level: 'sapphire',
      name: '사파이어',
      color: '#0F52BA',
      pointsRequired: 10000,
      benefits: ['VIP 라운지 액세스', '20% 할인', '전용 콘텐츠', '우선 이벤트 참여'],
      discountRate: 20,
      monthlyBonus: 500,
    },
    diamond: {
      level: 'diamond',
      name: '다이아몬드',
      color: '#B9F2FF',
      pointsRequired: 15000,
      benefits: ['개인 코치 상담', '25% 할인', '커뮤니티 리더 권한', '월간 특별 이벤트'],
      discountRate: 25,
      monthlyBonus: 800,
    },
    platinum: {
      level: 'platinum',
      name: '플래티넘',
      color: '#E5E4E2',
      pointsRequired: 22000,
      benefits: ['프리미엄 콘텐츠 무제한', '30% 할인', '전용 라운지', '우선 신제품 출시'],
      discountRate: 30,
      monthlyBonus: 1200,
    },
    black_platinum: {
      level: 'black_platinum',
      name: '블랙 플래티넘',
      color: '#000000',
      pointsRequired: 30000,
      benefits: ['최고 등급 혜택', '40% 할인', '전용 컨시어지 서비스', '무제한 우선 지원'],
      discountRate: 40,
      monthlyBonus: 2000,
    },
  };

  /**
   * 사용자 VIP 카드 조회
   */
  static async getUserVipCard(userId: number): Promise<VipCard> {
    try {
      const response = await api.get(`/api/vip/card/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get VIP card:', error);
      throw error;
    }
  }

  /**
   * VIP 레벨 자동 업그레이드 확인
   */
  static async checkAndUpgradeVipLevel(userId: number, currentPoints: number): Promise<VipCard> {
    try {
      const response = await api.post('/api/vip/check-upgrade', {
        userId,
        currentPoints,
      });

      return response.data.data;
    } catch (error) {
      console.error('Failed to check VIP upgrade:', error);
      throw error;
    }
  }

  /**
   * 다음 VIP 레벨 정보 조회
   */
  static getNextVipLevel(currentLevel: VipLevel): VipBenefit | null {
    const levels: VipLevel[] = [
      'bronze',
      'silver',
      'gold',
      'emerald',
      'sapphire',
      'diamond',
      'platinum',
      'black_platinum',
    ];

    const currentIndex = levels.indexOf(currentLevel);
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
      return null;
    }

    const nextLevel = levels[currentIndex + 1];
    return this.VIP_LEVELS[nextLevel];
  }

  /**
   * VIP 레벨별 혜택 조회
   */
  static getVipBenefits(level: VipLevel): VipBenefit {
    return this.VIP_LEVELS[level];
  }

  /**
   * 모든 VIP 레벨 조회
   */
  static getAllVipLevels(): VipBenefit[] {
    return Object.values(this.VIP_LEVELS);
  }

  /**
   * VIP 진행률 계산
   */
  static calculateVipProgress(currentLevel: VipLevel, currentPoints: number): number {
    const currentBenefit = this.VIP_LEVELS[currentLevel];
    const nextBenefit = this.getNextVipLevel(currentLevel);

    if (!nextBenefit) {
      return 100; // 최고 등급
    }

    const pointsInCurrentLevel = currentPoints - currentBenefit.pointsRequired;
    const pointsNeededForNextLevel = nextBenefit.pointsRequired - currentBenefit.pointsRequired;

    return Math.min(100, Math.floor((pointsInCurrentLevel / pointsNeededForNextLevel) * 100));
  }

  /**
   * VIP 레벨 다운그레이드 확인 (선택사항)
   */
  static async downgradeVipLevel(userId: number): Promise<VipCard> {
    try {
      const response = await api.post('/api/vip/downgrade', { userId });
      return response.data.data;
    } catch (error) {
      console.error('Failed to downgrade VIP level:', error);
      throw error;
    }
  }

  /**
   * VIP 카드 이력 조회
   */
  static async getVipHistory(userId: number): Promise<any[]> {
    try {
      const response = await api.get(`/api/vip/history/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get VIP history:', error);
      throw error;
    }
  }
}
