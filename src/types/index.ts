/**
 * Bread Coach - Type Definitions
 * 전체 타입 정의
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  profileImageUrl?: string;
  authProvider: 'google' | 'phone' | 'email' | 'kakao' | 'naver' | 'apple';
  subscriptionStatus: 'free' | 'premium' | 'vip';
  subscriptionExpiresAt?: Date;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
  authProvider?: string;
  authProviderToken?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface SignupRequest {
  email?: string;
  phone?: string;
  password?: string;
  name: string;
  authProvider: string;
  authProviderToken: string;
}

// ============================================================================
// BREATHING TYPES
// ============================================================================

export interface BreathingPattern {
  inhale: number;          // 들숨 (초)
  hold: number;            // 정지 (초)
  exhale: number;          // 날숨 (초)
  holdAfterExhale?: number; // 날숨 후 정지 (초)
}

export interface PipelineConfig {
  color: string;           // Hex color
  width: number;           // 픽셀
  curveType: 'bezier' | 'smooth' | 'linear';
  startX: number;          // 시작 X 좌표
  endX: number;            // 끝 X 좌표
  startY: number;          // 시작 Y 좌표
  endY: number;            // 끝 Y 좌표
}

export interface OrbConfig {
  color: string;           // Hex color
  size: number;            // 픽셀
  texture: 'glossy' | 'matte' | 'gold' | 'pearl';
  opacity: number;         // 0-1
}

export interface BreathingTemplate {
  id: string;
  name: string;
  description: string;
  breathingPattern: BreathingPattern;
  backgroundImageId?: string;
  backgroundVideoId?: string;
  effectSoundId?: string;
  pipelineConfig: PipelineConfig;
  orbConfig: OrbConfig;
  createdBy: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreathingVideo {
  id: string;
  templateId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;        // 초
  fileSize: number;        // 바이트
  quality: '720p' | '1080p' | '4k';
  status: 'pending' | 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}

// ============================================================================
// SCHEDULE TYPES
// ============================================================================

export interface Schedule {
  id: string;
  userId: string;
  videoId: string;
  scheduledTime: string;   // HH:mm 형식
  scheduledDays: string[]; // ['MON', 'WED', 'FRI']
  isActive: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleNotification {
  id: string;
  scheduleId: string;
  userId: string;
  videoId: string;
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  failureReason?: string;
}

// ============================================================================
// ASSET TYPES
// ============================================================================

export interface Asset {
  id: string;
  type: 'background_image' | 'background_video' | 'effect_sound';
  name: string;
  description: string;
  fileUrl: string;
  fileSize: number;        // 바이트
  mimeType: string;
  duration?: number;       // 비디오/오디오만 해당
  uploadedBy: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface AssetUploadRequest {
  type: 'background_image' | 'background_video' | 'effect_sound';
  name: string;
  description: string;
  file: File;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'annual';
  features: string[];
  isActive: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'toss' | 'kakao_pay' | 'bank_transfer' | 'phone';
  paymentGatewayId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRequest {
  subscriptionPlanId: string;
  paymentMethod: string;
  returnUrl?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: string;
  redirectUrl?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  NotFound: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  PhoneVerification: { phone: string };
};

export type AppStackParamList = {
  Home: undefined;
  MyPage: undefined;
  Settings: undefined;
  BreathingVideo: { videoId: string };
  AdminDashboard: undefined;
  CreateTemplate: undefined;
  ManageAssets: undefined;
};

// ============================================================================
// STORE TYPES
// ============================================================================

export interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export interface SettingsStore {
  language: 'ko' | 'en' | 'ja' | 'zh';
  fontSize: 'small' | 'normal' | 'large' | 'extra-large';
  notificationsEnabled: boolean;
  darkMode: boolean;
  setLanguage: (lang: 'ko' | 'en' | 'ja' | 'zh') => void;
  setFontSize: (size: 'small' | 'normal' | 'large' | 'extra-large') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
