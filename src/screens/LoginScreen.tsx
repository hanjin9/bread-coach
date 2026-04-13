import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, TextInput, Card } from '@/components';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, setToken, setAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({
        email,
        password,
      });

      setUser(response.user);
      setToken(response.token);
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Bread Coach</Text>
        <Text style={styles.subtitle}>호흡 가이드 앱</Text>
      </View>

      <Card>
        <TextInput
          label="이메일"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <TextInput
          label="비밀번호"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          title="로그인"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
        />
      </Card>

      <View style={styles.divider}>
        <Text style={styles.dividerText}>또는</Text>
      </View>

      <Button
        title="Google로 로그인"
        onPress={() => {}}
        variant="outline"
        style={styles.socialButton}
      />

      <Button
        title="휴대폰 번호로 로그인"
        onPress={() => {}}
        variant="outline"
        style={styles.socialButton}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>계정이 없으신가요? </Text>
        <Button
          title="회원가입"
          onPress={() => {}}
          variant="ghost"
        />
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.secondary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginVertical: spacing.md,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  socialButton: {
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
