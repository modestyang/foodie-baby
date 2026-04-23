<template>
  <view class="favorites-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的收藏</text>
    </view>

    <!-- 收藏列表 -->
    <view class="favorites-list">
      <view v-for="(group, date) in groupedFavorites" :key="date" class="favorites-group">
        <view class="group-date">{{ formatDate(date) }}</view>
        <view
          v-for="item in group"
          :key="item._id"
          class="favorite-card"
          @click="handleView(item)"
        >
          <view class="card-decor"></view>
          <!-- 卡片顶部：餐次标签 + 红心 -->
          <view class="card-top">
            <text class="meal-badge" :class="item.meals?.[0]?.type">{{ getMealTypeText(item.meals?.[0]?.type) }}</text>
            <view class="heart-icon" @click.stop="handleUnfavorite(item)">
              <text class="iconfont-filled">&#10084;</text>
            </view>
          </view>

          <!-- 卡片主体：菜品名称 + 食材概要 -->
          <view class="card-body">
            <text class="card-title">{{ item.meals?.[0]?.name || '未命名菜品' }}</text>
            <text class="card-ingredients">{{ getIngredients(item) }}</text>
          </view>

          <!-- 卡片底部：查看做法按钮 -->
          <view class="card-footer">
            <view class="view-recipe-btn" @click.stop="handleView(item)">查看做法</view>
          </view>
        </view>
      </view>

      <view v-if="Object.keys(groupedFavorites).length === 0" class="empty">
        <text class="empty-text">暂无收藏内容</text>
        <text class="empty-hint">去首页收藏喜欢的菜品吧</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface FavoriteItem {
  _id?: string
  meals?: any[]
  created_at?: string
  favorited_at?: string
}

const favoritesList = ref<FavoriteItem[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadFavorites()
})

const loadFavorites = async () => {
  loading.value = true
  try {
    const res: any = await new Promise((resolve, reject) => {
      ;(uni as any).cloud.callFunction({
        name: 'get-favorites',
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success && res.result?.list) {
      favoritesList.value = res.result.list
    }
  } catch (err) {
    console.error('加载收藏失败:', err)
  } finally {
    loading.value = false
  }
}

// 按日期分组（使用 favorited_at 排序）
const groupedFavorites = computed(() => {
  const groups: Record<string, FavoriteItem[]> = {}
  favoritesList.value.forEach(item => {
    // 优先用 favorited_at，否则用 created_at
    const dateStr = item.favorited_at || item.created_at || ''
    const date = dateStr.split('T')[0] || '未知'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })
  return groups
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const getMealTypeText = (type?: string) => {
  const mealTypes: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    snack: '下午茶',
    dinner: '晚餐'
  }
  return type ? mealTypes[type] || type : ''
}

const getIngredients = (item: FavoriteItem) => {
  const meal = item.meals?.[0]
  if (meal?.ingredients && Array.isArray(meal.ingredients)) {
    return meal.ingredients.slice(0, 3).join('、')
  }
  return ''
}

const handleView = (item: FavoriteItem) => {
  if (item.meals && item.meals.length > 0) {
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(item.meals))}`
    })
  }
}

const handleUnfavorite = (item: FavoriteItem) => {
  uni.showModal({
    title: '取消收藏',
    content: '确定要取消收藏这道菜吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result: any = await new Promise((resolve, reject) => {
            ;(uni as any).cloud.callFunction({
              name: 'remove-favorite',
              data: { id: item._id },
              success: (r: any) => resolve(r),
              fail: (err: any) => reject(err)
            })
          })
          if (result.result?.success) {
            // 从列表中移除
            favoritesList.value = favoritesList.value.filter(f => f._id !== item._id)
            uni.showToast({ title: '已取消收藏', icon: 'success' })
          }
        } catch (err) {
          console.error('取消收藏失败:', err)
          uni.showToast({ title: '取消失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.favorites-page {
  min-height: 100vh;
  background-color: $background;
  padding: 0;
}

/* 页面标题 */
.page-header {
  padding: 48rpx 32rpx 16rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: -0.5px;
}

/* 收藏列表 */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 16rpx 24rpx 180rpx;
}

.favorites-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.group-date {
  font-size: 24rpx;
  color: $text-hint;
  padding-left: 8rpx;
  font-weight: 500;
}

/* 收藏卡片 */
.favorite-card {
  background: $card-bg;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  position: relative;
  overflow: hidden;
}

/* 装饰圆 */
.card-decor {
  position: absolute;
  right: -40rpx;
  bottom: -40rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #FFF1F2;
  z-index: 0;
}

/* 卡片顶部：标签 + 红心 */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

/* 餐次色块标签 */
.meal-badge {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.meal-badge.breakfast {
  background: #FFF8E1;
  color: #D97706;
}

.meal-badge.lunch {
  background: #FFF3E0;
  color: #EA580C;
}

.meal-badge.snack {
  background: #FFF1F1;
  color: #E11D48;
}

.meal-badge.dinner {
  background: #EEF2FF;
  color: #4F46E5;
}

/* 红心图标 */
.heart-icon {
  color: #FF6B6B;
  font-size: 40rpx;
  position: relative;
  z-index: 1;
}

/* 卡片主体 */
.card-body {
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.card-title {
  display: block;
  font-size: 30rpx;
  color: $text-primary;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.card-ingredients {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  z-index: 1;
}

.view-recipe-btn {
  padding: 12rpx 28rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: $primary;
  background: rgba(255, 107, 107, 0.1);
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: $text-hint;
}
</style>
