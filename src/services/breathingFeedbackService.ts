/**
 * Breathing Feedback Service
 * 실시간 호흡 데이터 분석 및 AI 피드백 제공
 */

import { api } from './api';

export interface BreathingData {
  userId: number;
  videoId: string;
  watchDurationSeconds: number;
  completionPercentage: number;
  breathingPattern: string; // "4-7-8", "4-4-4-4", etc
  accuracy: number; // 0-100
  consistency: number; // 0-100
  heartRateChange: number; // bpm
  stressLevelBefore: number; // 1-10
  stressLevelAfter: number; // 1-10
  timestamp: string;
}

export interface FeedbackResponse {
  stage: 'encouragement' | 'warning' | 'premium';
  text: string;
  voiceUrl?: string;
  missionSuggestion?: string;
  isPremium: boolean;
  price?: number;
  nextAction?: string;
}

export interface BreathingStats {
  totalSessions: number;
  averageAccuracy: number;
  averageConsistency: number;
  totalMinutesCompleted: number;
  stressReductionAverage: number;
  favoritePattern: string;
  streak: number; // 연속 일수
}

export class BreathingFeedbackService {
  /**
   * 호흡 세션 데이터 저장 및 피드백 생성
   */
  static async recordBreathingSession(data: BreathingData): Promise<FeedbackResponse> {
    try {
      const response = await api.post('/api/breathing/session', data);
      return response.data.data;
    } catch (error) {
      console.error('Failed to record breathing session:', error);
      throw error;
    }
  }

  /**
   * 1차 피드백: 격려 (Encouragement)
   * 무료, 즉시 제공, 긍정적 톤
   */
  static async generateEncouragementFeedback(data: BreathingData): Promise<FeedbackResponse> {
    const prompt = `
사용자가 방금 완료한 호흡 운동:
- 호흡 패턴: ${data.breathingPattern}
- 완료율: ${data.completionPercentage}%
- 정확도: ${data.accuracy}%
- 일관성: ${data.consistency}%
- 스트레스 감소: ${data.stressLevelBefore - data.stressLevelAfter}점
- 시청 시간: ${Math.floor(data.watchDurationSeconds / 60)}분

따뜻하고 격려적인 피드백을 1-2문장으로 제공하세요. 긍정적인 톤으로 그들의 성취를 칭찬하세요.
`;

    try {
      const response = await api.post('/api/breathing/feedback/encouragement', {
        userId: data.userId,
        prompt,
        data,
      });

      return {
        stage: 'encouragement',
        text: response.data.data.text,
        isPremium: false,
      };
    } catch (error) {
      console.error('Failed to generate encouragement feedback:', error);
      return {
        stage: 'encouragement',
        text: '훌륭한 호흡 운동이었습니다! 계속 이렇게 꾸준히 해보세요.',
        isPremium: false,
      };
    }
  }

  /**
   * 2차 피드백: 경고/개선 (Warning/Improvement)
   * 무료, 조건부 제공, 개선 방안 포함
   */
  static async generateWarningFeedback(data: BreathingData): Promise<FeedbackResponse | null> {
    // 개선이 필요한 경우 확인
    const warnings: string[] = [];

    if (data.accuracy < 60) warnings.push('accuracy_low');
    if (data.consistency < 60) warnings.push('consistency_low');
    if (data.completionPercentage < 80) warnings.push('completion_low');
    if (data.stressLevelBefore - data.stressLevelAfter < 2)
      warnings.push('stress_reduction_low');

    if (warnings.length === 0) return null; // 경고 필요 없음

    const prompt = `
사용자의 호흡 운동 개선 사항:
- 경고: ${warnings.join(', ')}
- 정확도: ${data.accuracy}%
- 일관성: ${data.consistency}%
- 완료율: ${data.completionPercentage}%

전문가적이고 지지적인 톤으로 개선 방안을 제시하세요. 2-3문장으로 구체적인 제안을 포함하세요.
`;

    try {
      const response = await api.post('/api/breathing/feedback/warning', {
        userId: data.userId,
        prompt,
        data,
        warnings,
      });

      return {
        stage: 'warning',
        text: response.data.data.text,
        missionSuggestion: response.data.data.missionSuggestion,
        isPremium: false,
      };
    } catch (error) {
      console.error('Failed to generate warning feedback:', error);
      return null;
    }
  }

  /**
   * 3차 피드백: 프리미엄 상담 (Premium Consultation)
   * 유료 ($9.99), 심화 분석, 맞춤형 계획
   */
  static async generatePremiumFeedback(data: BreathingData): Promise<FeedbackResponse> {
    const prompt = `
사용자의 호흡 운동 상세 분석:
- 호흡 패턴: ${data.breathingPattern}
- 정확도: ${data.accuracy}%
- 일관성: ${data.consistency}%
- 스트레스 감소: ${data.stressLevelBefore - data.stressLevelAfter}점
- 심박수 변화: ${data.heartRateChange} bpm

프리미엄 상담으로 다음을 포함하세요:
1. 주간 호흡 운동 트렌드 분석
2. 개인화된 호흡 코칭
3. 전문가 의견
4. 맞춤형 30일 계획

상세한 리포트 형식으로 제공하세요.
`;

    try {
      const response = await api.post('/api/breathing/feedback/premium', {
        userId: data.userId,
        prompt,
        data,
      });

      return {
        stage: 'premium',
        text: response.data.data.text,
        isPremium: true,
        price: 9.99,
      };
    } catch (error) {
      console.error('Failed to generate premium feedback:', error);
      return {
        stage: 'premium',
        text: '프리미엄 상담 서비스를 이용할 수 없습니다.',
        isPremium: true,
        price: 9.99,
      };
    }
  }

  /**
   * 사용자 호흡 통계 조회
   */
  static async getUserBreathingStats(userId: number): Promise<BreathingStats> {
    try {
      const response = await api.get(`/api/breathing/stats/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get breathing stats:', error);
      throw error;
    }
  }

  /**
   * 실시간 피드백 전체 플로우
   */
  static async generateCompleteFeedback(data: BreathingData): Promise<{
    encouragement: FeedbackResponse;
    warning: FeedbackResponse | null;
    premium: FeedbackResponse;
  }> {
    const encouragement = await this.generateEncouragementFeedback(data);
    const warning = await this.generateWarningFeedback(data);
    const premium = await this.generatePremiumFeedback(data);

    return {
      encouragement,
      warning,
      premium,
    };
  }

  /**
   * 호흡 정확도 계산
   */
  static calculateAccuracy(
    targetPattern: string,
    userPattern: string,
    tolerance: number = 10
  ): number {
    const target = targetPattern.split('-').map(Number);
    const user = userPattern.split('-').map(Number);

    if (target.length !== user.length) return 0;

    let accuracy = 0;
    target.forEach((t, i) => {
      const diff = Math.abs(t - user[i]);
      const match = Math.max(0, 100 - (diff / t) * 100 * tolerance);
      accuracy += match;
    });

    return Math.round(accuracy / target.length);
  }

  /**
   * 스트레스 감소 점수 계산
   */
  static calculateStressReduction(before: number, after: number): number {
    return Math.max(0, before - after);
  }

  /**
   * 연속 일수 계산
   */
  static async calculateStreak(userId: number): Promise<number> {
    try {
      const response = await api.get(`/api/breathing/streak/${userId}`);
      return response.data.data.streak;
    } catch (error) {
      console.error('Failed to calculate streak:', error);
      return 0;
    }
  }

  /**
   * 미션 제안 (경고 기반)
   */
  static suggestMission(warnings: string[]): string {
    const missionMap: Record<string, string> = {
      accuracy_low: '정확도 개선 미션 - 천천히 호흡하기',
      consistency_low: '일관성 개선 미션 - 리듬 맞추기',
      completion_low: '완료 미션 - 끝까지 따라하기',
      stress_reduction_low: '스트레스 감소 미션 - 깊은 호흡 명상',
    };

    return missionMap[warnings[0]] || '종합 호흡 개선 미션';
  }
}
