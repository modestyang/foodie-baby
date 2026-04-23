<template>
  <view class="recipe-page">
    <!-- 顶部固定 Header -->
    <view class="header-fixed">
      <view class="header-content">
        <text class="header-date">{{ currentDate }}</text>
        <text class="header-title">今日食谱</text>
      </view>
    </view>

    <!-- 四餐分块展示 -->
    <view class="meals-container">
      <view
        class="meal-card"
        v-for="(meal, index) in meals"
        :key="index"
        :class="getMealClass(index)"
      >
        <!-- 餐次标题栏 -->
        <view class="meal-header">
          <view class="meal-type-badge" :class="getMealBadgeClass(index)">
            {{ mealTypeNames[index] }}
          </view>
        </view>

        <!-- 餐次名称 -->
        <view class="meal-title">{{ meal.name }}</view>

        <!-- 做法默认展开 -->
        <view class="detail-section">
          <MealDetail :meal="meal" />
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn" :class="isFavorited ? 'favorited' : 'primary'" @click="handleFavorite">
        <zx-icon :name="isFavorited ? 'favorfill' : 'favor'" :size="20" :color="isFavorited ? '#FF6B6B' : '#fff'" />
        <text class="action-text">{{ isFavorited ? '取消收藏' : '收藏' }}</text>
      </view>
      <view class="action-btn secondary" :class="{ loading: isRegenerating }" @click="handleRegenerate">
        <zx-icon name="refresh" :size="20" color="#666" />
        <text class="action-text">{{ isRegenerating ? '换一批中' : '换一批' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MealDetail from './components/MealDetail.vue'
import { buildPrompt } from '@/utils/prompt'
import { callLLMAPI, parseMealsFromResponse } from '@/utils/api'

interface Meal {
  name: string
  duration: number
  type: string
  ingredients: string[]
  steps: string[]
}

const mealTypeNames = ['早餐', '午餐', '下午茶', '晚餐']

// 生成参数（从首页跳转时传入）
const genParams = ref<any>(null)
const recipeId = ref<string>('')
const isRegenerating = ref(false)
const isFavorited = ref(false)

// 获取URL参数
onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any)?.options || {}
  const dataStr = options.data
  const genParamsStr = options.genParams

  if (genParamsStr) {
    try {
      genParams.value = JSON.parse(decodeURIComponent(genParamsStr))
    } catch (e) {
      console.error('解析生成参数失败', e)
    }
  }

  // 解析食谱ID（收藏用）
  const idStr = options.id
  if (idStr) {
    recipeId.value = decodeURIComponent(idStr)
  }

  if (dataStr) {
    try {
      const decoded = decodeURIComponent(dataStr)
      const parsedData = JSON.parse(decoded)

      if (Array.isArray(parsedData)) {
        meals.value = parsedData.map((meal: any, index: number) => ({
          ...meal,
          duration: 20,
          type: ['breakfast', 'lunch', 'snack', 'dinner'][index] || 'meal'
        }))
      }
    } catch (e) {
      console.error('解析食谱数据失败:', e)
    }
  }

  // 加载食谱详情（获取收藏状态）
  if (recipeId.value) {
    try {
      const res: any = await new Promise((resolve, reject) => {
        uni.cloud.callFunction({
          name: 'get-recipe',
          data: { id: recipeId.value },
          success: (r: any) => resolve(r),
          fail: (err: any) => reject(err)
        })
      })
      if (res.result?.success && res.result?.data) {
        isFavorited.value = res.result.data.is_favorite || false
      }
    } catch (e) {
      console.error('获取食谱详情失败', e)
    }
  }
})

// 格式化日期
const getDateStr = () => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
}

const currentDate = ref(getDateStr())
const meals = ref<Meal[]>([])

const getMealClass = (index: number) => {
  const classes = ['meal-breakfast', 'meal-lunch', 'meal-snack', 'meal-dinner']
  return classes[index] || 'meal-breakfast'
}

const getMealBadgeClass = (index: number) => {
  const classes = ['breakfast', 'lunch', 'snack', 'dinner']
  return classes[index] || 'breakfast'
}

const handleFavorite = async () => {
  if (meals.value.length === 0) {
    uni.showToast({ title: '暂无食谱可收藏', icon: 'none' })
    return
  }

  // 如果没有 recipeId，先保存食谱获取 ID
  if (!recipeId.value) {
    uni.showToast({ title: '正在保存食谱...', icon: 'loading' })
    try {
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const res: any = await new Promise((resolve, reject) => {
        (uni as any).cloud.callFunction({
          name: 'save-recipe',
          data: { meals: meals.value, dateStr },
          success: (r: any) => resolve(r),
          fail: (err: any) => reject(err)
        })
      })
      if (res.result?.success && res.result?.id) {
        recipeId.value = res.result.id
      } else {
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
        return
      }
    } catch (err) {
      console.error('保存食谱失败:', err)
      uni.showToast({ title: '保存失败', icon: 'none' })
      return
    }
  }

  try {
    await new Promise((resolve, reject) => {
      (uni as any).cloud.callFunction({
        name: 'save-favorite',
        data: { id: recipeId.value },
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    uni.showToast({ title: '已收藏', icon: 'success' })
  } catch (err) {
    console.error('收藏失败:', err)
    uni.showToast({ title: '收藏失败', icon: 'none' })
  }
}

const handleRegenerate = async () => {
  if (!genParams.value || isRegenerating.value) return
  isRegenerating.value = true
  uni.showToast({ title: '换一批中', icon: 'loading' })
  try {
    const p = genParams.value
    const prompt = buildPrompt(p.ageMonths, p.allergies, p.tastePreferences, p.diversityPrefer, p.city)
    const content = await callLLMAPI(prompt)
    const newMeals = parseMealsFromResponse(content)
    if (newMeals && newMeals.length > 0) {
      meals.value = newMeals.map((meal: any, index: number) => ({
        ...meal,
        duration: 20,
        type: ['breakfast', 'lunch', 'snack', 'dinner'][index] || 'meal'
      }))
      uni.showToast({ title: '已换一批', icon: 'success' })
    } else {
      uni.showToast({ title: '生成失败，请重试', icon: 'none' })
    }
  } catch (err) {
    uni.showToast({ title: '换一批失败', icon: 'none' })
  } finally {
    isRegenerating.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.recipe-page {
  min-height: 100vh;
  background-color: $background;
  padding-bottom: 180rpx;
}

/* 顶部固定 Header */
.header-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.header-content {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.header-date {
  font-size: 24rpx;
  color: $text-hint;
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

/* 四餐分块展示 */
.meals-container {
  padding: 24rpx 32rpx;
}

.meal-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.meal-breakfast {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(147, 197, 253, 0.25) 100%);
}

.meal-lunch {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(255, 183, 140, 0.3) 100%);
}

.meal-snack {
  background: linear-gradient(135deg, rgba(244, 143, 177, 0.08) 0%, rgba(252, 228, 236, 0.3) 100%);
}

.meal-dinner {
  background: linear-gradient(135deg, rgba(121, 134, 203, 0.08) 0%, rgba(197, 202, 233, 0.3) 100%);
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.meal-type-badge {
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.9);
}

.meal-type-badge.breakfast {
  color: #2563EB;
}

.meal-type-badge.lunch {
  color: #C2410C;
}

.meal-type-badge.snack {
  color: #7B1FA2;
}

.meal-type-badge.dinner {
  color: #1565C0;
}

.meal-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12rpx;
}

/* 展开的详情区域 */
.detail-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

/* 底部操作栏 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  gap: 8rpx;
  transition: all 0.2s ease;
}

.action-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.action-btn.primary {
  background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
  color: #ffffff;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: $text-primary;
}

.action-btn.secondary.loading {
  opacity: 0.6;
  pointer-events: none;
}

.action-text {
  font-size: 28rpx;
}
</style>