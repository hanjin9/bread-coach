import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

// 화면 임포트
import HomeScreen from './home';
import ScheduleScreen from './schedule';
import MyPageScreen from './my-page';
import SettingsScreen from './settings';

// 새로운 화면 임포트 (추가될 예정)
const MeditationScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;
const CommunityScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;
const ShoppingScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;
const TodayBreathingScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;
const MusicBreathingScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;

const Tab = createBottomTabNavigator();

// 커스텀 탭바 컴포넌트
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  // 탭 배열 정의 (홈 중앙 배치)
  const tabs = [
    { key: 'meditation', label: '명상', icon: 'meditation' },
    { key: 'community', label: '커뮤니티', icon: 'forum' },
    { key: 'shopping', label: '쇼핑', icon: 'shopping-bag' },
    { key: 'home', label: '홈', icon: 'home', isCenter: true },
    { key: 'my-page', label: '마이', icon: 'account-circle' },
    { key: 'today-breathing', label: '오늘의 호흡', icon: 'wind-power' },
    { key: 'music-breathing', label: '음악 호흡', icon: 'music' },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: insets.bottom + 8 },
      ]}
    >
      <View style={styles.tabContainer}>
        {/* 좌측 탭 (명상, 커뮤니티, 쇼핑) */}
        <View style={styles.tabGroup}>
          {tabs.slice(0, 3).map((tab, index) => {
            const isFocused = state.index === index;
            return (
              <TabBarItem
                key={tab.key}
                tab={tab}
                isFocused={isFocused}
                onPress={() => navigation.navigate(tab.key)}
              />
            );
          })}
        </View>

        {/* 중앙 홈 버튼 */}
        <TabBarItem
          tab={tabs[3]}
          isFocused={state.index === 3}
          onPress={() => navigation.navigate('home')}
          isCenter
        />

        {/* 우측 탭 (마이, 오늘의 호흡, 음악 호흡) */}
        <View style={styles.tabGroup}>
          {tabs.slice(4, 7).map((tab, index) => {
            const isFocused = state.index === 4 + index;
            return (
              <TabBarItem
                key={tab.key}
                tab={tab}
                isFocused={isFocused}
                onPress={() => navigation.navigate(tab.key)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

// 탭바 아이템 컴포넌트
const TabBarItem = ({ tab, isFocused, onPress, isCenter }: any) => {
  return (
    <TouchableOpacity
      style={[
        styles.tabItem,
        isCenter && styles.centerTabItem,
        isFocused && !isCenter && styles.focusedTabItem,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isCenter ? (
        <View style={[styles.centerButton, isFocused && styles.centerButtonFocused]}>
          <MaterialCommunityIcons
            name={tab.icon}
            size={28}
            color={colors.secondary}
          />
        </View>
      ) : (
        <>
          <MaterialCommunityIcons
            name={tab.icon}
            size={24}
            color={isFocused ? colors.secondary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              isFocused && styles.focusedTabLabel,
            ]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default function AppLayout() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomColor: colors.marble,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.secondary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="meditation"
        component={MeditationScreen}
        options={{ title: '명상' }}
      />
      <Tab.Screen
        name="community"
        component={CommunityScreen}
        options={{ title: '커뮤니티' }}
      />
      <Tab.Screen
        name="shopping"
        component={ShoppingScreen}
        options={{ title: '쇼핑' }}
      />
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{ title: '홈' }}
      />
      <Tab.Screen
        name="my-page"
        component={MyPageScreen}
        options={{ title: '마이' }}
      />
      <Tab.Screen
        name="today-breathing"
        component={TodayBreathingScreen}
        options={{ title: '오늘의 호흡' }}
      />
      <Tab.Screen
        name="music-breathing"
        component={MusicBreathingScreen}
        options={{ title: '음악 호흡' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.primary,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
    paddingTop: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  tabGroup: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  centerTabItem: {
    marginHorizontal: 16,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButtonFocused: {
    borderColor: colors.secondary,
    shadowOpacity: 0.5,
  },
  focusedTabItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  focusedTabLabel: {
    color: colors.secondary,
    fontWeight: '700',
  },
});
