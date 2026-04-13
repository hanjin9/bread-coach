import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production-min-32-chars!!';
const SALT_ROUNDS = 12;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bread_coach',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; is_admin: boolean };
}

// ─── 미들웨어: 인증 ────────────────────────────────────────────
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// ─── 미들웨어: 관리자 전용 (결함 6 수정) ────────────────────────
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }
  next();
};

// ─── 인증 라우트 ───────────────────────────────────────────────

// 로그인 (결함 1 수정: bcrypt.compare 적용)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, email, name, password_hash, subscription_status, is_admin FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    const users = rows as any[];
    if (users.length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const user = users[0];

    // ✅ 결함 1 수정: bcrypt 비밀번호 비교
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user', is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_status: user.subscription_status,
          is_admin: user.is_admin,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 회원가입 (결함 2 수정: bcrypt 해시 저장)
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, name, password, auth_provider } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다.' });
    }

    // ✅ 결함 2 수정: bcrypt 해시 생성 후 저장
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const connection = await pool.getConnection();

    // 이메일 중복 확인
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if ((existing as any[]).length > 0) {
      connection.release();
      return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });
    }

    const [result] = await connection.query(
      'INSERT INTO users (email, name, password_hash, auth_provider) VALUES (?, ?, ?, ?)',
      [email, name, passwordHash, auth_provider || 'email']
    );
    connection.release();

    const userId = (result as any).insertId;
    const token = jwt.sign(
      { id: userId, email, role: 'user', is_admin: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: { user: { id: userId, email, name }, token },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: '회원가입에 실패했습니다.' });
  }
});

// ─── 호흡 세션 라우트 ──────────────────────────────────────────

app.get('/api/videos', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM breathing_videos WHERE status = ? LIMIT 20', ['completed']
    );
    connection.release();
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ error: '영상 조회 실패' });
  }
});

app.get('/api/videos/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM breathing_videos WHERE id = ?', [id]
    );
    connection.release();
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '영상을 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: (rows as any[])[0] });
  } catch {
    res.status(500).json({ error: '영상 조회 실패' });
  }
});

// 호흡 세션 기록
app.post('/api/breathing/session', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      videoId, watchDurationSeconds, completionPercentage,
      breathingPattern, accuracy, consistency,
      heartRateChange, stressLevelBefore, stressLevelAfter
    } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO breathing_sessions
       (user_id, video_id, watch_duration_seconds, completion_percentage,
        breathing_pattern, accuracy, consistency, heart_rate_change,
        stress_level_before, stress_level_after)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user?.id, videoId, watchDurationSeconds, completionPercentage,
       breathingPattern, accuracy, consistency, heartRateChange,
       stressLevelBefore, stressLevelAfter]
    );
    // 포인트 자동 적립
    const points = Math.floor((completionPercentage / 100) * 10);
    if (points > 0) {
      await connection.query(
        'INSERT INTO points (user_id, amount, reason) VALUES (?, ?, ?)',
        [req.user?.id, points, '호흡 세션 완료']
      );
    }
    connection.release();
    res.status(201).json({ success: true, data: { pointsAwarded: points } });
  } catch (error) {
    console.error('Session record error:', error);
    res.status(500).json({ error: '세션 기록 실패' });
  }
});

// 호흡 통계
app.get('/api/breathing/stats/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    if (req.user?.id !== parseInt(userId)) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT
         COUNT(*) as totalSessions,
         AVG(accuracy) as averageAccuracy,
         AVG(consistency) as averageConsistency,
         SUM(watch_duration_seconds) / 60 as totalMinutesCompleted,
         AVG(stress_level_before - stress_level_after) as stressReductionAverage
       FROM breathing_sessions WHERE user_id = ?`,
      [userId]
    );
    connection.release();
    res.json({ success: true, data: (rows as any[])[0] });
  } catch {
    res.status(500).json({ error: '통계 조회 실패' });
  }
});

// 연속 일수
app.get('/api/breathing/streak/:userId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT DATE(created_at) as session_date
       FROM breathing_sessions WHERE user_id = ?
       GROUP BY DATE(created_at) ORDER BY session_date DESC`,
      [userId]
    );
    connection.release();
    const dates = (rows as any[]).map(r => r.session_date);
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (diff === i) streak++;
      else break;
    }
    res.json({ success: true, data: { streak } });
  } catch {
    res.status(500).json({ error: '연속일수 조회 실패' });
  }
});

// ─── 스케줄 라우트 ─────────────────────────────────────────────

app.get('/api/schedules', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM schedules WHERE user_id = ?', [req.user?.id]
    );
    connection.release();
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ error: '스케줄 조회 실패' });
  }
});

app.post('/api/schedules', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { video_id, scheduled_time, scheduled_days } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO schedules (id, user_id, video_id, scheduled_time, scheduled_days) VALUES (UUID(), ?, ?, ?, ?)',
      [req.user?.id, video_id, scheduled_time, JSON.stringify(scheduled_days)]
    );
    connection.release();
    res.status(201).json({ success: true, data: { id: (result as any).insertId } });
  } catch {
    res.status(500).json({ error: '스케줄 생성 실패' });
  }
});

// ─── 사용자 라우트 ─────────────────────────────────────────────

app.get('/api/users/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, email, name, profile_image_url, subscription_status, is_admin, created_at FROM users WHERE id = ?',
      [req.user?.id]
    );
    connection.release();
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data: (rows as any[])[0] });
  } catch {
    res.status(500).json({ error: '프로필 조회 실패' });
  }
});

// 피드백 엔드포인트
app.post('/api/breathing/feedback/encouragement', authenticate, async (req: AuthRequest, res: Response) => {
  const { data } = req.body;
  const stressReduction = (data?.stressLevelBefore ?? 0) - (data?.stressLevelAfter ?? 0);
  let text = '훌륭한 호흡 운동이었습니다! 꾸준히 실천하면 더 큰 효과를 느낄 수 있어요.';
  if (data?.accuracy >= 80) text = `정확도 ${data.accuracy}%! 호흡 패턴을 정말 잘 따라하셨어요. 대단합니다!`;
  else if (stressReduction >= 3) text = `스트레스가 ${stressReduction}점이나 줄었어요! 호흡의 힘을 느끼셨나요?`;
  res.json({ success: true, data: { text } });
});

app.post('/api/breathing/feedback/warning', authenticate, async (req: AuthRequest, res: Response) => {
  const { warnings } = req.body;
  const missionMap: Record<string, string> = {
    accuracy_low: '천천히 가이드를 따라 호흡해 보세요. 속도보다 정확도가 중요합니다.',
    consistency_low: '리듬을 맞추는 것이 핵심이에요. 오늘은 짧은 세션으로 연습해 보세요.',
    completion_low: '끝까지 완주하는 습관을 만들어 보세요. 3분만 더 도전해 봐요!',
    stress_reduction_low: '조용한 환경에서 다시 시도해 보세요. 주변 소음이 효과를 방해할 수 있어요.',
  };
  const text = missionMap[(warnings as string[])?.[0]] || '꾸준한 연습이 가장 중요합니다. 매일 조금씩 해보세요.';
  res.json({ success: true, data: { text, missionSuggestion: '기본 호흡 연습 — 5분 집중 세션' } });
});

app.post('/api/breathing/feedback/premium', authenticate, async (req: AuthRequest, res: Response) => {
  const { data } = req.body;
  const text = `[프리미엄 분석 리포트]\n\n호흡 패턴: ${data?.breathingPattern || 'N/A'}\n정확도: ${data?.accuracy || 0}%\n일관성: ${data?.consistency || 0}%\n\n이번 세션을 바탕으로 30일 맞춤 플랜을 제안드립니다.\n매일 아침 5분, 저녁 10분 호흡 루틴을 추천드립니다.`;
  res.json({ success: true, data: { text } });
});

// ─── 관리자 라우트 (결함 6 수정: requireAdmin 미들웨어 적용) ────

app.post('/api/admin/templates', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, inhale_seconds, hold_seconds, exhale_seconds, background_image_id, effect_sound_id } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO breathing_templates (id, name, description, inhale_seconds, hold_seconds, exhale_seconds, background_image_id, effect_sound_id, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, inhale_seconds, hold_seconds, exhale_seconds, background_image_id, effect_sound_id, req.user?.id]
    );
    connection.release();
    res.status(201).json({ success: true, data: { id: (result as any).insertId } });
  } catch {
    res.status(500).json({ error: '템플릿 생성 실패' });
  }
});

app.post('/api/admin/generate-video', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { template_id } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO breathing_videos (id, template_id, video_url, duration_seconds, status) VALUES (UUID(), ?, ?, ?, ?)',
      [template_id, '', 0, 'pending']
    );
    connection.release();
    res.status(201).json({ success: true, data: { id: (result as any).insertId, status: 'pending' } });
  } catch {
    res.status(500).json({ error: '영상 생성 요청 실패' });
  }
});

// 관리자 통계
app.get('/api/admin/stats', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [[userCount]] = await connection.query('SELECT COUNT(*) as count FROM users') as any;
    const [[sessionCount]] = await connection.query('SELECT COUNT(*) as count FROM breathing_sessions') as any;
    const [[videoCount]] = await connection.query('SELECT COUNT(*) as count FROM breathing_videos WHERE status = "completed"') as any;
    connection.release();
    res.json({
      success: true,
      data: {
        totalUsers: userCount.count,
        totalSessions: sessionCount.count,
        completedVideos: videoCount.count,
      }
    });
  } catch {
    res.status(500).json({ error: '통계 조회 실패' });
  }
});

// ─── 헬스 체크 ─────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`✅ Bread Coach API Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
});
