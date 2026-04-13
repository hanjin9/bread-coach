-- ============================================================================
-- Bread Coach Database Schema
-- ============================================================================

-- 사용자 테이블
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  profile_image_url VARCHAR(500),
  auth_provider ENUM('google', 'phone', 'email', 'kakao', 'naver', 'apple') NOT NULL,
  subscription_status ENUM('free', 'premium', 'vip') DEFAULT 'free',
  subscription_expires_at DATETIME,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_signed_in DATETIME,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_auth_provider (auth_provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 호흡 패턴 템플릿 테이블
CREATE TABLE breathing_templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  inhale_seconds INT NOT NULL,
  hold_seconds INT NOT NULL,
  exhale_seconds INT NOT NULL,
  hold_after_exhale_seconds INT,
  pipeline_color VARCHAR(7) DEFAULT '#d4af37',
  pipeline_width INT DEFAULT 8,
  pipeline_curve_type ENUM('bezier', 'smooth', 'linear') DEFAULT 'bezier',
  orb_color VARCHAR(7) DEFAULT '#d4af37',
  orb_size INT DEFAULT 40,
  orb_texture ENUM('glossy', 'matte', 'gold', 'pearl') DEFAULT 'glossy',
  background_image_id VARCHAR(36),
  background_video_id VARCHAR(36),
  effect_sound_id VARCHAR(36),
  created_by INT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_created_by (created_by),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 호흡 영상 테이블
CREATE TABLE breathing_videos (
  id VARCHAR(36) PRIMARY KEY,
  template_id VARCHAR(36) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration_seconds INT NOT NULL,
  file_size_bytes BIGINT,
  quality ENUM('720p', '1080p', '4k') DEFAULT '1080p',
  status ENUM('pending', 'generating', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES breathing_templates(id),
  INDEX idx_template_id (template_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 에셋 테이블 (배경, 효과음)
CREATE TABLE assets (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('background_image', 'background_video', 'effect_sound') NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_size_bytes BIGINT,
  mime_type VARCHAR(50),
  duration_seconds INT,
  uploaded_by INT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 스케줄 테이블
CREATE TABLE schedules (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  video_id VARCHAR(36) NOT NULL,
  scheduled_time TIME NOT NULL,
  scheduled_days JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES breathing_videos(id),
  INDEX idx_user_id (user_id),
  INDEX idx_video_id (video_id),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 스케줄 알림 테이블
CREATE TABLE schedule_notifications (
  id VARCHAR(36) PRIMARY KEY,
  schedule_id VARCHAR(36) NOT NULL,
  user_id INT NOT NULL,
  video_id VARCHAR(36) NOT NULL,
  scheduled_time DATETIME NOT NULL,
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  sent_at DATETIME,
  failure_reason TEXT,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES breathing_videos(id),
  INDEX idx_schedule_id (schedule_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_scheduled_time (scheduled_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 구독 플랜 테이블
CREATE TABLE subscription_plans (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KRW',
  billing_period ENUM('monthly', 'annual') DEFAULT 'monthly',
  features JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 결제 테이블
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_plan_id VARCHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KRW',
  payment_method ENUM('stripe', 'toss', 'kakao_pay', 'bank_transfer', 'phone') NOT NULL,
  payment_gateway_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 사용자 활동 기록 테이블
CREATE TABLE user_activities (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  video_id VARCHAR(36),
  activity_type ENUM('viewed', 'completed', 'scheduled', 'shared') NOT NULL,
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (video_id) REFERENCES breathing_videos(id),
  INDEX idx_user_id (user_id),
  INDEX idx_video_id (video_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 구독 플랜 삽입
INSERT INTO subscription_plans (id, name, description, price, currency, billing_period, features, is_active) VALUES
('plan-free', 'Free', '무료 플랜', 0, 'KRW', 'monthly', '["기본 호흡 가이드", "1일 1회 영상"]', TRUE),
('plan-premium', 'Premium', '프리미엄 플랜', 9900, 'KRW', 'monthly', '["모든 호흡 패턴", "1일 5회 영상", "광고 없음", "커스텀 알림"]', TRUE),
('plan-vip', 'VIP', 'VIP 플랜', 29900, 'KRW', 'monthly', '["모든 프리미엄 기능", "무제한 영상", "우선 지원", "커뮤니티 액세스"]', TRUE);

-- 기본 호흡 템플릿 삽입
INSERT INTO breathing_templates (id, name, description, inhale_seconds, hold_seconds, exhale_seconds, hold_after_exhale_seconds, created_by, is_default) VALUES
('template-478', '4-7-8 호흡법', '스트레스 완화 및 수면 유도', 4, 7, 8, NULL, 1, TRUE),
('template-444', '박스 호흡법', '집중력 향상 및 안정감', 4, 4, 4, 4, 1, TRUE),
('template-555', '일관된 호흡법', '명상 및 이완', 5, 5, 5, NULL, 1, TRUE);

-- ============================================================================
-- 인덱스 최적화
-- ============================================================================

CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_templates_is_default ON breathing_templates(is_default);
CREATE INDEX idx_videos_status ON breathing_videos(status);
CREATE INDEX idx_assets_type_default ON assets(type, is_default);
CREATE INDEX idx_schedules_user_active ON schedules(user_id, is_active);
CREATE INDEX idx_activities_user_type ON user_activities(user_id, activity_type);
CREATE INDEX idx_payments_user_status ON payments(user_id, status);
