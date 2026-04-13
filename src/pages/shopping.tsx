import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - spacing.lg * 3) / 2;

// 쇼핑몰 카테고리
const CATEGORIES = [
  { id: 'all', name: '전체', icon: 'shopping-bag' },
  { id: 'wellness', name: '웰니스', icon: 'heart-pulse' },
  { id: 'nutrition', name: '영양제', icon: 'pill' },
  { id: 'equipment', name: '운동용품', icon: 'dumbbell' },
  { id: 'devices', name: '디바이스', icon: 'watch' },
];

// 샘플 상품 데이터
const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: '프리미엄 호흡 가이드 앱 구독',
    category: 'wellness',
    price: 9900,
    originalPrice: 14900,
    rating: 4.9,
    reviews: 324,
    seller: 'Bread Coach',
    image: '🧘',
    vipDiscount: 20,
  },
  {
    id: 2,
    name: '명상 음악 패키지 (3개월)',
    category: 'wellness',
    price: 19900,
    originalPrice: 29900,
    rating: 4.8,
    reviews: 512,
    seller: 'Bread Coach',
    image: '🎵',
    vipDiscount: 25,
  },
  {
    id: 3,
    name: '프로바이오틱스 유산균 60캡슐',
    category: 'nutrition',
    price: 39000,
    originalPrice: 52000,
    rating: 4.9,
    reviews: 876,
    seller: '바이오랩',
    image: '💊',
    vipDiscount: 15,
  },
  {
    id: 4,
    name: '요가매트 TPE 8mm',
    category: 'equipment',
    price: 49000,
    originalPrice: 69000,
    rating: 4.8,
    reviews: 234,
    seller: '요가플러스',
    image: '🧘‍♀️',
    vipDiscount: 20,
  },
  {
    id: 5,
    name: '스마트 혈압계 (블루투스)',
    category: 'devices',
    price: 69000,
    originalPrice: 89000,
    rating: 4.9,
    reviews: 567,
    seller: '오므론',
    image: '📱',
    vipDiscount: 25,
  },
  {
    id: 6,
    name: '체성분 분석 스마트 체중계',
    category: 'devices',
    price: 45000,
    originalPrice: 59000,
    rating: 4.8,
    reviews: 423,
    seller: '인바디',
    image: '⚖️',
    vipDiscount: 20,
  },
];

export default function ShoppingScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<number[]>([]);

  // 필터링된 상품
  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // 상품 추가
  const addToCart = (productId: number) => {
    setCart([...cart, productId]);
  };

  // 상품 카드 렌더링
  const renderProductCard = ({ item }: { item: (typeof SAMPLE_PRODUCTS)[0] }) => {
    const discount = Math.round(
      ((item.originalPrice - item.price) / item.originalPrice) * 100
    );

    return (
      <TouchableOpacity
        style={[styles.productCard, { width: PRODUCT_WIDTH }]}
        activeOpacity={0.7}
      >
        {/* 상품 이미지 */}
        <View style={styles.imageContainer}>
          <Text style={styles.productImage}>{item.image}</Text>
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}%</Text>
            </View>
          )}
          {item.vipDiscount > 0 && (
            <View style={styles.vipBadge}>
              <MaterialCommunityIcons
                name="crown"
                size={12}
                color={colors.secondary}
              />
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}
        </View>

        {/* 상품 정보 */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          {/* 가격 */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₩{item.price.toLocaleString()}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPrice}>
                ₩{item.originalPrice.toLocaleString()}
              </Text>
            )}
          </View>

          {/* 평점 */}
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={colors.secondary}
            />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>

          {/* 판매자 */}
          <Text style={styles.seller} numberOfLines={1}>
            {item.seller}
          </Text>

          {/* 장바구니 버튼 */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(item.id)}
          >
            <MaterialCommunityIcons
              name="shopping-bag-plus"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.addButtonText}>담기</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 검색바 */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="상품 검색..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 카테고리 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon}
              size={18}
              color={
                selectedCategory === category.id
                  ? colors.secondary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.categoryTabText,
                selectedCategory === category.id &&
                  styles.categoryTabTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 상품 목록 */}
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="shopping-search"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        </View>
      )}

      {/* 장바구니 버튼 */}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.cartButton}>
          <MaterialCommunityIcons
            name="shopping-bag"
            size={24}
            color={colors.primary}
          />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
          <Text style={styles.cartButtonText}>장바구니</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.marble,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
  },
  categoryScroll: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.marble,
  },
  categoryTabActive: {
    backgroundColor: colors.surface,
    borderColor: colors.secondary,
  },
  categoryTabText: {
    marginLeft: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingTop: spacing.md,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.marble,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  vipBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  vipText: {
    color: colors.secondary,
    fontSize: 8,
    fontWeight: '700',
    marginLeft: 2,
  },
  productInfo: {
    padding: spacing.sm,
  },
  productName: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  originalPrice: {
    color: colors.textSecondary,
    fontSize: 10,
    textDecorationLine: 'line-through',
    marginLeft: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rating: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  reviewCount: {
    color: colors.textSecondary,
    fontSize: 10,
    marginLeft: 2,
  },
  seller: {
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.md,
  },
  cartButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cartButtonText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
