import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardScreen() {
  const [inhale, setInhale] = useState('4');
  const [hold, setHold] = useState('7');
  const [exhale, setExhale] = useState('8');

  const handleGenerateVideo = () => {
    // 영상 생성 로직
    console.log(`호흡 패턴: ${inhale}-${hold}-${exhale}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>관리자 대시보드</Text>
        <Text style={styles.subtitle}>호흡 템플릿 생성 및 관리</Text>
      </View>

      {/* 호흡 패턴 입력 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>호흡 패턴 설정</Text>
        <Card style={styles.patternCard}>
          <View style={styles.patternRow}>
            <View style={styles.patternInput}>
              <Text style={styles.patternLabel}>들숨 (초)</Text>
              <TextInput
                style={styles.input}
                value={inhale}
                onChangeText={setInhale}
                keyboardType="numeric"
                placeholder="4"
              />
            </View>
            <View style={styles.patternInput}>
              <Text style={styles.patternLabel}>정지 (초)</Text>
              <TextInput
                style={styles.input}
                value={hold}
                onChangeText={setHold}
                keyboardType="numeric"
                placeholder="7"
              />
            </View>
            <View style={styles.patternInput}>
              <Text style={styles.patternLabel}>날숨 (초)</Text>
              <TextInput
                style={styles.input}
                value={exhale}
                onChangeText={setExhale}
                keyboardType="numeric"
                placeholder="8"
              />
            </View>
          </View>
        </Card>
      </View>

      {/* 템플릿 미리보기 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>미리보기</Text>
        <Card style={styles.previewCard}>
          <Text style={styles.previewTitle}>호흡 패턴: {inhale}-{hold}-{exhale}</Text>
          <Text style={styles.previewDescription}>
            들숨 {inhale}초 → 정지 {hold}초 → 날숨 {exhale}초
          </Text>
        </Card>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.section}>
        <Button
          title="영상 생성"
          onPress={handleGenerateVideo}
          style={styles.button}
        />
        <Button
          title="템플릿 저장"
          onPress={() => {}}
          variant="outline"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.marble,
  },
  title: {
    ...typography.h2,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  patternCard: {
    padding: spacing.md,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patternInput: {
    flex: 1,
    marginRight: spacing.md,
  },
  patternLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.marble,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.textPrimary,
    ...typography.body,
  },
  previewCard: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  previewTitle: {
    ...typography.bodyBold,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  previewDescription: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  button: {
    marginVertical: spacing.sm,
  },
});
