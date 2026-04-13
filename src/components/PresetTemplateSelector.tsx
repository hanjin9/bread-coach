import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { useTemplateStore } from '../store/templateStore';
import {
  PRESET_TEMPLATES,
  PRESET_CATEGORIES,
  getPresetsByCategory,
} from '../store/presetTemplates';

const { width } = Dimensions.get('window');

interface PresetTemplateSelectorProps {
  onSelectPreset?: (presetId: string) => void;
}

export default function PresetTemplateSelector({ onSelectPreset }: PresetTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof PRESET_CATEGORIES>('basic');
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_TEMPLATES[presetId];
    if (preset) {
      updateTemplate(preset);
      onSelectPreset?.(presetId);
    }
  };

  const currentPresets = getPresetsByCategory(selectedCategory);

  return (
    <View style={styles.container}>
      {/* 카테고리 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabContainer}
      >
        {Object.keys(PRESET_CATEGORIES).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category as keyof typeof PRESET_CATEGORIES)}
          >
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive,
              ]}
            >
              {getCategoryLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 프리셋 목록 */}
      <ScrollView style={styles.presetListContainer}>
        {currentPresets.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={styles.presetCard}
            onPress={() => handleSelectPreset(preset.id)}
          >
            {/* 프리셋 정보 */}
            <View style={styles.presetHeader}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <View style={styles.breathingBadge}>
                <Text style={styles.breathingText}>
                  {preset.breathing.inhale}-{preset.breathing.hold1}-{preset.breathing.exhale}
                </Text>
              </View>
            </View>

            {/* 호흡 패턴 시각화 */}
            <View style={styles.presetVisualization}>
              <View style={styles.visualizationBar}>
                {/* 들숨 */}
                <View
                  style={[
                    styles.breathPhase,
                    {
                      flex: preset.breathing.inhale,
                      backgroundColor: '#4a9eff',
                    },
                  ]}
                >
                  <Text style={styles.phaseLabel}>In</Text>
                </View>

                {/* 정지 1 */}
                {preset.breathing.hold1 > 0 && (
                  <View
                    style={[
                      styles.breathPhase,
                      {
                        flex: preset.breathing.hold1,
                        backgroundColor: '#d4af37',
                      },
                    ]}
                  >
                    <Text style={styles.phaseLabel}>Hold</Text>
                  </View>
                )}

                {/* 날숨 */}
                <View
                  style={[
                    styles.breathPhase,
                    {
                      flex: preset.breathing.exhale,
                      backgroundColor: '#90ee90',
                    },
                  ]}
                >
                  <Text style={styles.phaseLabel}>Out</Text>
                </View>

                {/* 정지 2 */}
                {preset.breathing.hold2 > 0 && (
                  <View
                    style={[
                      styles.breathPhase,
                      {
                        flex: preset.breathing.hold2,
                        backgroundColor: '#d4af37',
                      },
                    ]}
                  >
                    <Text style={styles.phaseLabel}>Hold</Text>
                  </View>
                )}
              </View>
            </View>

            {/* 프리셋 특징 */}
            <View style={styles.presetFeatures}>
              {/* 스타일 */}
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>스타일:</Text>
                <Text style={styles.featureValue}>
                  {preset.style === 'standard' ? '표준' : '변형'}
                </Text>
              </View>

              {/* 파이프라인 색상 */}
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>색상:</Text>
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: preset.pipeline.color },
                  ]}
                />
              </View>

              {/* 배경 여부 */}
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>배경:</Text>
                <Text style={styles.featureValue}>
                  {preset.background.image ? '있음' : '없음'}
                </Text>
              </View>

              {/* 효과음 여부 */}
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>음성:</Text>
                <Text style={styles.featureValue}>
                  {preset.sound.url ? '있음' : '없음'}
                </Text>
              </View>
            </View>

            {/* 선택 버튼 */}
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelectPreset(preset.id)}
            >
              <Text style={styles.selectButtonText}>이 프리셋 사용</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    basic: '기본',
    advanced: '고급',
    wellness: '웰니스',
    premium: '프리미엄',
    minimal: '미니멀',
  };
  return labels[category] || category;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  categoryTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2f4a',
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d4af37',
    backgroundColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: '#d4af37',
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d4af37',
  },
  categoryTabTextActive: {
    color: '#0a0e27',
  },
  presetListContainer: {
    flex: 1,
    padding: 12,
  },
  presetCard: {
    backgroundColor: '#1a1f3a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2f4a',
    padding: 16,
    marginBottom: 12,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  presetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  breathingBadge: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  breathingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0e27',
  },
  presetVisualization: {
    marginBottom: 12,
  },
  visualizationBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 2,
  },
  breathPhase: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  presetFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureLabel: {
    fontSize: 11,
    color: '#aaa',
  },
  featureValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d4af37',
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  selectButton: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0e27',
  },
});
