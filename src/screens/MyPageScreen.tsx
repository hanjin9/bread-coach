import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Header, Card, Button, Badge } from '@/components';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { useAuthStore } from '@/store/authStore';

export const MyPageScreen: React.FC = () => {
  const { user, reset } = useAuthStore();

  const handleLogout = () => {
    reset();
  };

  return (
    <View style={styles.container}>
      <Header title="마이 페이지" />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.profileHeader}>
            <View style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || '사용자'}</Text>
              <Badge label={user?.subscriptionStatus || 'free'} />
            </View>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>구독 정보</Text>
          <Text style={styles.infoText}>
            상태: {user?.subscriptionStatus === 'free' ? '무료' : '프리미엄'}
          </Text>
          {user?.subscriptionExpiresAt && (
            <Text style={styles.infoText}>
              만료: {new Date(user.subscriptionExpiresAt).toLocaleDateString('ko-KR')}
            </Text>
          )}
          <Button title="업그레이드" onPress={() => {}} style={styles.button} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>설정</Text>
          <Button title="알림 설정" onPress={() => {}} variant="outline" />
          <Button title="언어 설정" onPress={() => {}} variant="outline" />
          <Button title="개인정보 보호" onPress={() => {}} variant="outline" />
        </Card>

        <Card>
          <Button
            title="로그아웃"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.marble,
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
    marginVertical: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});
