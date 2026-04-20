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
        :class="meal.type"
        v-for="(meal, index) in meals"
        :key="index"
      >
        <!-- 餐次标题栏 -->
        <view class="meal-header">
          <view class="meal-type-badge" :class="meal.type">
            {{ mealTypeNames[index] }}
          </view>
          <text class="meal-duration">{{ meal.duration }}分钟</text>
        </view>

        <!-- 餐次名称 -->
        <view class="meal-title">{{ meal.name }}</view>

        <!-- 食材标签 -->
        <view class="ingredients-row">
          <text
            class="ingredient-tag"
            v-for="(ing, idx) in meal.ingredients"
            :key="idx"
          >{{ ing }}</text>
        </view>

        <!-- 做法按钮 -->
        <view class="expand-btn" @click="toggleExpand(index)">
          <text>做法</text>
          <text class="arrow" :class="{ expanded: expandedIndex === index }">▼</text>
        </view>

        <!-- 展开的详细步骤 -->
        <view class="detail-section" v-if="expandedIndex === index">
          <MealDetail :meal="meal" />
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn primary" @click="handleAdopt">采纳此食谱</view>
      <view class="action-btn secondary" @click="handleRegenerate">重新生成</view>
      <view class="action-link" @click="handleRecord">记录成果</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MealDetail from './components/MealDetail.vue'

interface Meal {
  name: string
  duration: number
  type: string
  ingredients: string[]
  steps: string[]
}

const mealTypeNames = ['早餐', '午餐', '下午茶', '晚餐']

// 获取URL参数
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any)?.options || {}
  const dataStr = options.data

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
})

// 格式化日期
const getDateStr = () => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
}

const currentDate = ref(getDateStr())
const meals = ref<Meal[]>([])

const expandedIndex = ref<number | null>(null)

const toggleExpand = (index: number) => {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

const handleAdopt = () => {
  uni.showToast({ title: '已采纳', icon: 'success' })
}

const handleRegenerate = () => {
  uni.showToast({ title: '重新生成中', icon: 'loading' })
}

const handleRecord = () => {
  uni.navigateTo({ url: '/pages/profile/profile' })
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
  font-size: 28rpx;
  color: $text-hint;
}

.header-title {
  font-size: 40rpx;
  font-weight: 600;
  color: $text-primary;
}

/* 四餐分块展示 */
.meals-container {
  padding: 24rpx 32rpx;
}

.meal-card {
  background: #fff;
  border-radius: $card-radius;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx $shadow-light;
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.meal-type-badge {
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.meal-type-badge.breakfast {
  background: $meal-breakfast;
  color: #E65100;
}

.meal-type-badge.lunch {
  background: $meal-lunch;
  color: #2E7D32;
}

.meal-type-badge.snack {
  background: $meal-snack;
  color: #7B1FA2;
}

.meal-type-badge.dinner {
  background: $meal-dinner;
  color: #1565C0;
}

.meal-duration {
  font-size: 24rpx;
  color: $text-hint;
}

.meal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.ingredients-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.ingredient-tag {
  padding: 10rpx 18rpx;
  background: #f8f6f3;
  border-radius: 6rpx;
  font-size: 24rpx;
  color: $text-secondary;
}

/* 做法按钮 */
.expand-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 0 8rpx;
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

.arrow {
  font-size: 20rpx;
  transition: transform 0.3s ease;
}

.arrow.expanded {
  transform: rotate(180deg);
}

/* 展开的详情区域 */
.detail-section {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
}

.action-btn.primary {
  flex: 2;
  background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
  color: #ffffff;
}

.action-btn.secondary {
  flex: 1;
  background: transparent;
  border: 2rpx solid $text-hint;
  color: $text-primary;
}

.action-link {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: $text-secondary;
  text-decoration: underline;
}
</style>