import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface LeftPanelProps {
  selectedLayer: string;
  onSelectLayer: (layer: string) => void;
}

const LAYERS = [
  { id: 'background', name: '배경', icon: '🖼️' },
  { id: 'pipeline', name: '파이프라인', icon: '🔗' },
  { id: 'orb', name: '구슬', icon: '⭕' },
  { id: 'sound', name: '효과음', icon: '🔊' },
];

export default function LeftPanel({ selectedLayer, onSelectLayer }: LeftPanelProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>레이어</Text>

      {LAYERS.map((layer) => (
        <TouchableOpacity
          key={layer.id}
          style={[
            styles.layerItem,
            selectedLayer === layer.id && styles.layerItemSelected,
          ]}
          onPress={() => onSelectLayer(layer.id)}
        >
          <Text style={styles.layerIcon}>{layer.icon}</Text>
          <Text style={styles.layerName}>{layer.name}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.divider} />

      <Text style={styles.title}>프리셋</Text>

      <TouchableOpacity style={styles.presetItem}>
        <Text style={styles.presetName}>기본 (4-7-8)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.presetItem}>
        <Text style={styles.presetName}>럭셔리 골드</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.presetItem}>
        <Text style={styles.presetName}>미니멀</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f3a',
  },
  title: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  layerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginVertical: 3,
    borderRadius: 6,
    backgroundColor: '#2a2f4a',
  },
  layerItemSelected: {
    backgroundColor: '#d4af37',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  layerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  layerName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#d4af37',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  presetItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    marginVertical: 3,
    borderRadius: 6,
    backgroundColor: '#2a2f4a',
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  presetName: {
    color: '#d4af37',
    fontSize: 11,
    fontWeight: '500',
  },
});
