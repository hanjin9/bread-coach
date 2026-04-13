import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

const { width, height } = Dimensions.get('window');

// 명상 세션 데이터
const MEDITATION_SESSIONS = [
  {
    id: 1,
    title: '아침 활력 호흡',
    description: '새로운 하루를 시작하는 활력 있는 호흡',
    duration: 5,
    difficulty: 'easy',
    pattern: '4-4-4-4',
    background: '🌅',
    color: '#FF6B6B',
    sessions: 1234,
    rating: 4.9,
  },
  {
    id: 2,
    title: '깊은 명상 호흡',
    description: '마음을 진정시키는 깊은 호흡 명상',
    duration: 10,
    difficulty: 'medium',
    pattern: '4-7-8',
    background: '🌙',
    color: '#4ECDC4',
    sessions: 2156,
    rating: 4.8,
  },
  {
    id: 3,
    title: '수면 유도 호흡',
    description: '깊고 편안한 수면을 위한 호흡법',
    duration: 15,
    difficulty: 'medium',
    pattern: '6-9-8-14',
    background: '🌌',
    color: '#2C3E50',
    sessions: 1876,
    rating: 4.9,
  },
  {
    id: 4,
    title: '스트레스 해소 호흡',
    description: '일상의 스트레스를 완화하는 호흡법',
    duration: 7,
    difficulty: 'easy',
    pattern: '5-5-5-5',
    background: '🌿',
    color: '#27AE60',
    sessions: 3421,
    rating: 4.7,
  },
  {
    id: 5,
    title: '집중력 강화 호흡',
    description: '뇌 활성화 및 집중력 증진 호흡',
    duration: 8,
    difficulty: 'medium',
    pattern: '4-4-4-4',
    background: '⚡',
    color: '#F39C12',
    sessions: 2543,
    rating: 4.8,
  },
  {
    id: 6,
    title: '심신 안정 호흡',
    description: '심신을 안정시키는 평온한 호흡',
    duration: 12,
    difficulty: 'hard',
    pattern: '7-14-10',
    background: '💎',
    color: '#9B59B6',
    sessions: 1654,
    rating: 4.9,
  },
];

// 난이도 표시
const getDifficultyLabel = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: '초급',
    medium: '중급',
    hard: '고급',
  };
  return map[difficulty] || difficulty;
};

const getDifficultyColor = (difficulty: string) => {
  const map: Record<string, string> = {
    easy: '#27AE60',
    medium: '#F39C12',
    hard: '#E74C3C',
  };
  return map[difficulty] || colors.secondary;
};

export default function MeditationScreen() {
  const [selectedSession, setSelectedSession] = useState<(typeof MEDITATION_SESSIONS)[0] | null>(
    null
  );
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  // 명상 세션 카드 렌더링
  const renderSessionCard = ({ item }: { item: (typeof MEDITATION_SESSIONS)[0] }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => setSelectedSession(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[item.color, `${item.color}80`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* 배경 이모지 */}
        <Text style={styles.backgroundEmoji}>{item.background}</Text>

        {/* 즐겨찾기 버튼 */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <MaterialCommunityIcons
            name={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={favorites.includes(item.id) ? '#FF6B6B' : '#fff'}
          />
        </TouchableOpacity>

        {/* 카드 정보 */}
        <View style={styles.cardContent}>
          <Text style={styles.sessionTitle}>{item.title}</Text>
          <Text style={styles.sessionDescription} numberOfLines={1}>
            {item.description}
          </Text>

          {/* 메타 정보 */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color="#fff"
              />
              <Text style={styles.metaText}>{item.duration}분</Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={14}
                color="#fff"
              />
              <Text style={styles.metaText}>{getDifficultyLabel(item.difficulty)}</Text>
            </View>

            <View style={styles.metaItem}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color="#FFD700"
              />
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // 세션 상세 정보 모달
  if (selectedSession) {
    return (
      <View style={styles.detailContainer}>
        <LinearGradient
          colors={[selectedSession.color, `${selectedSession.color}80`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.detailHeader}
        >
          {/* 닫기 버튼 */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedSession(null)}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {/* 배경 이모지 */}
          <Text style={styles.detailEmoji}>{selectedSession.background}</Text>

          {/* 제목 */}
          <Text style={styles.detailTitle}>{selectedSession.title}</Text>
          <Text style={styles.detailDescription}>{selectedSession.description}</Text>
        </LinearGradient>

        {/* 상세 정보 */}
        <ScrollView style={styles.detailContent}>
          {/* 기본 정보 */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>세션 정보</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.infoLabel}>시간</Text>
                <Text style={styles.infoValue}>{selectedSession.duration}분</Text>
              </View>

              <View style={styles.infoCard}>
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.infoLabel}>난이도</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: getDifficultyColor(selectedSession.difficulty) },
                  ]}
                >
                  {getDifficultyLabel(selectedSession.difficulty)}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <MaterialCommunityIcons
                  name="wind-power"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.infoLabel}>패턴</Text>
                <Text style={styles.infoValue}>{selectedSession.pattern}</Text>
              </View>

              <View style={styles.infoCard}>
                <MaterialCommunityIcons
                  name="star"
                  size={24}
                  color={colors.secondary}
                />
                <Text style={styles.infoLabel}>평점</Text>
                <Text style={styles.infoValue}>{selectedSession.rating}</Text>
              </View>
            </View>
          </View>

          {/* 호흡 패턴 설명 */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>호흡 패턴</Text>
            <View style={styles.patternBox}>
              <Text style={styles.patternText}>{selectedSession.pattern}</Text>
              <Text style={styles.patternDescription}>
                들숨 - 정지 - 날숨 - 정지 (초 단위)
              </Text>
            </View>
          </View>

          {/* 효과 */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>기대 효과</Text>
            <View style={styles.benefitList}>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.benefitText}>스트레스 감소</Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.benefitText}>심신 안정</Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.benefitText}>집중력 향상</Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={styles.benefitText}>수면 개선</Text>
              </View>
            </View>
          </View>

          {/* 시작 버튼 */}
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: selectedSession.color },
            ]}
          >
            <MaterialCommunityIcons
              name="play-circle"
              size={24}
              color="#fff"
            />
            <Text style={styles.startButtonText}>호흡 시작하기</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // 메인 화면
  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>명상 호흡</Text>
        <Text style={styles.headerSubtitle}>마음을 진정시키는 호흡 명상</Text>
      </View>

      {/* 세션 목록 */}
      <FlatList
        data={MEDITATION_SESSIONS}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.marble,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
    position: 'relative',
  },
  backgroundEmoji: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    fontSize: 48,
    opacity: 0.3,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    paddingRight: spacing.xl,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  sessionDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailHeader: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  detailDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.marble,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  patternBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
  },
  patternText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  patternDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  benefitList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.marble,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  benefitText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: spacing.md,
  },
});
