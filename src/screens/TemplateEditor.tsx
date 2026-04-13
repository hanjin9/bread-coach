import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import BreathingPipelineEngine from '../components/BreathingPipelineEngine';
import BreathingPipelinePenetrationEngine from '../components/BreathingPipelinePenetrationEngine';
import { useTemplateStore } from '../store/templateStore';

const { width, height } = Dimensions.get('window');

export default function TemplateEditor() {
  const [style, setStyle] = useState<'standard' | 'penetration'>('standard');
  const [isPlaying, setIsPlaying] = useState(true);

  const template = useTemplateStore((state) => state.template);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);

  const handleStyleChange = (newStyle: 'standard' | 'penetration') => {
    setStyle(newStyle);
    updateTemplate({
      ...template,
      style: newStyle,
    });
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Breathing Template Editor</Text>
        <Text style={styles.subtitle}>
          {style === 'standard' ? '구슬이 파이프라인을 따라 이동' : '파이프라인이 구슬을 관통하며 이동'}
        </Text>
      </View>

      {/* 스타일 선택 버튼 */}
      <View style={styles.styleSelector}>
        <TouchableOpacity
          style={[
            styles.styleButton,
            style === 'standard' && styles.styleButtonActive,
          ]}
          onPress={() => handleStyleChange('standard')}
        >
          <Text
            style={[
              styles.styleButtonText,
              style === 'standard' && styles.styleButtonTextActive,
            ]}
          >
            Style 1: Standard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.styleButton,
            style === 'penetration' && styles.styleButtonActive,
          ]}
          onPress={() => handleStyleChange('penetration')}
        >
          <Text
            style={[
              styles.styleButtonText,
              style === 'penetration' && styles.styleButtonTextActive,
            ]}
          >
            Style 2: Penetration
          </Text>
        </TouchableOpacity>
      </View>

      {/* 미리보기 영역 */}
      <ScrollView style={styles.previewArea}>
        {style === 'standard' ? (
          <BreathingPipelineEngine
            pipeline={template.pipeline}
            orb={template.orb}
            breathing={template.breathing}
            isPlaying={isPlaying}
          />
        ) : (
          <BreathingPipelinePenetrationEngine
            pipeline={template.pipeline}
            orb={template.orb}
            breathing={template.breathing}
            isPlaying={isPlaying}
          />
        )}
      </ScrollView>

      {/* 제어 버튼 */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.playButton]}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.buttonText}>{isPlaying ? '⏸ Pause' : '▶ Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.generateButton]}
          onPress={() => {
            // 영상 생성 로직
            console.log('Generating video with style:', style);
          }}
        >
          <Text style={styles.buttonText}>🎬 Generate Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#d4af37',
  },
  styleSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d4af37',
    backgroundColor: 'transparent',
  },
  styleButtonActive: {
    backgroundColor: '#d4af37',
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d4af37',
    textAlign: 'center',
  },
  styleButtonTextActive: {
    color: '#0a0e27',
  },
  previewArea: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4af37',
    overflow: 'hidden',
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#d4af37',
  },
  generateButton: {
    backgroundColor: '#4a9eff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
