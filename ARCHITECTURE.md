# Bread Coach - 아키텍처 & 기술 설계

## 📐 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    BREAD COACH APP                          │
│                   (React Native + Expo)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   로그인      │  │  호흡 영상    │  │  관리자      │     │
│  │   화면       │  │  재생 화면    │  │  대시보드    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  마이 페이지  │  │  스케줄       │  │  설정        │     │
│  │              │  │  관리         │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  상태 관리 (Zustand) | 데이터 페칭 (TanStack Query)        │
├─────────────────────────────────────────────────────────────┤
│  로컬 스토리지 (AsyncStorage)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │           REST API / GraphQL                       │   │
│  │  (로그인, 호흡 영상, 스케줄, 결제, 관리자)        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  MySQL DB   │  │  S3 Storage │  │  Firebase   │        │
│  │  (메타데이터) │  │  (영상/음향) │  │  (알림)     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 폴더 구조

```
bread-coach/
├── app/                          # Expo 앱 설정
│   ├── app.json                 # 앱 메타데이터
│   ├── eas.json                 # EAS 빌드 설정
│   └── app/                      # 앱 라우트
│       ├── (auth)/              # 인증 관련 화면
│       │   ├── login.tsx
│       │   ├── signup.tsx
│       │   └── forgot-password.tsx
│       ├── (app)/               # 메인 앱 화면
│       │   ├── home.tsx
│       │   ├── my-page.tsx
│       │   ├── settings.tsx
│       │   └── breathing-video.tsx
│       └── admin/               # 관리자 대시보드
│           ├── dashboard.tsx
│           ├── create-template.tsx
│           └── manage-assets.tsx
│
├── src/
│   ├── components/              # 재사용 가능한 컴포넌트
│   │   ├── BreathingAnimation.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── ScheduleSelector.tsx
│   │   └── PipelineEditor.tsx
│   │
│   ├── hooks/                   # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useBreathingVideos.ts
│   │   ├── useSchedule.ts
│   │   └── usePushNotification.ts
│   │
│   ├── services/                # API 서비스
│   │   ├── authService.ts
│   │   ├── videoService.ts
│   │   ├── scheduleService.ts
│   │   ├── paymentService.ts
│   │   └── adminService.ts
│   │
│   ├── store/                   # 상태 관리 (Zustand)
│   │   ├── authStore.ts
│   │   ├── videoStore.ts
│   │   ├── scheduleStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── utils/                   # 유틸리티 함수
│   │   ├── colors.ts            # 색상 팔레트
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── types/                   # TypeScript 타입
│   │   ├── auth.ts
│   │   ├── breathing.ts
│   │   ├── schedule.ts
│   │   └── payment.ts
│   │
│   └── styles/                  # 전역 스타일
│       ├── theme.ts
│       └── spacing.ts
│
├── backend/                     # 백엔드 서버 (Node.js + Express)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── videos.ts
│   │   │   ├── schedules.ts
│   │   │   ├── payments.ts
│   │   │   └── admin.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── videoController.ts
│   │   │   ├── scheduleController.ts
│   │   │   ├── paymentController.ts
│   │   │   └── adminController.ts
│   │   │
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── videoGenerationService.ts
│   │   │   ├── scheduleService.ts
│   │   │   ├── paymentService.ts
│   │   │   └── notificationService.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── BreathingTemplate.ts
│   │   │   ├── BreathingVideo.ts
│   │   │   ├── Schedule.ts
│   │   │   ├── Asset.ts
│   │   │   └── Payment.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimiter.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── videoGenerator.ts  # FFmpeg 기반 영상 생성
│   │   │   ├── s3Upload.ts
│   │   │   ├── emailSender.ts
│   │   │   └── logger.ts
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── firebase.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── package.json
│   └── .env.example
│
├── docs/                        # 문서
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🗄️ 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(100),
  profile_image_url VARCHAR(500),
  auth_provider ENUM('google', 'phone', 'email', 'kakao', 'naver'),
  auth_provider_id VARCHAR(255),
  subscription_status ENUM('free', 'premium', 'vip'),
  subscription_expires_at DATETIME,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Breathing Templates 테이블
```sql
CREATE TABLE breathing_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  description TEXT,
  breathing_pattern VARCHAR(50),  -- e.g., "4-7-8", "4-4-4-4"
  inhale_duration INT,            -- 초 단위
  hold_duration INT,
  exhale_duration INT,
  hold_after_exhale INT,
  background_image_id INT,
  background_video_id INT,
  effect_sound_id INT,
  pipeline_color VARCHAR(7),      -- Hex color
  pipeline_width INT,             -- 픽셀
  pipeline_curve_type VARCHAR(50), -- 'bezier', 'smooth', 'linear'
  orb_color VARCHAR(7),
  orb_size INT,
  orb_texture VARCHAR(50),        -- 'glossy', 'matte', 'gold'
  created_by INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Breathing Videos 테이블
```sql
CREATE TABLE breathing_videos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_id INT,
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  duration INT,                   -- 초 단위
  file_size INT,                  -- 바이트
  quality VARCHAR(20),            -- '720p', '1080p', '4k'
  status ENUM('pending', 'generating', 'completed', 'failed'),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES breathing_templates(id)
);
```

### User Schedules 테이블
```sql
CREATE TABLE user_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  video_id INT,
  scheduled_time TIME,
  scheduled_days VARCHAR(50),     -- 'MON,WED,FRI' 형식
  is_active BOOLEAN DEFAULT TRUE,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES breathing_videos(id)
);
```

### Assets 테이블
```sql
CREATE TABLE assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('background_image', 'background_video', 'effect_sound'),
  name VARCHAR(100),
  description TEXT,
  file_url VARCHAR(500),
  file_size INT,
  mime_type VARCHAR(50),
  duration INT,                   -- 비디오/오디오만 해당
  uploaded_by INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

### Payments 테이블
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  subscription_type VARCHAR(50),  -- 'premium', 'vip'
  amount DECIMAL(10, 2),
  currency VARCHAR(3),            -- 'KRW', 'USD', etc.
  payment_method VARCHAR(50),     -- 'stripe', 'toss', 'kakao_pay', etc.
  payment_gateway_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔐 인증 & 보안

### 로그인 플로우
1. **Google OAuth** → Firebase Authentication
2. **휴대폰 로그인** → SMS 인증 코드
3. **이메일/비밀번호** → JWT 토큰
4. **결제 시점** → KYC (본인 확인)

### 토큰 관리
- **Access Token**: 15분 유효
- **Refresh Token**: 30일 유효
- **로컬 스토리지**: AsyncStorage에 안전하게 저장

### API 보안
- HTTPS 필수
- CORS 설정
- Rate Limiting (분당 100 요청)
- Input Validation & Sanitization

---

## 🎨 디자인 시스템

### 색상 팔레트
```typescript
const colors = {
  primary: '#1a1a1a',           // 럭셔리 블랙
  secondary: '#d4af37',          // 골드
  accent: '#f0f0f0',             // 라이트 그레이
  background: '#0f0f0f',         // 깊은 블랙
  surface: '#1a1a1a',            // 서피스 블랙
  marble: '#2a2a2a',             // 대리석 그레이
  error: '#ff6b6b',
  success: '#51cf66',
  warning: '#ffd43b'
};
```

### 타이포그래피
- **Heading 1**: 32px, Bold, 골드
- **Heading 2**: 24px, Bold, 화이트
- **Body**: 16px, Regular, 라이트 그레이
- **Caption**: 12px, Regular, 다크 그레이

### 간격 (Spacing)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

---

## 🎬 호흡 애니메이션 엔진

### 파이프라인 생성 로직
```typescript
interface PipelineConfig {
  breathingPattern: string;      // "4-7-8"
  startX: number;                // 화면 좌측 끝
  endX: number;                  // 화면 우측 끝
  color: string;                 // Hex color
  width: number;                 // 픽셀
  curveType: 'bezier' | 'smooth' | 'linear';
}

// Bezier 곡선으로 부드러운 파이프라인 생성
const generatePipeline = (config: PipelineConfig) => {
  // 1. 호흡 주기에 따라 Y 좌표 계산
  // 2. Bezier 곡선으로 부드럽게 연결
  // 3. Canvas에 렌더링
};
```

### 구슬 애니메이션 로직
```typescript
interface OrbConfig {
  size: number;
  color: string;
  texture: 'glossy' | 'matte' | 'gold';
  speed: number;                 // 호흡 주기에 따라 가변
}

// 구슬이 파이프라인을 따라 미끄러지는 애니메이션
const animateOrb = (config: OrbConfig) => {
  // 1. 호흡 주기에 따라 속도 계산
  // 2. 파이프라인 경로를 따라 이동
  // 3. 질감 효과 적용 (그라데이션, 광택)
};
```

---

## 📱 모바일 최적화

### 화면 크기 대응
- iPhone: 375px ~ 430px
- Android: 360px ~ 540px
- Tablet: 768px 이상

### 성능 최적화
- 이미지 압축 (WebP 형식)
- 비디오 스트리밍 (HLS)
- 번들 크기 최소화 (<50MB)
- 메모리 누수 방지

### 배터리 & 데이터 절약
- 백그라운드 작업 최소화
- 푸시 알림 최적화
- 로컬 캐싱 활용

---

## 🚀 배포 전략

### 개발 환경
```
Expo Go (로컬 테스트)
↓
EAS Build (베타 빌드)
↓
TestFlight / Google Play Internal Testing (베타 테스트)
↓
App Store / Play Store (프로덕션 배포)
```

### CI/CD 파이프라인
- GitHub Actions 자동 빌드
- 자동 테스트 실행
- 자동 배포 (선택적)

---

## 📊 모니터링 & 분석

### 에러 추적
- Sentry (에러 로깅)
- Firebase Crashlytics

### 사용자 분석
- Firebase Analytics
- Amplitude (선택사항)

### 성능 모니터링
- Lighthouse
- Firebase Performance Monitoring

---

## 🔄 결제 시스템 통합 (최종 단계)

### 결제 게이트웨이
1. GLWA 결제 시스템 (기준)
2. Stripe (글로벌 200개국)
3. Toss Payments (한국)
4. 카카오페이, 뱅크 (한국)

### 구독 관리
- 월간 / 연간 구독
- 자동 갱신
- 취소 & 환불 처리

---

## 📝 개발 순서

1. **뼈대 구축** (1주)
2. **로그인 & 인증** (1주)
3. **호흡 애니메이션** (1주)
4. **비디오 재생 & 스케줄** (1주)
5. **관리자 대시보드** (1주)
6. **디자인 럭셔리화** (1주)
7. **콘텐츠 제작** (1주)
8. **결제 시스템 통합** (1주)
9. **테스트 & 최적화** (1주)
10. **배포** (1주)

**총 소요 기간: 10주 (약 2.5개월)**

---

## 🛠️ 기술 스택 최종 확정

| 계층 | 기술 |
| :--- | :--- |
| **모바일 앱** | React Native + Expo |
| **상태 관리** | Zustand + TanStack Query |
| **네비게이션** | React Navigation |
| **백엔드** | Node.js + Express |
| **데이터베이스** | MySQL / TiDB |
| **인증** | Firebase Auth + JWT |
| **스토리지** | AWS S3 |
| **알림** | Firebase Cloud Messaging |
| **결제** | Stripe / Toss (비교 후 선택) |
| **배포** | EAS Build + App Store / Play Store |

