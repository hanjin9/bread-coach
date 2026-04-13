import { invokeLLM } from "./_core/llm";
import { generateVoiceFeedback } from "./globalVoiceEngineExtended";
import { z } from "zod";

/**
 * Phase 59: AI 피드백 엔진 (3단계 Multi-Agent)
 * 
 * 3단계 피드백 시스템:
 * 1차: 격려 피드백 (무료, 즉시)
 * 2차: 경고/심화 피드백 (무료, 조건부)
 * 3차: 유료 전문 컨설팅 ($9.99)
 */

export interface FeedbackInput {
  userId: string;
  healthData: {
    sleepHours: number;
    sleepQuality: number; // 1-10
    heartRate: number;
    bloodPressure: string; // "120/80"
    bloodSugar: number;
    activityMinutes: number;
    mealScore: number; // 1-10
  };
  language: string; // "en", "ko", "ja", "zh", "es"
}

export interface FeedbackResponse {
  stage: "encouragement" | "warning" | "premium";
  text: string;
  voiceUrl?: string;
  missionSuggestion?: string;
  isPremium: boolean;
  price?: number;
}

/**
 * 1차 피드백: 격려 (Encouragement)
 * 무료, 즉시 제공, 긍정적 톤
 */
export async function generateEncouragementFeedback(
  input: FeedbackInput
): Promise<FeedbackResponse> {
  const prompt = buildEncouragementPrompt(input);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a warm and encouraging health coach. Provide positive feedback based on the user's health data. 
        Keep the message concise (1-2 sentences), uplifting, and specific to their metrics.
        Respond in ${input.language} language.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const feedbackText = typeof content === "string" ? content : "Great job today!";

  // Generate voice feedback (placeholder - will be implemented in Phase 62)
  const voiceUrl = undefined; // await generateVoiceFeedback(...)

  return {
    stage: "encouragement",
    text: feedbackText,
    voiceUrl,
    isPremium: false,
  };
}

/**
 * 2차 피드백: 경고/심화 (Warning/Deep Analysis)
 * 무료, 조건부 제공, 개선 방안 포함
 */
export async function generateWarningFeedback(
  input: FeedbackInput
): Promise<FeedbackResponse | null> {
  // Check if any metric is below threshold
  const warnings = checkHealthThresholds(input.healthData);

  if (warnings.length === 0) {
    return null; // No warning needed
  }

  const prompt = buildWarningPrompt(input, warnings);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional health advisor. Provide a warning and actionable improvement suggestions.
        Be direct but supportive. Include a specific recommendation.
        Keep the message concise (2-3 sentences).
        Respond in ${input.language} language.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const feedbackText = typeof content === "string" ? content : "Please improve your health habits.";

  // Generate voice feedback with authoritative tone (placeholder)
  const voiceUrl = undefined; // await generateVoiceFeedback(...)

  // Suggest a mission based on warnings
  const missionSuggestion = suggestMissionFromWarnings(warnings);

  return {
    stage: "warning",
    text: feedbackText,
    voiceUrl,
    missionSuggestion,
    isPremium: false,
  };
}

/**
 * 3차 피드백: 유료 전문 컨설팅 (Premium Consultation)
 * 유료 ($9.99), 심화 분석, PDF 리포트
 */
export async function generatePremiumFeedback(
  input: FeedbackInput
): Promise<FeedbackResponse> {
  const prompt = buildPremiumPrompt(input);

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a premium health consultant with expertise in personalized wellness coaching.
        Provide a comprehensive analysis including:
        1. Weekly trend analysis
        2. Personalized health coaching
        3. Expert medical advisor opinion
        4. Customized 30-day plan
        
        Format the response as a detailed report.
        Respond in ${input.language} language.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const reportText = typeof content === "string" ? content : "Premium report generation failed.";

  // Generate voice guide for premium report (placeholder)
  const voiceUrl = undefined; // await generateVoiceFeedback(...)

  return {
    stage: "premium",
    text: reportText,
    voiceUrl,
    isPremium: true,
    price: 9.99,
  };
}

/**
 * 헬스 임계값 확인
 */
function checkHealthThresholds(
  healthData: FeedbackInput["healthData"]
): string[] {
  const warnings: string[] = [];

  if (healthData.sleepHours < 6) {
    warnings.push("sleep_insufficient");
  }
  if (healthData.sleepQuality < 5) {
    warnings.push("sleep_quality_poor");
  }
  if (healthData.heartRate < 60 || healthData.heartRate > 100) {
    warnings.push("heart_rate_abnormal");
  }
  if (healthData.activityMinutes < 30) {
    warnings.push("activity_insufficient");
  }
  if (healthData.mealScore < 5) {
    warnings.push("nutrition_poor");
  }
  if (healthData.bloodSugar > 125) {
    warnings.push("blood_sugar_high");
  }

  return warnings;
}

/**
 * 격려 피드백 프롬프트 생성
 */
function buildEncouragementPrompt(input: FeedbackInput): string {
  const { healthData } = input;

  return `
User's health data today:
- Sleep: ${healthData.sleepHours} hours (quality: ${healthData.sleepQuality}/10)
- Heart Rate: ${healthData.heartRate} bpm
- Blood Pressure: ${healthData.bloodPressure}
- Blood Sugar: ${healthData.bloodSugar} mg/dL
- Activity: ${healthData.activityMinutes} minutes
- Nutrition Score: ${healthData.mealScore}/10

Provide warm, encouraging feedback highlighting their positive metrics.
`;
}

/**
 * 경고 피드백 프롬프트 생성
 */
function buildWarningPrompt(
  input: FeedbackInput,
  warnings: string[]
): string {
  const { healthData } = input;

  return `
User's health data shows these concerns: ${warnings.join(", ")}

Details:
- Sleep: ${healthData.sleepHours} hours (quality: ${healthData.sleepQuality}/10)
- Heart Rate: ${healthData.heartRate} bpm
- Activity: ${healthData.activityMinutes} minutes
- Nutrition Score: ${healthData.mealScore}/10

Provide a supportive warning with specific improvement suggestions.
`;
}

/**
 * 프리미엄 피드백 프롬프트 생성
 */
function buildPremiumPrompt(input: FeedbackInput): string {
  const { healthData } = input;

  return `
Comprehensive health analysis for user:
- Sleep: ${healthData.sleepHours} hours (quality: ${healthData.sleepQuality}/10)
- Heart Rate: ${healthData.heartRate} bpm
- Blood Pressure: ${healthData.bloodPressure}
- Blood Sugar: ${healthData.bloodSugar} mg/dL
- Activity: ${healthData.activityMinutes} minutes
- Nutrition Score: ${healthData.mealScore}/10

Generate a detailed premium report with weekly trends, personalized coaching, expert opinion, and a 30-day plan.
`;
}

/**
 * 경고에 기반한 미션 제안
 */
function suggestMissionFromWarnings(warnings: string[]): string {
  const missionMap: Record<string, string> = {
    sleep_insufficient: "3분 숙면 호흡법 - 깊은 수면을 위한 명상",
    sleep_quality_poor: "5분 수면 개선 요가 - 편안한 자세 교정",
    heart_rate_abnormal: "10분 심박 안정화 운동 - 부드러운 스트레칭",
    activity_insufficient: "15분 활동량 증진 - 가벼운 산책 또는 스트레칭",
    nutrition_poor: "영양 개선 가이드 - 건강한 식습관 교육",
    blood_sugar_high: "혈당 관리 호흡법 - 인슐린 민감도 개선",
  };

  return missionMap[warnings[0]] || "종합 건강 개선 미션";
}

/**
 * 전체 피드백 플로우 (자동 3단계)
 */
export async function generateCompleteFeedback(
  input: FeedbackInput
): Promise<{
  encouragement: FeedbackResponse;
  warning: FeedbackResponse | null;
  premium: FeedbackResponse;
}> {
  const encouragement = await generateEncouragementFeedback(input);
  const warning = await generateWarningFeedback(input);
  const premium = await generatePremiumFeedback(input);

  return {
    encouragement,
    warning,
    premium,
  };
}

export type FeedbackEngine = typeof generateCompleteFeedback;
