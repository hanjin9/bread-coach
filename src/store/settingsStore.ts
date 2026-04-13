import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SettingsStore } from '@/types';

interface SettingsStoreState extends SettingsStore {
  // Additional methods can be added here
}

export const useSettingsStore = create<SettingsStoreState>()(
  persist(
    (set) => ({
      language: 'ko',
      fontSize: 'normal',
      notificationsEnabled: true,
      darkMode: true,

      setLanguage: (lang) => set({ language: lang }),

      setFontSize: (size) => set({ fontSize: size }),

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

      setDarkMode: (enabled) => set({ darkMode: enabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
