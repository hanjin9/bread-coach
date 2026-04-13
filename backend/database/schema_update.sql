-- ============================================================================
-- Bread Coach Database Schema Update
-- 포인트 시스템 및 VIP 카드 테이블 추가
-- ============================================================================

-- 포인트 테이블
CREATE TABLE IF NOT EXISTS points (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  points INT NOT NULL,
  transaction_type ENUM('earn', 'spend', 'bonus', 'refund') DEFAULT 'earn',
  description TEXT,
  video_id VARCHAR(36),
  watch_duration_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VIP 카드 테이블
CREATE TABLE IF NOT EXISTS vip_cards (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  current_level ENUM('bronze', 'silver', 'gold', 'emerald', 'sapphire', 'diamond', 'platinum', 'black_platinum') DEFAULT 'bronze',
  total_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_current_level (current_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VIP 이력 테이블
CREATE TABLE IF NOT EXISTS vip_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  previous_level ENUM('bronze', 'silver', 'gold', 'emerald', 'sapphire', 'diamond', 'platinum', 'black_platinum'),
  new_level ENUM('bronze', 'silver', 'gold', 'emerald', 'sapphire', 'diamond', 'platinum', 'black_platinum'),
  points_at_upgrade INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 쇼핑몰 상품 테이블 (몰인몰)
CREATE TABLE IF NOT EXISTS shop_products (
  id VARCHAR(36) PRIMARY KEY,
  shop_id VARCHAR(36) NOT NULL,
  shop_name VARCHAR(100) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KRW',
  image_url VARCHAR(500),
  category VARCHAR(50),
  stock INT DEFAULT 0,
  discount_rate INT DEFAULT 0,
  vip_discount_rate INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shop_id (shop_id),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 쇼핑몰 주문 테이블
CREATE TABLE IF NOT EXISTS shop_orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_applied DECIMAL(10, 2) DEFAULT 0,
  final_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES shop_products(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 포인트 사용 내역 테이블
CREATE TABLE IF NOT EXISTS point_usage (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  points_used INT NOT NULL,
  usage_type ENUM('shop_discount', 'subscription', 'event', 'other') DEFAULT 'shop_discount',
  reference_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_usage_type (usage_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- VIP 혜택 정의 테이블
CREATE TABLE IF NOT EXISTS vip_benefits (
  id VARCHAR(36) PRIMARY KEY,
  level ENUM('bronze', 'silver', 'gold', 'emerald', 'sapphire', 'diamond', 'platinum', 'black_platinum'),
  benefit_name VARCHAR(100),
  benefit_description TEXT,
  discount_rate INT DEFAULT 0,
  monthly_bonus_points INT DEFAULT 0,
  UNIQUE KEY unique_level_benefit (level, benefit_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 VIP 혜택 데이터 삽입
INSERT INTO vip_benefits (id, level, benefit_name, benefit_description, discount_rate, monthly_bonus_points) VALUES
('benefit-bronze-1', 'bronze', '기본 호흡 가이드', '기본 호흡 가이드 제공', 0, 0),
('benefit-bronze-2', 'bronze', '1일 1회 영상', '하루에 1회 호흡 영상 시청', 0, 0),

('benefit-silver-1', 'silver', '모든 호흡 패턴', '모든 호흡 패턴 사용 가능', 0, 0),
('benefit-silver-2', 'silver', '1일 3회 영상', '하루에 3회 호흡 영상 시청', 0, 0),
('benefit-silver-3', 'silver', '5% 할인', '쇼핑몰 5% 할인', 5, 100),

('benefit-gold-1', 'gold', '1일 5회 영상', '하루에 5회 호흡 영상 시청', 0, 0),
('benefit-gold-2', 'gold', '광고 없음', '광고 없는 서비스 이용', 0, 0),
('benefit-gold-3', 'gold', '10% 할인', '쇼핑몰 10% 할인', 10, 200),
('benefit-gold-4', 'gold', '커스텀 알림', '맞춤형 호흡 알림 설정', 0, 0),

('benefit-emerald-1', 'emerald', '무제한 영상', '무제한 호흡 영상 시청', 0, 0),
('benefit-emerald-2', 'emerald', '우선 지원', '우선 고객 지원', 0, 0),
('benefit-emerald-3', 'emerald', '15% 할인', '쇼핑몰 15% 할인', 15, 300),
('benefit-emerald-4', 'emerald', '월간 보너스 포인트', '매월 보너스 포인트 지급', 0, 300),

('benefit-sapphire-1', 'sapphire', 'VIP 라운지 액세스', 'VIP 라운지 접근 권한', 0, 0),
('benefit-sapphire-2', 'sapphire', '20% 할인', '쇼핑몰 20% 할인', 20, 500),
('benefit-sapphire-3', 'sapphire', '전용 콘텐츠', '전용 호흡 콘텐츠 제공', 0, 0),
('benefit-sapphire-4', 'sapphire', '우선 이벤트 참여', '이벤트 우선 참여 권한', 0, 0),

('benefit-diamond-1', 'diamond', '개인 코치 상담', '개인 호흡 코치 상담', 0, 0),
('benefit-diamond-2', 'diamond', '25% 할인', '쇼핑몰 25% 할인', 25, 800),
('benefit-diamond-3', 'diamond', '커뮤니티 리더 권한', '커뮤니티 리더 권한 부여', 0, 0),
('benefit-diamond-4', 'diamond', '월간 특별 이벤트', '월간 특별 이벤트 개최', 0, 0),

('benefit-platinum-1', 'platinum', '프리미엄 콘텐츠 무제한', '프리미엄 콘텐츠 무제한 이용', 0, 0),
('benefit-platinum-2', 'platinum', '30% 할인', '쇼핑몰 30% 할인', 30, 1200),
('benefit-platinum-3', 'platinum', '전용 라운지', '전용 라운지 이용', 0, 0),
('benefit-platinum-4', 'platinum', '우선 신제품 출시', '신제품 우선 출시 정보 제공', 0, 0),

('benefit-black-platinum-1', 'black_platinum', '최고 등급 혜택', '모든 최고 등급 혜택 제공', 0, 0),
('benefit-black-platinum-2', 'black_platinum', '40% 할인', '쇼핑몰 40% 할인', 40, 2000),
('benefit-black-platinum-3', 'black_platinum', '전용 컨시어지 서비스', '24/7 전용 컨시어지 서비스', 0, 0),
('benefit-black-platinum-4', 'black_platinum', '무제한 우선 지원', '무제한 우선 고객 지원', 0, 0);

-- ============================================================================
-- 인덱스 최적화
-- ============================================================================

CREATE INDEX idx_points_user_created ON points(user_id, created_at);
CREATE INDEX idx_vip_cards_level ON vip_cards(current_level);
CREATE INDEX idx_shop_products_shop_active ON shop_products(shop_id, is_active);
CREATE INDEX idx_shop_orders_user_status ON shop_orders(user_id, status);
CREATE INDEX idx_point_usage_user_type ON point_usage(user_id, usage_type);
