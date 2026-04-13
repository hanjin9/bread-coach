import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { typography, spacing, screenDimensions } from '@/styles/spacing';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            {
              borderTopColor: activeTab === tab.id ? colors.secondary : 'transparent',
            },
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          {tab.icon && <View style={styles.icon}>{tab.icon}</View>}
          <Text
            style={[
              styles.label,
              {
                color: activeTab === tab.id ? colors.secondary : colors.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenDimensions.tabBarHeight,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
  },
  icon: {
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
