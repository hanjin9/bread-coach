/**
 * Bread Coach - Constants
 * 전체 상수 정의
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.breadcoach.app',
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  TOSS_CLIENT_KEY: process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY,
  KAKAO_APP_KEY: process.env.EXPO_PUBLIC_KAKAO_APP_KEY,
};

// OAuth Configuration
export const OAUTH_CONFIG = {
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
};

// AWS S3 Configuration
export const AWS_CONFIG = {
  REGION: process.env.EXPO_PUBLIC_AWS_REGION || 'ap-northeast-2',
  S3_BUCKET: process.env.EXPO_PUBLIC_AWS_S3_BUCKET || 'bread-coach-assets',
};

// Breathing Patterns (호흡 패턴)
export const BREATHING_PATTERNS = {
  BOX_BREATHING: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 },
  FOUR_SEVEN_EIGHT: { inhale: 4, hold: 7, exhale: 8 },
  FIVE_FIVE_FIVE: { inhale: 5, hold: 5, exhale: 5 },
  EXTENDED_EXHALE: { inhale: 4, hold: 0, exhale: 8 },
  COHERENT_BREATHING: { inhale: 5, hold: 0, exhale: 5 },
  ALTERNATE_NOSTRIL: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 },
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'KRW',
    features: ['기본 호흡 가이드', '1일 1회 영상'],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 9900,
    currency: 'KRW',
    billingPeriod: 'monthly',
    features: ['모든 호흡 패턴', '1일 5회 영상', '광고 없음', '커스텀 알림'],
  },
  VIP: {
    id: 'vip',
    name: 'VIP',
    price: 29900,
    currency: 'KRW',
    billingPeriod: 'monthly',
    features: ['모든 프리미엄 기능', '무제한 영상', '우선 지원', '커뮤니티 액세스'],
  },
};

// Days of Week
export const DAYS_OF_WEEK = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

// Languages
export const LANGUAGES = {
  KO: 'ko',
  EN: 'en',
  JA: 'ja',
  ZH: 'zh',
};

// Font Sizes
export const FONT_SIZES = {
  SMALL: 'small',
  NORMAL: 'normal',
  LARGE: 'large',
  EXTRA_LARGE: 'extra-large',
};

// Authentication Providers
export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  PHONE: 'phone',
  EMAIL: 'email',
  KAKAO: 'kakao',
  NAVER: 'naver',
  APPLE: 'apple',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  INVALID_EMAIL: '유효한 이메일 주소를 입력해주세요.',
  INVALID_PHONE: '유효한 휴대폰 번호를 입력해주세요.',
  PASSWORD_TOO_SHORT: '비밀번호는 최소 8자 이상이어야 합니다.',
  PASSWORDS_NOT_MATCH: '비밀번호가 일치하지 않습니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 잘못되었습니다.',
  USER_ALREADY_EXISTS: '이미 존재하는 사용자입니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '로그인 성공했습니다.',
  SIGNUP_SUCCESS: '회원가입 성공했습니다.',
  LOGOUT_SUCCESS: '로그아웃 되었습니다.',
  PASSWORD_RESET_SUCCESS: '비밀번호가 재설정되었습니다.',
  PROFILE_UPDATED: '프로필이 업데이트되었습니다.',
  PAYMENT_SUCCESS: '결제가 완료되었습니다.',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^01[0-9]-?\d{3,4}-?\d{4}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Cache Duration (milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_PHONE: '/auth/verify-phone',

  // User
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  DELETE_ACCOUNT: '/users/account',

  // Breathing Videos
  GET_VIDEOS: '/videos',
  GET_VIDEO: '/videos/:id',
  CREATE_VIDEO: '/videos',
  DELETE_VIDEO: '/videos/:id',

  // Schedules
  GET_SCHEDULES: '/schedules',
  CREATE_SCHEDULE: '/schedules',
  UPDATE_SCHEDULE: '/schedules/:id',
  DELETE_SCHEDULE: '/schedules/:id',

  // Assets
  GET_ASSETS: '/assets',
  UPLOAD_ASSET: '/assets/upload',
  DELETE_ASSET: '/assets/:id',

  // Payments
  GET_PLANS: '/payments/plans',
  CREATE_PAYMENT: '/payments',
  GET_PAYMENT_STATUS: '/payments/:id',
  CANCEL_SUBSCRIPTION: '/payments/subscriptions/:id/cancel',

  // Admin
  GET_DASHBOARD: '/admin/dashboard',
  CREATE_TEMPLATE: '/admin/templates',
  UPDATE_TEMPLATE: '/admin/templates/:id',
  DELETE_TEMPLATE: '/admin/templates/:id',
  GENERATE_VIDEO: '/admin/generate-video',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SETTINGS: 'settings',
  FAVORITES: 'favorites',
  HISTORY: 'history',
  CACHE: 'cache',
};

export default {
  API_CONFIG,
  FIREBASE_CONFIG,
  PAYMENT_CONFIG,
  OAUTH_CONFIG,
  AWS_CONFIG,
  BREATHING_PATTERNS,
  SUBSCRIPTION_PLANS,
  DAYS_OF_WEEK,
  LANGUAGES,
  FONT_SIZES,
  AUTH_PROVIDERS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  CACHE_DURATION,
  API_ENDPOINTS,
  STORAGE_KEYS,
};
