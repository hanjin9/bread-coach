import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import backgroundAudioManager, {
  BackgroundAsset,
  SoundAsset,
} from '../services/backgroundAudioManager';

const { width } = Dimensions.get('window');

interface BackgroundAudioSelectorProps {
  onBackgroundSelect?: (asset: BackgroundAsset) => void;
  onSoundSelect?: (asset: SoundAsset) => void;
  onBackgroundOpacityChange?: (opacity: number) => void;
  onSoundVolumeChange?: (volume: number) => void;
}

export default function BackgroundAudioSelector({
  onBackgroundSelect,
  onSoundSelect,
  onBackgroundOpacityChange,
  onSoundVolumeChange,
}: BackgroundAudioSelectorProps) {
  const [backgroundAssets, setBackgroundAssets] = useState<BackgroundAsset[]>([]);
  const [soundAssets, setSoundAssets] = useState<SoundAsset[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.5);
  const [soundVolume, setSoundVolume] = useState(0.2);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'background' | 'sound'>('background');

  useEffect(() => {
    initializeAssets();
  }, []);

  const initializeAssets = async () => {
    try {
      setIsLoading(true);
      await backgroundAudioManager.initialize();

      const backgrounds = backgroundAudioManager.getBackgroundPresets();
      const sounds = backgroundAudioManager.getSoundPresets();

      setBackgroundAssets(backgrounds);
      setSoundAssets(sounds);

      // 기본값 선택
      if (backgrounds.length > 0) {
        setSelectedBackground(backgrounds[0].id);
        onBackgroundSelect?.(backgrounds[0]);
      }
      if (sounds.length > 0) {
        setSelectedSound(sounds[0].id);
        onSoundSelect?.(sounds[0]);
      }
    } catch (error) {
      console.error('Failed to initialize assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundSelect = (asset: BackgroundAsset) => {
    setSelectedBackground(asset.id);
    onBackgroundSelect?.(asset);
  };

  const handleSoundSelect = async (asset: SoundAsset) => {
    setSelectedSound(asset.id);
    onSoundSelect?.(asset);

    try {
      await backgroundAudioManager.loadAndPlaySound(asset, soundVolume);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const handleOpacityChange = (opacity: number) => {
    setBackgroundOpacity(opacity);
    onBackgroundOpacityChange?.(opacity);
  };

  const handleVolumeChange = (volume: number) => {
    setSoundVolume(volume);
    onSoundVolumeChange?.(volume);

    try {
      backgroundAudioManager.setVolume(volume);
    } catch (error) {
      console.error('Failed to set volume:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 탭 선택 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'background' && styles.tabActive]}
          onPress={() => setActiveTab('background')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'background' && styles.tabTextActive,
            ]}
          >
            🎬 배경
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sound' && styles.tabActive]}
          onPress={() => setActiveTab('sound')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'sound' && styles.tabTextActive,
            ]}
          >
            🔊 효과음
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d4af37" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      ) : (
        <>
          {/* 배경 영상 선택 */}
          {activeTab === 'background' && (
            <ScrollView style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>배경 영상 선택</Text>

              {backgroundAssets.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  style={[
                    styles.assetCard,
                    selectedBackground === asset.id && styles.assetCardSelected,
                  ]}
                  onPress={() => handleBackgroundSelect(asset)}
                >
                  {asset.thumbnail && (
                    <Image
                      source={{ uri: asset.thumbnail }}
                      style={styles.thumbnail}
                    />
                  )}

                  <View style={styles.assetInfo}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetDescription}>{asset.description}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{asset.category}</Text>
                    </View>
                  </View>

                  {selectedBackground === asset.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {/* 배경 투명도 조절 */}
              <View style={styles.controlSection}>
                <Text style={styles.controlLabel}>배경 투명도</Text>
                <View style={styles.sliderContainer}>
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                    <TouchableOpacity
                      key={opacity}
                      style={[
                        styles.sliderButton,
                        backgroundOpacity === opacity && styles.sliderButtonActive,
                      ]}
                      onPress={() => handleOpacityChange(opacity)}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          backgroundOpacity === opacity && styles.sliderButtonTextActive,
                        ]}
                      >
                        {Math.round(opacity * 100)}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}

          {/* 효과음 선택 */}
          {activeTab === 'sound' && (
            <ScrollView style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>효과음 선택</Text>

              {soundAssets.map((asset) => (
                <TouchableOpacity
                  key={asset.id}
                  style={[
                    styles.assetCard,
                    selectedSound === asset.id && styles.assetCardSelected,
                  ]}
                  onPress={() => handleSoundSelect(asset)}
                >
                  <View style={styles.soundIcon}>
                    <Text style={styles.soundIconText}>♪</Text>
                  </View>

                  <View style={styles.assetInfo}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetDescription}>{asset.description}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{asset.category}</Text>
                    </View>
                  </View>

                  {selectedSound === asset.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {/* 효과음 볼륨 조절 */}
              <View style={styles.controlSection}>
                <Text style={styles.controlLabel}>효과음 볼륨 (아주 미약하게)</Text>
                <View style={styles.sliderContainer}>
                  {[0.1, 0.15, 0.2, 0.25, 0.3].map((volume) => (
                    <TouchableOpacity
                      key={volume}
                      style={[
                        styles.sliderButton,
                        soundVolume === volume && styles.sliderButtonActive,
                      ]}
                      onPress={() => handleVolumeChange(volume)}
                    >
                      <Text
                        style={[
                          styles.sliderButtonText,
                          soundVolume === volume && styles.sliderButtonTextActive,
                        ]}
                      >
                        {Math.round(volume * 100)}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
    backgroundColor: '#0a0e27',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#d4af37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#d4af37',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#d4af37',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  assetCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1f3a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2a2f4a',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  assetCardSelected: {
    borderColor: '#d4af37',
    backgroundColor: '#0a0e27',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  soundIcon: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  soundIconText: {
    fontSize: 32,
    color: '#0a0e27',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  assetDescription: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d4af37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0a0e27',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0e27',
  },
  controlSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2f4a',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2a2f4a',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  sliderButtonActive: {
    borderColor: '#d4af37',
    backgroundColor: '#d4af37',
  },
  sliderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4af37',
  },
  sliderButtonTextActive: {
    color: '#0a0e27',
  },
});
