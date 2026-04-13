# 호흡 가이드 애니메이션 스타일 비교

## 📊 두 가지 스타일 개요

### Style 1: Standard (표준 - 구슬이 파이프라인을 따라 이동)

**메커니즘:**
- 구슬: 좌측 → 우측 → 좌측 이동 (호흡 초시간에 맞춰)
- 파이프라인: 고정 (움직이지 않음)
- 사용자 경험: 구슬이 파이프라인을 따라가며 호흡 진행도를 시각적으로 표현

**호흡 단계별 구슬 위치:**
```
들숨 (Inhale):    ●●●●●●●●●●→ (좌측 → 우측)
정지 (Hold):      ●●●●●●●●●● (우측 고정)
날숨 (Exhale):    ←●●●●●●●●●● (우측 → 좌측)
정지 (Hold):      ●●●●●●●●●● (좌측 고정)
```

**구현 파일:**
- `src/components/BreathingPipelineEngine.tsx` - React Native 렌더링
- `backend/src/services/advancedVideoGenerator.ts` - FFmpeg 영상 생성

---

### Style 2: Penetration (변형 - 파이프라인이 구슬을 관통하며 이동)

**메커니즘:**
- 구슬: 정중앙 고정 (움직이지 않음)
- 파이프라인: 우측 → 좌측 이동 (호흡 초시간에 맞춰진 굴곡)
- 사용자 경험: 파이프라인이 구슬을 관통하며 호흡 진행도를 표현 (더 동적이고 시각적 임팩트 강함)

**호흡 단계별 파이프라인 위치:**
```
들숨 (Inhale):    ════════════●════════════ (우측 → 중앙으로 이동)
정지 (Hold):      ════════════●════════════ (중앙 고정, 구슬 관통)
날숨 (Exhale):    ════════════●════════════ (중앙 → 좌측으로 이동)
정지 (Hold):      ════════════●════════════ (좌측 고정)
```

**구현 파일:**
- `src/components/BreathingPipelinePenetrationEngine.tsx` - React Native 렌더링
- `backend/src/services/penetrationVideoGenerator.ts` - FFmpeg 영상 생성

---

## 🎯 스타일 선택 기준

| 기준 | Style 1 (Standard) | Style 2 (Penetration) |
| :--- | :--- | :--- |
| **시각적 임팩트** | 중간 | 높음 (더 동적) |
| **사용 난이도** | 쉬움 | 중간 |
| **명상 효과** | 부드러움 | 강렬함 |
| **추천 호흡법** | 박스 호흡(4-4-4-4) | 4-7-8 호흡법 |
| **렌더링 복잡도** | 낮음 | 중간 |

---

## 🔧 기술 구현 상세

### Style 1: Standard 애니메이션 로직

```typescript
// 호흡 단계에 따른 구슬 X 좌표 계산
if (currentTime < inhale) {
  // 들숨: 좌측 → 우측
  orbX = startX + (currentTime / inhale) * (endX - startX);
} else if (currentTime < inhale + hold1) {
  // 정지 1: 우측 고정
  orbX = endX;
} else if (currentTime < inhale + hold1 + exhale) {
  // 날숨: 우측 → 좌측
  orbX = endX - ((currentTime - (inhale + hold1)) / exhale) * (endX - startX);
} else {
  // 정지 2: 좌측 고정
  orbX = startX;
}
```

**파이프라인:** 고정된 Bezier 곡선 (화면 좌측 끝 ~ 우측 끝)

---

### Style 2: Penetration 애니메이션 로직

```typescript
// 호흡 단계에 따른 파이프라인 시작/끝 X 좌표 계산
if (currentTime < inhale) {
  // 들숨: 우측 → 중앙 (구슬 도달)
  pipelineStartX = width - (currentTime / inhale) * (width - orbCenterX);
  pipelineEndX = width - (currentTime / inhale) * width;
} else if (currentTime < inhale + hold1) {
  // 정지 1: 중앙 고정 (구슬을 관통)
  pipelineStartX = orbCenterX;
  pipelineEndX = 0;
} else if (currentTime < inhale + hold1 + exhale) {
  // 날숨: 중앙 → 좌측 (구슬 통과)
  const progress = (currentTime - (inhale + hold1)) / exhale;
  pipelineStartX = orbCenterX - progress * orbCenterX;
  pipelineEndX = -progress * (width - orbCenterX);
} else {
  // 정지 2: 좌측 고정
  pipelineStartX = 0;
  pipelineEndX = -width * 0.3;
}
```

**구슬:** 정중앙 고정 (X = width / 2, Y = height / 2)

---

## 🎨 공통 기능

### 1. 텍스트 오버레이
```typescript
// 현재 호흡 단계 표시
- "Inhale (3s)" - 남은 초 단위 표시
- "Hold (5s)"
- "Exhale (7s)"
- 진행률: "45% Complete"
```

### 2. 구슬 질감 효과
- **Glossy (광택)**: 상단 좌측에 하이라이트 추가
- **Matte (매트)**: 그림자만 표시
- **Metallic (메탈릭)**: 선형 그래디언트로 금속 반사 효과

### 3. 파이프라인 Bezier 곡선
```typescript
// 3차 Bezier 곡선으로 부드러운 곡선 표현
bezierCurveTo(
  midX * 0.5, controlY,  // 제어점 1
  midX * 1.5, controlY,  // 제어점 2
  endX, centerY          // 끝점
);
```

### 4. 배경 투명도 조절
```typescript
canvas.globalAlpha = backgroundOpacity;
// 배경 렌더링
canvas.globalAlpha = 1;
```

---

## 📹 FFmpeg 영상 생성

### Python + OpenCV 기반 렌더링

**해상도:** 1080x1920 (모바일 세로 모드)  
**프레임레이트:** 30fps  
**코덱:** H.264 (mp4v)

**렌더링 파이프라인:**
1. 배경 생성 (다크 블루 #0A0E27)
2. 파이프라인 그리기 (Bezier 곡선)
3. 구슬 그리기 (원형 + 질감 효과)
4. 텍스트 오버레이 (호흡 단계 + 진행률)
5. 프레임 저장 → MP4 인코딩

---

## 🚀 사용 방법

### TemplateEditor에서 스타일 선택

```typescript
import TemplateEditor from './screens/TemplateEditor';

// 스타일 토글 버튼 제공
// Style 1: Standard ← → Style 2: Penetration
```

### 프로그래밍 방식 스타일 설정

```typescript
import { useTemplateStore } from './store/templateStore';

const updateTemplate = useTemplateStore((state) => state.updateTemplate);

// 스타일 변경
updateTemplate({
  style: 'penetration' // 또는 'standard'
});
```

### 백엔드 영상 생성

```typescript
import penetrationVideoGenerator from './services/penetrationVideoGenerator';
import advancedVideoGenerator from './services/advancedVideoGenerator';

const template = {
  breathing: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  pipeline: { thickness: 8, color: '#d4af37', curvature: 50 },
  orb: { size: 20, color: '#d4af37', opacity: 0.9, texture: 'glossy' },
  background: { opacity: 0.5 },
  sound: { volume: 0.3 },
};

// Style 1
const video1 = await advancedVideoGenerator.generateVideo(template, '/output/video1.mp4');

// Style 2
const video2 = await penetrationVideoGenerator.generateVideo(template, '/output/video2.mp4');
```

---

## 📊 성능 최적화

### 렌더링 최적화
- **Canvas 캐싱**: 정적 요소는 미리 렌더링
- **프레임 스킵**: 불필요한 프레임 렌더링 방지
- **메모리 관리**: 대용량 배경 이미지는 S3에서 스트리밍

### 애니메이션 최적화
- **requestAnimationFrame**: 브라우저 리프레시 레이트에 동기화
- **Bezier 곡선 캐싱**: 매 프레임마다 재계산하지 않음
- **텍스처 효과**: GPU 가속 (WebGL)

---

## 🔄 향후 확장 계획

### Style 3: Wave (파도 스타일)
- 파이프라인이 파도처럼 움직이며 구슬을 밀어냄
- 더 자연스럽고 유동적인 표현

### Style 4: Pulse (맥박 스타일)
- 구슬이 팽창/수축하며 호흡을 표현
- 심박수와 연동 가능

### Style 5: Spiral (나선 스타일)
- 파이프라인이 나선형으로 회전하며 구슬을 이동
- 3D 효과로 더 몰입감 있는 경험

---

## 📝 테스트 체크리스트

- [ ] Style 1: 구슬이 정확히 좌측 → 우측 → 좌측 이동
- [ ] Style 2: 파이프라인이 정확히 우측 → 좌측 이동, 구슬 고정
- [ ] 호흡 초시간 정확한 동기화 (4-7-8 기준)
- [ ] 텍스트 오버레이 정확한 표시
- [ ] 구슬 질감 효과 정상 작동
- [ ] 배경 투명도 조절 가능
- [ ] FFmpeg 영상 생성 성공
- [ ] 모바일 앱 렌더링 성능 (60fps 유지)

---

**최종 업데이트:** 2026-04-13  
**커밋:** 2586d5d (Pipeline Penetration Style Implementation)
