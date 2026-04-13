import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTemplateStore } from '../store/templateStore';

interface RightPanelProps {
  selectedLayer: string;
}

export default function RightPanel({ selectedLayer }: RightPanelProps) {
  const template = useTemplateStore((state) => state.template);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);

  const renderPipelineControls = () => (
    <View style={styles.controlGroup}>
      <Text style={styles.sectionTitle}>파이프라인</Text>

      {/* 굵기 조절 */}
      <View style={styles.control}>
        <Text style={styles.label}>굵기: {template.pipeline.thickness}px</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={50}
          value={template.pipeline.thickness}
          onValueChange={(value) =>
            updateTemplate({
              ...template,
              pipeline: { ...template.pipeline, thickness: value },
            })
          }
          minimumTrackTintColor="#d4af37"
          maximumTrackTintColor="#333"
        />
      </View>

      {/* 곡률 조절 */}
      <View style={styles.control}>
        <Text style={styles.label}>곡률: {template.pipeline.curvature}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={template.pipeline.curvature}
          onValueChange={(value) =>
            updateTemplate({
              ...template,
              pipeline: { ...template.pipeline, curvature: value },
            })
          }
          minimumTrackTintColor="#d4af37"
          maximumTrackTintColor="#333"
        />
      </View>

      {/* 시작 지점 연장 */}
      <View style={styles.control}>
        <Text style={styles.label}>시작 연장: {template.pipeline.startExtend}px</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={template.pipeline.startExtend}
          onValueChange={(value) =>
            updateTemplate({
              ...template,
              pipeline: { ...template.pipeline, startExtend: value },
            })
          }
          minimumTrackTintColor="#d4af37"
          maximumTrackTintColor="#333"
        />
      </View>

      {/* 끝 지점 연장 */}
      <View style={styles.control}>
        <Text style={styles.label}>끝 연장: {template.pipeline.endExtend}px</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={template.pipeline.endExtend}
          onValueChange={(value) =>
            updateTemplate({
              ...template,
              pipeline: { ...template.pipeline, endExtend: value },
            })
          }
          minimumTrackTintColor="#d4af37"
          maximumTrackTintColor="#333"
        />
      </View>

      {/* 색상 선택 */}
      <View style={styles.control}>
        <Text style={styles.label}>색상</Text>
        <View style={styles.colorPicker}>
          {['#d4af37', '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                template.pipeline.color === color && styles.colorSelected,
              ]}
              onPress={() =>
                updateTemplate({
                  ...template,
                  pipeline: { ...template.pipeline, color },
                })
              }
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderOrbControls = () => (
    <View style={styles.controlGroup}>
      <Text style={styles.sectionTitle}>구슬</Text>

      {/* 크기 조절 */}
      <View style={styles.control}>
        <Text style={styles.label}>크기: {template.orb.size}px</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={100}
          value={template.orb.size}
          onValueChange={(value) =>
            updateTemplate({
              ...template,
              orb: { ...template.orb, size: value },
            })
          }
          minimumTrackTintColor="#d4af37"
          maximumTrackTintColor="#333"
        />
      </View>

      {/* 투명도 조절 */}
      <View style={styles.control}>
        <Text style={styles.label}>투명도: {(template.orb.opacity * 100).toFixed(0)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={template.orb.opacity}
          onValueChange={(value) =>
            updateTemplate({
              ...template,
              orb: { ...template.orb, opacity: value },
            })
          }
          minimumTrackTintColor="#d4af37"
          maximumTrackTintColor="#333"
        />
      </View>

      {/* 색상 선택 */}
      <View style={styles.control}>
        <Text style={styles.label}>색상</Text>
        <View style={styles.colorPicker}>
          {['#d4af37', '#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                template.orb.color === color && styles.colorSelected,
              ]}
              onPress={() =>
                updateTemplate({
                  ...template,
                  orb: { ...template.orb, color },
                })
              }
            />
          ))}
        </View>
      </View>

      {/* 질감 선택 */}
      <View style={styles.control}>
        <Text style={styles.label}>질감</Text>
        <View style={styles.textureOptions}>
          {['glossy', 'matte', 'metallic'].map((texture) => (
            <TouchableOpacity
              key={texture}
              style={[
                styles.textureBtn,
                template.orb.texture === texture && styles.textureSelected,
              ]}
              onPress={() =>
                updateTemplate({
                  ...template,
                  orb: { ...template.orb, texture },
                })
              }
            >
              <Text style={styles.textureBtnText}>{texture}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {selectedLayer === 'pipeline' && renderPipelineControls()}
      {selectedLayer === 'orb' && renderOrbControls()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f3a',
  },
  controlGroup: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  sectionTitle: {
    color: '#d4af37',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  control: {
    marginBottom: 15,
  },
  label: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#ffffff',
  },
  textureOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  textureBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#2a2f4a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  textureSelected: {
    backgroundColor: '#d4af37',
  },
  textureBtnText: {
    color: '#0a0e27',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
