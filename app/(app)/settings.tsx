import React from 'react';
import { View, ScrollView, StyleSheet, Text, Switch, Picker } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { Card } from '@/components/ui/Card';

export default function SettingsScreen() {
  const {
    language,
    fontSize,
    notificationsEnabled,
    darkMode,
    setLanguage,
    setFontSize,
    setNotificationsEnabled,
    setDarkMode,
  } = useSettingsStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
      </View>

      {/* 언어 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>언어</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>언어 선택</Text>
            <Picker
              selectedValue={language}
              onValueChange={setLanguage}
              style={styles.picker}
            >
              <Picker.Item label="한국어" value="ko" />
              <Picker.Item label="English" value="en" />
              <Picker.Item label="日本語" value="ja" />
              <Picker.Item label="中文" value="zh" />
            </Picker>
          </View>
        </Card>
      </View>

      {/* 글자 크기 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>글자 크기</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>크기 조정</Text>
            <Picker
              selectedValue={fontSize}
              onValueChange={setFontSize}
              style={styles.picker}
            >
              <Picker.Item label="작음" value="small" />
              <Picker.Item label="보통" value="normal" />
              <Picker.Item label="큼" value="large" />
              <Picker.Item label="매우 큼" value="extra-large" />
            </Picker>
          </View>
        </Card>
      </View>

      {/* 알림 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>푸시 알림</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.marble, true: colors.secondary }}
              thumbColor={colors.secondary}
            />
          </View>
        </Card>
      </View>

      {/* 테마 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>테마</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>다크 모드</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.marble, true: colors.secondary }}
              thumbColor={colors.secondary}
            />
          </View>
        </Card>
      </View>

      {/* 앱 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <Card style={styles.settingCard}>
          <View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>버전</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={[styles.infoRow, styles.borderTop]}>
              <Text style={styles.infoLabel}>개발사</Text>
              <Text style={styles.infoValue}>Bread Coach</Text>
            </View>
          </View>
        </Card>
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
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingCard: {
    padding: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  picker: {
    flex: 1,
    color: colors.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.marble,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  infoValue: {
    ...typography.body,
    color: colors.secondary,
  },
});
