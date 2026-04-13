import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Switch, FlatList } from 'react-native';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ScheduleItem {
  id: string;
  time: string;
  days: string[];
  isActive: boolean;
}

export default function ScheduleScreen() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    { id: '1', time: '08:00', days: ['MON', 'WED', 'FRI'], isActive: true },
    { id: '2', time: '20:00', days: ['MON', 'TUE', 'WED', 'THU', 'FRI'], isActive: true },
  ]);

  const toggleSchedule = (id: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>호흡 스케줄</Text>
        <Text style={styles.subtitle}>정기적인 호흡 시간을 설정하세요</Text>
      </View>

      <View style={styles.section}>
        <Button
          title="새 스케줄 추가"
          onPress={() => {}}
          style={styles.addButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 스케줄</Text>
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.scheduleCard}>
              <View style={styles.scheduleContent}>
                <View>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                  <Text style={styles.scheduleDays}>{item.days.join(', ')}</Text>
                </View>
                <Switch
                  value={item.isActive}
                  onValueChange={() => toggleSchedule(item.id)}
                  trackColor={{ false: colors.marble, true: colors.secondary }}
                  thumbColor={colors.secondary}
                />
              </View>
            </Card>
          )}
          scrollEnabled={false}
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
  addButton: {
    marginBottom: spacing.md,
  },
  scheduleCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  scheduleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTime: {
    ...typography.h4,
    color: colors.secondary,
  },
  scheduleDays: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
