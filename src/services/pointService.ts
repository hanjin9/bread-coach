/**
 * Point Service - 포인트 시스템
 * 시청 시간 기반 자동 적립
 */

import { api } from './api';

export interface PointTransaction {
  id: string;
  userId: number;
  points: number;
  transactionType: 'earn' | 'spend' | 'bonus' | 'refund';
  description: string;
  videoId?: string;
  watchDurationSeconds?: number;
  createdAt: string;
}

export interface UserPoints {
  userId: number;
  totalPoints: number;
  currentVipLevel: string;
  vipProgress: number;
  transactionHistory: PointTransaction[];
}

export class PointService {
  /**
   * 영상 시청 시간 측정 및 포인트 자동 지급
   */
  static calculatePointsFromWatchTime(watchDurationSeconds: number): number {
    // 기본 규칙: 1초 = 0.1 포인트 (100초 = 10포인트)
    const basePoints = Math.floor(watchDurationSeconds * 0.1);
    
    // 보너스: 5분 이상 시청 시 20% 보너스
    const bonusMultiplier = watchDurationSeconds >= 300 ? 1.2 : 1;
    
    // 보너스: 10분 이상 시청 시 추가 50포인트
    const extraBonus = watchDurationSeconds >= 600 ? 50 : 0;
    
    return Math.floor(basePoints * bonusMultiplier) + extraBonus;
  }

  /**
   * 영상 시청 완료 후 포인트 적립
   */
  static async recordVideoCompletion(
    userId: number,
    videoId: string,
    watchDurationSeconds: number
  ): Promise<PointTransaction> {
    const points = this.calculatePointsFromWatchTime(watchDurationSeconds);
    
    try {
      const response = await api.post('/api/points/earn', {
        userId,
        videoId,
        points,
        watchDurationSeconds,
        transactionType: 'earn',
        description: `호흡 영상 시청 완료 (${Math.floor(watchDurationSeconds / 60)}분)`,
      });

      return response.data.data;
    } catch (error) {
      console.error('Failed to record video completion:', error);
      throw error;
    }
  }

  /**
   * 사용자 포인트 조회
   */
  static async getUserPoints(userId: number): Promise<UserPoints> {
    try {
      const response = await api.get(`/api/points/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get user points:', error);
      throw error;
    }
  }

  /**
   * 포인트 사용 (쇼핑, 구독 등)
   */
  static async spendPoints(
    userId: number,
    points: number,
    description: string
  ): Promise<PointTransaction> {
    try {
      const response = await api.post('/api/points/spend', {
        userId,
        points,
        description,
      });

      return response.data.data;
    } catch (error) {
      console.error('Failed to spend points:', error);
      throw error;
    }
  }

  /**
   * 포인트 거래 내역 조회
   */
  static async getTransactionHistory(userId: number, limit: number = 20): Promise<PointTransaction[]> {
    try {
      const response = await api.get(`/api/points/history/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      throw error;
    }
  }

  /**
   * 포인트 보너스 지급 (이벤트, 추천 등)
   */
  static async addBonusPoints(
    userId: number,
    points: number,
    reason: string
  ): Promise<PointTransaction> {
    try {
      const response = await api.post('/api/points/bonus', {
        userId,
        points,
        reason,
      });

      return response.data.data;
    } catch (error) {
      console.error('Failed to add bonus points:', error);
      throw error;
    }
  }
}
