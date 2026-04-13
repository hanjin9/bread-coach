import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useTemplateStore } from '../store/templateStore';
import EditorCanvas from '../components/EditorCanvas';
import LeftPanel from '../components/LeftPanel';
import RightPanel from '../components/RightPanel';
import BottomPanel from '../components/BottomPanel';

const { width, height } = Dimensions.get('window');

export default function TemplateEditor() {
  const [selectedLayer, setSelectedLayer] = useState<string>('pipeline');
  const [showPreview, setShowPreview] = useState(false);
  
  const template = useTemplateStore((state) => state.template);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>호흡 영상 템플릿 에디터</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.previewBtn} onPress={() => setShowPreview(!showPreview)}>
            <Text style={styles.btnText}>미리보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.btnText}>저장</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.btnText}>영상 생성</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 메인 편집 영역 */}
      <View style={styles.editorContainer}>
        {/* 좌측 패널 - 레이어 관리 */}
        <View style={styles.leftPanel}>
          <LeftPanel selectedLayer={selectedLayer} onSelectLayer={setSelectedLayer} />
        </View>

        {/* 중앙 캔버스 */}
        <View style={styles.canvasArea}>
          <EditorCanvas selectedLayer={selectedLayer} />
        </View>

        {/* 우측 패널 - 속성 조절 */}
        <View style={styles.rightPanel}>
          <RightPanel selectedLayer={selectedLayer} />
        </View>
      </View>

      {/* 하단 패널 - 호흡 패턴 */}
      <View style={styles.bottomPanel}>
        <BottomPanel />
      </View>

      {/* 미리보기 모달 */}
      {showPreview && (
        <View style={styles.previewModal}>
          <TouchableOpacity 
            style={styles.closeBtn}
            onPress={() => setShowPreview(false)}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          {/* 미리보기 플레이어 */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    backgroundColor: '#1a1f3a',
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#d4af37',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBtn: {
    backgroundColor: '#2a2f4a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d4af37',
  },
  saveBtn: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  exportBtn: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnText: {
    color: '#0a0e27',
    fontWeight: 'bold',
    fontSize: 12,
  },
  editorContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: width * 0.2,
    backgroundColor: '#1a1f3a',
    borderRightWidth: 1,
    borderRightColor: '#d4af37',
    padding: 10,
  },
  canvasArea: {
    flex: 1,
    backgroundColor: '#0a0e27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightPanel: {
    width: width * 0.25,
    backgroundColor: '#1a1f3a',
    borderLeftWidth: 1,
    borderLeftColor: '#d4af37',
    padding: 10,
  },
  bottomPanel: {
    height: 120,
    backgroundColor: '#1a1f3a',
    borderTopWidth: 1,
    borderTopColor: '#d4af37',
    padding: 10,
  },
  previewModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: '#d4af37',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#0a0e27',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
