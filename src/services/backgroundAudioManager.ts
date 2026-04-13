import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

/**
 * 배경 영상 + 효과음 통합 관리자
 * - 배경 영상 다운로드 및 캐싱
 * - 효과음 로드 및 재생
 * - 볼륨 조절 (아주 미약하게 0.1~0.3)
 */

export interface BackgroundAsset {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'image';
  category: 'nature' | 'water' | 'sky' | 'meditation';
  description: string;
  thumbnail?: string;
}

export interface SoundAsset {
  id: string;
  name: string;
  url: string;
  type: 'effect' | 'ambient';
  category: 'water' | 'birds' | 'wind' | 'meditation';
  description: string;
  duration?: number;
}

export class BackgroundAudioManager {
  private soundObject: Audio.Sound | null = null;
  private cacheDir = FileSystem.cacheDirectory + 'breathing-assets/';

  // 프리셋 배경 영상 라이브러리
  readonly BACKGROUND_PRESETS: BackgroundAsset[] = [
    {
      id: 'fullmoon-night',
      name: '보름달 밤하늘',
      url: 'https://cdn.example.com/backgrounds/fullmoon-night.mp4',
      type: 'video',
      category: 'sky',
      description: '명상에 어울리는 보름달과 별이 가득한 밤하늘',
      thumbnail: 'https://cdn.example.com/thumbnails/fullmoon-night.jpg',
    },
    {
      id: 'flowing-water',
      name: '물 흐르는 숲',
      url: 'https://cdn.example.com/backgrounds/flowing-water.mp4',
      type: 'video',
      category: 'water',
      description: '맑은 물이 흐르는 숲 속 계곡',
      thumbnail: 'https://cdn.example.com/thumbnails/flowing-water.jpg',
    },
    {
      id: 'dawn-mist',
      name: '새벽 안개',
      url: 'https://cdn.example.com/backgrounds/dawn-mist.mp4',
      type: 'video',
      category: 'nature',
      description: '고요한 새벽의 안개 풍경',
      thumbnail: 'https://cdn.example.com/thumbnails/dawn-mist.jpg',
    },
    {
      id: 'ocean-waves',
      name: '파도 소리',
      url: 'https://cdn.example.com/backgrounds/ocean-waves.mp4',
      type: 'video',
      category: 'water',
      description: '잔잔한 파도가 밀려오는 해변',
      thumbnail: 'https://cdn.example.com/thumbnails/ocean-waves.jpg',
    },
    {
      id: 'forest-light',
      name: '숲 속 빛',
      url: 'https://cdn.example.com/backgrounds/forest-light.mp4',
      type: 'video',
      category: 'nature',
      description: '햇빛이 스며드는 조용한 숲',
      thumbnail: 'https://cdn.example.com/thumbnails/forest-light.jpg',
    },
  ];

  // 프리셋 효과음 라이브러리
  readonly SOUND_PRESETS: SoundAsset[] = [
    {
      id: 'water-flowing',
      name: '물 흐르는 소리',
      url: 'https://cdn.example.com/sounds/water-flowing.mp3',
      type: 'ambient',
      category: 'water',
      description: '부드러운 물 흐르는 소리',
      duration: 60,
    },
    {
      id: 'birds-chirping',
      name: '새 울음소리',
      url: 'https://cdn.example.com/sounds/birds-chirping.mp3',
      type: 'ambient',
      category: 'birds',
      description: '숲 속 새들의 울음소리',
      duration: 60,
    },
    {
      id: 'wind-breeze',
      name: '바람 소리',
      url: 'https://cdn.example.com/sounds/wind-breeze.mp3',
      type: 'ambient',
      category: 'wind',
      description: '부드러운 바람 소리',
      duration: 60,
    },
    {
      id: 'meditation-bell',
      name: '명상 종소리',
      url: 'https://cdn.example.com/sounds/meditation-bell.mp3',
      type: 'effect',
      category: 'meditation',
      description: '호흡 단계 변화 알림 종소리',
      duration: 2,
    },
    {
      id: 'ambient-silence',
      name: '조용한 명상음',
      url: 'https://cdn.example.com/sounds/ambient-silence.mp3',
      type: 'ambient',
      category: 'meditation',
      description: '거의 들리지 않는 명상 배경음',
      duration: 60,
    },
  ];

  async initialize() {
    try {
      // 캐시 디렉토리 생성
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }

      // 오디오 세션 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionHandlingIOS: Audio.InterruptionHandlingIOS.DuckOthers,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('BackgroundAudioManager initialized');
    } catch (error) {
      console.error('Failed to initialize BackgroundAudioManager:', error);
    }
  }

  /**
   * 배경 영상 다운로드 및 캐싱
   */
  async downloadBackground(asset: BackgroundAsset): Promise<string> {
    const cachedPath = this.cacheDir + asset.id + '.mp4';

    try {
      // 캐시 확인
      const cached = await FileSystem.getInfoAsync(cachedPath);
      if (cached.exists) {
        console.log(`Background cached: ${asset.id}`);
        return cachedPath;
      }

      // 다운로드
      console.log(`Downloading background: ${asset.id}`);
      const downloadResult = await FileSystem.downloadAsync(asset.url, cachedPath);

      if (downloadResult.status === 200) {
        console.log(`Background downloaded: ${asset.id}`);
        return cachedPath;
      } else {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }
    } catch (error) {
      console.error(`Failed to download background ${asset.id}:`, error);
      throw error;
    }
  }

  /**
   * 효과음 로드 및 재생
   */
  async loadAndPlaySound(
    asset: SoundAsset,
    volume: number = 0.2,
    loop: boolean = true
  ): Promise<void> {
    try {
      // 기존 소리 정지
      if (this.soundObject) {
        await this.soundObject.unloadAsync();
      }

      // 새 소리 로드
      this.soundObject = new Audio.Sound();
      await this.soundObject.loadAsync({ uri: asset.url });

      // 볼륨 설정 (아주 미약하게: 0.1~0.3)
      const adjustedVolume = Math.min(Math.max(volume, 0.1), 0.3);
      await this.soundObject.setVolumeAsync(adjustedVolume);

      // 루프 설정
      await this.soundObject.setIsLoopingAsync(loop);

      // 재생
      await this.soundObject.playAsync();

      console.log(`Sound playing: ${asset.id} (volume: ${adjustedVolume})`);
    } catch (error) {
      console.error(`Failed to play sound ${asset.id}:`, error);
      throw error;
    }
  }

  /**
   * 효과음 일시정지
   */
  async pauseSound(): Promise<void> {
    try {
      if (this.soundObject) {
        await this.soundObject.pauseAsync();
        console.log('Sound paused');
      }
    } catch (error) {
      console.error('Failed to pause sound:', error);
    }
  }

  /**
   * 효과음 재개
   */
  async resumeSound(): Promise<void> {
    try {
      if (this.soundObject) {
        await this.soundObject.playAsync();
        console.log('Sound resumed');
      }
    } catch (error) {
      console.error('Failed to resume sound:', error);
    }
  }

  /**
   * 효과음 정지 및 언로드
   */
  async stopSound(): Promise<void> {
    try {
      if (this.soundObject) {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
        this.soundObject = null;
        console.log('Sound stopped');
      }
    } catch (error) {
      console.error('Failed to stop sound:', error);
    }
  }

  /**
   * 볼륨 조절 (0.1~0.3 범위)
   */
  async setVolume(volume: number): Promise<void> {
    try {
      const adjustedVolume = Math.min(Math.max(volume, 0.1), 0.3);
      if (this.soundObject) {
        await this.soundObject.setVolumeAsync(adjustedVolume);
        console.log(`Volume set to: ${adjustedVolume}`);
      }
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  }

  /**
   * 배경 영상 목록 조회
   */
  getBackgroundPresets(category?: string): BackgroundAsset[] {
    if (category) {
      return this.BACKGROUND_PRESETS.filter((bg) => bg.category === category);
    }
    return this.BACKGROUND_PRESETS;
  }

  /**
   * 효과음 목록 조회
   */
  getSoundPresets(category?: string): SoundAsset[] {
    if (category) {
      return this.SOUND_PRESETS.filter((sound) => sound.category === category);
    }
    return this.SOUND_PRESETS;
  }

  /**
   * 캐시 정리
   */
  async clearCache(): Promise<void> {
    try {
      await FileSystem.deleteAsync(this.cacheDir, { idempotent: true });
      console.log('Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * 캐시 크기 확인
   */
  async getCacheSize(): Promise<number> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.cacheDir);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(this.cacheDir + file);
        if (fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }
}

export default new BackgroundAudioManager();
