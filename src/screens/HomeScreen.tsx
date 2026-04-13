import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Header, Card, Button, BreathingAnimation } from '@/components';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { BREATHING_PATTERNS } from '@/constants';

export const HomeScreen: React.FC = () => {
  const [isBreathing, setIsBreathing] = useState(false);

  const pattern = BREATHING_PATTERNS.FOUR_SEVEN_EIGHT;

  return (
    <View style={styles.container}>
      <Header title="Bread Coach" />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.sectionTitle}>오늘의 호흡 가이드</Text>
          <BreathingAnimation
            pattern={pattern}
            pipelineConfig={{
              color: colors.secondary,
              width: 3,
              curveType: 'bezier',
              startX: 20,
              endX: 300,
              startY: 100,
              endY: 150,
            }}
            orbConfig={{
              color: colors.secondary,
              size: 24,
              texture: 'glossy',
              opacity: 1,
            }}
            isRunning={isBreathing}
          />

          <View style={styles.patternInfo}>
            <Text style={styles.patternText}>
              들숨: {pattern.inhale}초 | 정지: {pattern.hold}초 | 날숨: {pattern.exhale}초
            </Text>
          </View>

          <Button
            title={isBreathing ? '멈추기' : '시작하기'}
            onPress={() => setIsBreathing(!isBreathing)}
            style={styles.button}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>이번주 기록</Text>
          <Text style={styles.statsText}>완료: 5/7 회</Text>
          <Text style={styles.statsText}>총 시간: 35분</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>추천 호흡법</Text>
          <Button title="박스 호흡법" onPress={() => {}} variant="outline" />
          <Button title="확장된 날숨" onPress={() => {}} variant="outline" />
          <Button title="일관된 호흡" onPress={() => {}} variant="outline" />
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
  patternInfo: {
    marginVertical: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.marble,
    borderRadius: 8,
  },
  patternText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
  },
  statsText: {
    ...typography.body,
    color: colors.textPrimary,
    marginVertical: spacing.sm,
  },
});
