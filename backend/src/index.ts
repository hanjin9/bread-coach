import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

// 환경 변수 로드
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 데이터베이스 연결 풀
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bread_coach',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 타입 정의
interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

// 인증 미들웨어
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// ============================================================================
// 인증 라우트
// ============================================================================

// 로그인
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT id, email, name, subscription_status FROM users WHERE email = ?',
      [email]
    );

    connection.release();

    if ((rows as any[]).length === 0) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const user = (rows as any[])[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류' });
  }
});

// 회원가입
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, name, password, auth_provider } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'INSERT INTO users (email, name, password_hash, auth_provider) VALUES (?, ?, ?, ?)',
      [email, name, password, auth_provider]
    );

    connection.release();

    const userId = (result as any).insertId;
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: { id: userId, email, name },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ error: '회원가입 실패' });
  }
});

// ============================================================================
// 호흡 영상 라우트
// ============================================================================

// 모든 영상 조회
app.get('/api/videos', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM breathing_videos WHERE status = ? LIMIT 20',
      ['completed']
    );
    connection.release();

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: '영상 조회 실패' });
  }
});

// 특정 영상 조회
app.get('/api/videos/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM breathing_videos WHERE id = ?', [id]);
    connection.release();

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '영상을 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: (rows as any[])[0],
    });
  } catch (error) {
    res.status(500).json({ error: '영상 조회 실패' });
  }
});

// ============================================================================
// 스케줄 라우트
// ============================================================================

// 사용자 스케줄 조회
app.get('/api/schedules', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM schedules WHERE user_id = ?', [
      req.user?.id,
    ]);
    connection.release();

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: '스케줄 조회 실패' });
  }
});

// 스케줄 생성
app.post('/api/schedules', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { video_id, scheduled_time, scheduled_days } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'INSERT INTO schedules (id, user_id, video_id, scheduled_time, scheduled_days) VALUES (UUID(), ?, ?, ?, ?)',
      [req.user?.id, video_id, scheduled_time, JSON.stringify(scheduled_days)]
    );

    connection.release();

    res.status(201).json({
      success: true,
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    res.status(500).json({ error: '스케줄 생성 실패' });
  }
});

// ============================================================================
// 사용자 프로필 라우트
// ============================================================================

// 프로필 조회
app.get('/api/users/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [req.user?.id]);
    connection.release();

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.json({
      success: true,
      data: (rows as any[])[0],
    });
  } catch (error) {
    res.status(500).json({ error: '프로필 조회 실패' });
  }
});

// ============================================================================
// 관리자 라우트
// ============================================================================

// 호흡 템플릿 생성
app.post('/api/admin/templates', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      inhale_seconds,
      hold_seconds,
      exhale_seconds,
      background_image_id,
      effect_sound_id,
    } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO breathing_templates (id, name, description, inhale_seconds, hold_seconds, exhale_seconds, background_image_id, effect_sound_id, created_by) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        description,
        inhale_seconds,
        hold_seconds,
        exhale_seconds,
        background_image_id,
        effect_sound_id,
        req.user?.id,
      ]
    );

    connection.release();

    res.status(201).json({
      success: true,
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    res.status(500).json({ error: '템플릿 생성 실패' });
  }
});

// 영상 생성 요청
app.post('/api/admin/generate-video', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { template_id, quality } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO breathing_videos (id, template_id, video_url, status) VALUES (UUID(), ?, ?, ?)',
      [template_id, '', 'pending']
    );

    connection.release();

    res.status(201).json({
      success: true,
      data: { id: (result as any).insertId, status: 'pending' },
    });
  } catch (error) {
    res.status(500).json({ error: '영상 생성 요청 실패' });
  }
});

// ============================================================================
// 헬스 체크
// ============================================================================

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// 에러 핸들링
// ============================================================================

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: '서버 오류' });
});

// ============================================================================
// 서버 시작
// ============================================================================

app.listen(PORT, () => {
  console.log(`✅ Bread Coach API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
