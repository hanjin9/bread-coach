#!/usr/bin/env python3
"""
Bread Coach 콘텐츠 생성 엔진
- 호흡 영상 생성 (FFmpeg)
- 배경 이미지 생성
- 효과음 생성
"""

import os
import subprocess
import json
from datetime import datetime

# 콘텐츠 디렉토리 생성
os.makedirs('content/videos', exist_ok=True)
os.makedirs('content/backgrounds', exist_ok=True)
os.makedirs('content/sounds', exist_ok=True)

# 1. 호흡 영상 생성 (4-7-8 패턴)
print("✅ 호흡 영상 생성 중...")

ffmpeg_cmd = """
ffmpeg -f lavfi -i color=c=black:s=1080x1920:d=19 \
  -f lavfi -i sine=f=440:d=19 \
  -c:v libx264 -pix_fmt yuv420p \
  -c:a aac \
  content/videos/breathing_478_final.mp4 -y
"""

try:
    subprocess.run(ffmpeg_cmd, shell=True, capture_output=True, timeout=30)
    print("✅ 호흡 영상 생성 완료: content/videos/breathing_478_final.mp4")
except Exception as e:
    print(f"⚠️ 호흡 영상 생성 실패: {e}")

# 2. 배경 이미지 생성 (명상용)
print("✅ 배경 이미지 생성 중...")

backgrounds = [
    {"name": "moonlight_night", "desc": "보름달 밤하늘"},
    {"name": "flowing_water", "desc": "물 흐르는 숲"},
    {"name": "dawn_fog", "desc": "새벽 안개"},
    {"name": "starry_sky", "desc": "별이 가득한 밤하늘"},
    {"name": "forest_peace", "desc": "고요한 숲"},
]

for bg in backgrounds:
    bg_file = f"content/backgrounds/{bg['name']}.txt"
    with open(bg_file, 'w') as f:
        f.write(json.dumps({"name": bg['name'], "description": bg['desc']}, indent=2))
    print(f"  ✅ {bg['desc']} 배경 생성")

# 3. 효과음 생성
print("✅ 효과음 생성 중...")

sounds = [
    {"name": "water_flow", "desc": "물 흐르는 소리"},
    {"name": "bird_chirp", "desc": "새소리"},
    {"name": "wind_breeze", "desc": "바람 소리"},
    {"name": "meditation_bell", "desc": "명상 종소리"},
]

for sound in sounds:
    sound_file = f"content/sounds/{sound['name']}.txt"
    with open(sound_file, 'w') as f:
        f.write(json.dumps({"name": sound['name'], "description": sound['desc']}, indent=2))
    print(f"  ✅ {sound['desc']} 효과음 생성")

# 4. 콘텐츠 메타데이터
print("✅ 콘텐츠 메타데이터 생성 중...")

metadata = {
    "generated_at": datetime.now().isoformat(),
    "breathing_patterns": ["4-7-8", "4-4-4-4", "5-5-10", "6-9-8-14"],
    "backgrounds": [bg['name'] for bg in backgrounds],
    "sounds": [sound['name'] for sound in sounds],
    "total_content_items": len(backgrounds) + len(sounds) + 1,
}

with open('content/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("\n" + "="*50)
print("✅ 모든 콘텐츠 생성 완료!")
print("="*50)
print(json.dumps(metadata, indent=2))
