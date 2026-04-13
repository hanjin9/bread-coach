import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useTemplateStore } from '../store/templateStore';

export default function BottomPanel() {
  const template = useTemplateStore((state) => state.template);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);

  const [inhale, setInhale] = useState(template.breathing.inhale.toString());
  const [hold1, setHold1] = useState(template.breathing.hold1.toString());
  const [exhale, setExhale] = useState(template.breathing.exhale.toString());
  const [hold2, setHold2] = useState(template.breathing.hold2.toString());

  const handleUpdate = () => {
    updateTemplate({
      ...template,
      breathing: {
        inhale: parseInt(inhale) || 4,
        hold1: parseInt(hold1) || 7,
        exhale: parseInt(exhale) || 8,
        hold2: parseInt(hold2) || 0,
      },
    });
  };

  const totalTime = (parseInt(inhale) || 0) + (parseInt(hold1) || 0) + (parseInt(exhale) || 0) + (parseInt(hold2) || 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>호흡 패턴 설정</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>들숨 (초)</Text>
          <TextInput
            style={styles.input}
            value={inhale}
            onChangeText={setInhale}
            keyboardType="numeric"
            onBlur={handleUpdate}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>정지 1 (초)</Text>
          <TextInput
            style={styles.input}
            value={hold1}
            onChangeText={setHold1}
            keyboardType="numeric"
            onBlur={handleUpdate}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>날숨 (초)</Text>
          <TextInput
            style={styles.input}
            value={exhale}
            onChangeText={setExhale}
            keyboardType="numeric"
            onBlur={handleUpdate}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>정지 2 (초)</Text>
          <TextInput
            style={styles.input}
            value={hold2}
            onChangeText={setHold2}
            keyboardType="numeric"
            onBlur={handleUpdate}
          />
        </View>
      </ScrollView>

      <View style={styles.infoRow}>
        <Text style={styles.info}>총 시간: {totalTime}초</Text>
        <TouchableOpacity style={styles.presetBtn} onPress={() => {
          setInhale('4');
          setHold1('7');
          setExhale('8');
          setHold2('0');
          handleUpdate();
        }}>
          <Text style={styles.presetBtnText}>4-7-8 프리셋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f3a',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  title: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputGroup: {
    marginRight: 15,
  },
  label: {
    color: '#ffffff',
    fontSize: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2a2f4a',
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#d4af37',
    width: 60,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: 'bold',
  },
  presetBtn: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetBtnText: {
    color: '#0a0e27',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
