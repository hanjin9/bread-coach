import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/styles/colors';

export default function App() {
  const { isAuthenticated, setLoading } = useAuthStore();

  useEffect(() => {
    // 앱 시작 시 인증 상태 확인
    setLoading(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: colors.secondary,
            background: colors.background,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.border,
            notification: colors.error,
          },
        }}
      >
        <RootNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
