import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Header, Card, Button, TextInput } from '@/components';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { BREATHING_PATTERNS } from '@/constants';

export const AdminDashboardScreen: React.FC = () => {
  const [selectedPattern, setSelectedPattern] = useState('FOUR_SEVEN_EIGHT');
  const [backgroundColor, setBackgroundColor] = useState('#d4af37');
  const [pipelineWidth, setPipelineWidth] = useState('3');

  return (
    <View style={styles.container}>
      <Header title="관리자 대시보드" />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>호흡 패턴 선택</Text>
          {Object.entries(BREATHING_PATTERNS).map(([key, pattern]) => (
            <Button
              key={key}
              title={`${pattern.inhale}-${pattern.hold}-${pattern.exhale}`}
              onPress={() => setSelectedPattern(key)}
              variant={selectedPattern === key ? 'primary' : 'outline'}
              style={styles.patternButton}
            />
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>파이프라인 설정</Text>
          <TextInput
            label="색상 (Hex)"
            value={backgroundColor}
            onChangeText={setBackgroundColor}
            placeholder="#d4af37"
          />
          <TextInput
            label="굵기 (픽셀)"
            value={pipelineWidth}
            onChangeText={setPipelineWidth}
            placeholder="3"
            keyboardType="numeric"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>배경 & 효과음</Text>
          <Button title="배경 이미지 선택" onPress={() => {}} variant="outline" />
          <Button title="효과음 선택" onPress={() => {}} variant="outline" />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>프리셋 저장</Text>
          <TextInput
            label="프리셋 이름"
            placeholder="예: 명상용 호흡"
          />
          <Button title="저장" onPress={() => {}} style={styles.button} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>영상 생성</Text>
          <Button title="미리보기" onPress={() => {}} variant="outline" />
          <Button title="영상 생성" onPress={() => {}} style={styles.generateButton} />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  patternButton: {
    marginVertical: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  generateButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.success,
  },
});
