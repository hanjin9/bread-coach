import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setToken, setAuthenticated } = useAuthStore();

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.login({ email, password });
      setUser(response.user);
      setToken(response.token);
      setAuthenticated(true);
      router.replace('/(app)/home');
    } catch (err: any) {
      setError(err.message || '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      // Google OAuth 로직 (Firebase)
      // const response = await signInWithGoogle();
      // setUser(response.user);
      // setToken(response.token);
      // setAuthenticated(true);
      // router.replace('/(app)/home');
    } catch (err: any) {
      setError(err.message || 'Google 로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    router.push('/(auth)/phone-verification');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>Bread Coach</Text>
        <Text style={styles.subtitle}>호흡으로 건강을 관리하세요</Text>
      </View>

      {/* 에러 메시지 */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* 이메일 로그인 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>이메일 로그인</Text>
        <TextInput
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        <Button
          title="로그인"
          onPress={handleEmailLogin}
          loading={loading}
          style={styles.button}
        />
      </View>

      {/* 구분선 */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* 소셜 로그인 */}
      <View style={styles.section}>
        <Button
          title="Google로 로그인"
          onPress={handleGoogleLogin}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="휴대폰으로 로그인"
          onPress={handlePhoneLogin}
          variant="outline"
          style={styles.button}
        />
      </View>

      {/* 하단 링크 */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={styles.link}>비밀번호 재설정</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.link}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  button: {
    marginVertical: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.marble,
  },
  dividerText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.xl,
  },
  link: {
    ...typography.bodySm,
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
});
