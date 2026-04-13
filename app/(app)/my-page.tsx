import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MyPageScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 프로필 섹션 */}
      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.profileImage}>
            <Text style={styles.profileInitial}>{user?.name?.[0] || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || '사용자'}</Text>
            <Text style={styles.profileEmail}>{user?.email || user?.phone}</Text>
          </View>
        </View>
      </Card>

      {/* 구독 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>구독 정보</Text>
        <Card style={styles.subscriptionCard}>
          <View>
            <Text style={styles.subscriptionStatus}>
              {user?.subscriptionStatus === 'free' ? '무료' : '프리미엄'}
            </Text>
            {user?.subscriptionExpiresAt && (
              <Text style={styles.subscriptionExpiry}>
                만료: {new Date(user.subscriptionExpiresAt).toLocaleDateString('ko-KR')}
              </Text>
            )}
          </View>
        </Card>
      </View>

      {/* 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>통계</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>완료</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>연속</Text>
          </Card>
        </View>
      </View>

      {/* 액션 버튼 */}
      <View style={styles.section}>
        <Button
          title="프로필 수정"
          onPress={() => router.push('/(app)/edit-profile')}
          style={styles.button}
        />
        <Button
          title="로그아웃"
          onPress={handleLogout}
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
  profileCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInitial: {
    ...typography.h2,
    color: colors.textInverse,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  profileEmail: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  subscriptionCard: {
    padding: spacing.md,
  },
  subscriptionStatus: {
    ...typography.bodyBold,
    color: colors.secondary,
  },
  subscriptionExpiry: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.secondary,
  },
  statLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  button: {
    marginVertical: spacing.sm,
  },
});
