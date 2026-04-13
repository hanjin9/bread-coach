import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors } from '@/styles/colors';
import { typography, spacing } from '@/styles/spacing';
import { Card } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/constants';
import type { BreathingVideo } from '@/types';

export default function HomeScreen() {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['breathing-videos'],
    queryFn: () => apiService.get<BreathingVideo[]>(API_ENDPOINTS.GET_VIDEOS),
  });

  if (isLoading) return <Loader />;

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>오늘의 호흡</Text>
        <Text style={styles.subtitle}>건강한 호흡으로 하루를 시작하세요</Text>
      </View>

      {/* 오늘의 추천 영상 */}
      {videos && videos.length > 0 && (
        <Card style={styles.featuredCard}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{videos[0].templateId}</Text>
            <Text style={styles.featuredDescription}>지금 바로 시작하세요</Text>
          </View>
        </Card>
      )}

      {/* 호흡 영상 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>모든 호흡 가이드</Text>
        {videos && videos.length > 0 ? (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.videoCard}>
                <View>
                  <Text style={styles.videoTitle}>{item.templateId}</Text>
                  <Text style={styles.videoDuration}>{item.duration}초</Text>
                </View>
              </Card>
            )}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>사용 가능한 호흡 가이드가 없습니다.</Text>
        )}
      </View>

      {/* 에러 메시지 */}
      {error && <Text style={styles.errorText}>데이터를 불러올 수 없습니다.</Text>}
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
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  featuredCard: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  featuredContent: {
    padding: spacing.md,
  },
  featuredTitle: {
    ...typography.h4,
    color: colors.secondary,
    marginBottom: spacing.sm,
  },
  featuredDescription: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  videoCard: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  videoDuration: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
