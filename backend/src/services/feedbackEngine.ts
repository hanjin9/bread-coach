import { z } from 'zod';

/**
 * AI 피드백 엔진 (3단계)
 * 외부 LLM 의존성 제거 — 규칙 기반 + 선택적 Anthropic API 연동
 */

export interface FeedbackInput {
  userId: string;
  healthData: {
    sleepHours: number;
    sleepQuality: number;
    heartRate: number;
    bloodPressure: string;
    bloodSugar: number;
    activityMinutes: number;
    mealScore: number;
  };
  language: string;
}

export interface FeedbackResponse {
  stage: 'encouragement' | 'warning' | 'premium';
  text: string;
  voiceUrl?: string;
  missionSuggestion?: string;
  isPremium: boolean;
  price?: number;
}

// ─── 1차: 격려 피드백 ─────────────────────────────────────────

export async function generateEncouragementFeedback(
  input: FeedbackInput
): Promise<FeedbackResponse> {
  const { healthData, language } = input;

  // 선택적 Anthropic API 연동 (환경변수 있을 때만)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          system: `You are a warm health coach. Give 1-2 sentence encouraging feedback in ${language} language.`,
          messages: [{
            role: 'user',
            content: `Sleep: ${healthData.sleepHours}h (quality ${healthData.sleepQuality}/10), HR: ${healthData.heartRate}bpm, Activity: ${healthData.activityMinutes}min, Nutrition: ${healthData.mealScore}/10. Encourage the user.`
          }]
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        return {
          stage: 'encouragement',
          text: data.content?.[0]?.text || buildRuleBasedEncouragement(healthData),
          isPremium: false,
        };
      }
    } catch (e) {
      console.warn('Anthropic API unavailable, using rule-based feedback');
    }
  }

  return {
    stage: 'encouragement',
    text: buildRuleBasedEncouragement(healthData),
    isPremium: false,
  };
}

// ─── 2차: 경고 피드백 ─────────────────────────────────────────

export async function generateWarningFeedback(
  input: FeedbackInput
): Promise<FeedbackResponse | null> {
  const warnings = checkHealthThresholds(input.healthData);
  if (warnings.length === 0) return null;

  const missionSuggestion = suggestMissionFromWarnings(warnings);

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: `You are a health advisor. Give 2-3 sentence supportive warning with improvement tip in ${input.language} language.`,
          messages: [{
            role: 'user',
            content: `Concerns: ${warnings.join(', ')}. Sleep: ${input.healthData.sleepHours}h, Activity: ${input.healthData.activityMinutes}min. Give actionable advice.`
          }]
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        return {
          stage: 'warning',
          text: data.content?.[0]?.text || buildRuleBasedWarning(warnings),
          missionSuggestion,
          isPremium: false,
        };
      }
    } catch {}
  }

  return {
    stage: 'warning',
    text: buildRuleBasedWarning(warnings),
    missionSuggestion,
    isPremium: false,
  };
}

// ─── 3차: 프리미엄 피드백 ────────────────────────────────────

export async function generatePremiumFeedback(
  input: FeedbackInput
): Promise<FeedbackResponse> {
  const { healthData, language } = input;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: `You are a premium health consultant. Provide a detailed analysis report with weekly trends, personalized coaching, and 30-day plan in ${language} language.`,
          messages: [{
            role: 'user',
            content: `Full health data: Sleep ${healthData.sleepHours}h (quality ${healthData.sleepQuality}/10), HR ${healthData.heartRate}bpm, BP ${healthData.bloodPressure}, Sugar ${healthData.bloodSugar}mg/dL, Activity ${healthData.activityMinutes}min, Nutrition ${healthData.mealScore}/10.`
          }]
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        return {
          stage: 'premium',
          text: data.content?.[0]?.text || buildRuleBasedPremium(healthData),
          isPremium: true,
          price: 9.99,
        };
      }
    } catch {}
  }

  return {
    stage: 'premium',
    text: buildRuleBasedPremium(healthData),
    isPremium: true,
    price: 9.99,
  };
}

// ─── 전체 피드백 플로우 ───────────────────────────────────────

export async function generateCompleteFeedback(input: FeedbackInput) {
  const [encouragement, warning, premium] = await Promise.all([
    generateEncouragementFeedback(input),
    generateWarningFeedback(input),
    generatePremiumFeedback(input),
  ]);
  return { encouragement, warning, premium };
}

// ─── 규칙 기반 헬퍼 ──────────────────────────────────────────

function checkHealthThresholds(h: FeedbackInput['healthData']): string[] {
  const w: string[] = [];
  if (h.sleepHours < 6) w.push('sleep_insufficient');
  if (h.sleepQuality < 5) w.push('sleep_quality_poor');
  if (h.heartRate < 60 || h.heartRate > 100) w.push('heart_rate_abnormal');
  if (h.activityMinutes < 30) w.push('activity_insufficient');
  if (h.mealScore < 5) w.push('nutrition_poor');
  if (h.bloodSugar > 125) w.push('blood_sugar_high');
  return w;
}

function suggestMissionFromWarnings(warnings: string[]): string {
  const map: Record<string, string> = {
    sleep_insufficient: '3분 숙면 호흡법 — 4-7-8 패턴으로 수면 유도',
    sleep_quality_poor: '5분 수면 개선 명상 — 편안한 자세 교정',
    heart_rate_abnormal: '10분 심박 안정화 — 부드러운 복식 호흡',
    activity_insufficient: '15분 활동량 증진 — 가벼운 산책 + 스트레칭',
    nutrition_poor: '영양 개선 가이드 — 건강한 식습관 교육',
    blood_sugar_high: '혈당 관리 호흡법 — 4-4-4-4 박스 브리딩',
  };
  return map[warnings[0]] || '종합 건강 개선 미션 — 오늘의 호흡 루틴';
}

function buildRuleBasedEncouragement(h: FeedbackInput['healthData']): string {
  if (h.sleepHours >= 7 && h.activityMinutes >= 30) {
    return `수면 ${h.sleepHours}시간에 활동 ${h.activityMinutes}분까지! 오늘 하루 건강 루틴을 완벽하게 지키셨어요. 계속 이 흐름을 유지해 보세요!`;
  }
  if (h.mealScore >= 7) {
    return `오늘 식사 점수가 ${h.mealScore}/10! 균형 잡힌 식단은 호흡 운동 효과를 2배로 높여줍니다. 훌륭해요!`;
  }
  return '오늘도 건강을 위한 작은 한 걸음을 내딛으셨어요. 꾸준함이 가장 큰 힘입니다!';
}

function buildRuleBasedWarning(warnings: string[]): string {
  const messages: Record<string, string> = {
    sleep_insufficient: '수면 시간이 부족합니다. 취침 30분 전 4-7-8 호흡을 3회 반복해 보세요. 숙면에 큰 도움이 됩니다.',
    heart_rate_abnormal: '심박수가 정상 범위를 벗어났습니다. 과도한 카페인을 줄이고 복식 호흡으로 심박을 안정시켜 보세요.',
    activity_insufficient: '오늘 활동량이 적었습니다. 10분 짧은 산책이 심폐 기능 향상에 효과적이에요. 지금 바로 시작해 보세요!',
    blood_sugar_high: '혈당 수치가 높습니다. 식후 10분 걷기와 규칙적인 식사 패턴이 혈당 안정에 도움됩니다.',
  };
  return messages[warnings[0]] || '건강 지표 일부가 개선이 필요합니다. 호흡 운동을 꾸준히 실천해 보세요.';
}

function buildRuleBasedPremium(h: FeedbackInput['healthData']): string {
  const score = Math.round((h.sleepQuality + h.mealScore) / 2 * 10);
  return `[프리미엄 건강 분석 리포트]

종합 건강 점수: ${score}/100

📊 현재 상태 분석
• 수면: ${h.sleepHours}시간 (품질 ${h.sleepQuality}/10) — ${h.sleepHours >= 7 ? '양호' : '개선 필요'}
• 심박수: ${h.heartRate}bpm — ${h.heartRate >= 60 && h.heartRate <= 100 ? '정상' : '주의'}
• 활동량: ${h.activityMinutes}분 — ${h.activityMinutes >= 30 ? '목표 달성' : '부족'}
• 영양: ${h.mealScore}/10 — ${h.mealScore >= 7 ? '우수' : '개선 권장'}

🗓️ 30일 맞춤 플랜
Week 1-2: 매일 아침 5분 4-7-8 호흡으로 하루 시작
Week 3-4: 저녁 취침 전 10분 명상 호흡 추가
목표: 스트레스 지수 30% 감소, 수면 질 20% 향상`;
}

export type FeedbackEngine = typeof generateCompleteFeedback;
