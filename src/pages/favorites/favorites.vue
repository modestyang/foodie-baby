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
          <!-- 卡片顶部：餐次标签 + 红心 -->
          <view class="card-top">
            <text class="meal-badge" :class="item.mealType">{{ getMealTypeText(item.mealType) }}</text>
            <view class="heart-icon" @click.stop="handleUnfavorite(item)">
              <text class="iconfont-filled">&#10084;</text>
            </view>
          </view>

          <!-- 卡片主体：菜品名称 + 食材概要 -->
          <view class="card-body">
            <text class="card-title">{{ item.dishName || '未命名菜品' }}</text>
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
  dishName?: string
  mealType?: 'breakfast' | 'lunch' | 'snack' | 'dinner'
  ingredients?: string[]
  created_at?: string
  recipeData?: any
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

// 按日期分组
const groupedFavorites = computed(() => {
  const groups: Record<string, FavoriteItem[]> = {}
  favoritesList.value.forEach(item => {
    const date = item.created_at?.split('T')[0] || '未知'
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
  if (item.ingredients && Array.isArray(item.ingredients)) {
    return item.ingredients.slice(0, 3).join('、')
  }
  return ''
}

const handleView = (item: FavoriteItem) => {
  if (item.recipeData) {
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify([item.recipeData]))}`
    })
  } else {
    // 传递单个菜品信息
    uni.navigateTo({
      url: `/pages/recipe/recipe?dishName=${encodeURIComponent(item.dishName || '')}&mealType=${item.mealType || ''}`
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

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #FAF9F5;
  padding: 32rpx;
}

/* 页面标题 */
.page-header {
  margin-bottom: 32rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333333;
}

/* 收藏列表 */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.favorites-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.group-date {
  font-size: 24rpx;
  color: #999999;
  padding-left: 8rpx;
}

/* 收藏卡片 */
.favorite-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
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
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
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
  font-size: 36rpx;
}

.iconfont-filled {
  font-family: uni-icons;
}

/* 卡片主体 */
.card-body {
  margin-bottom: 20rpx;
}

.card-title {
  display: block;
  font-size: 32rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.card-ingredients {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.5;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.view-recipe-btn {
  padding: 10rpx 28rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #FF9882;
  background: #FFF5F3;
  border: 1rpx solid #FF9882;
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
  color: #999999;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #BBBBBB;
}
</style>
