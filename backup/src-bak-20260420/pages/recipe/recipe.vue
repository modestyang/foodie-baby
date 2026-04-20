<template>
  <view class="recipe-page">
    <!-- 顶部信息 -->
    <view class="header">
      <view class="date">{{ currentDate }} · {{ babyName }} {{ monthAge }}月龄</view>
    </view>

    <!-- 今日特点 -->
    <view class="features">
      <text class="feature-tag" v-for="(feature, index) in features" :key="index">{{ feature }}</text>
    </view>

    <!-- 今日辅食 -->
    <view class="meal-section">
      <view class="section-title">今日辅食</view>
      <view class="meal-list">
        <view
          class="meal-item"
          v-for="(meal, index) in meals"
          :key="index"
          @click="showMealDetail(meal)"
        >
          <view class="meal-info">
            <text class="meal-name">{{ meal.name }}</text>
            <text class="meal-time">{{ meal.duration }}分钟</text>
          </view>
          <view class="meal-action">查看</view>
        </view>
      </view>
    </view>

    <!-- 今日采购清单 -->
    <view class="shopping-section">
      <view class="section-title">今日采购清单</view>
      <view class="shopping-list">
        <text class="shopping-item" v-for="(item, index) in shoppingList" :key="index">{{ item }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <view class="action-btn primary" @click="handleAdopt">采纳</view>
      <view class="action-btn" @click="handleRegenerate">重新生成</view>
      <view class="action-btn" @click="handleRecord">成果记录</view>
    </view>

    <!-- 餐次详情弹窗 -->
    <MealDetail
      v-if="showDetail"
      :meal="selectedMeal"
      @close="closeMealDetail"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MealDetail from './components/MealDetail.vue'

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

        // 生成采购清单
        const allIngredients: string[] = []
        parsedData.forEach((meal: any) => {
          if (meal.ingredients) {
            meal.ingredients.forEach((ing: any) => {
              allIngredients.push(ing)
            })
          }
        })
        shoppingList.value = [...new Set(allIngredients)]
      }
    } catch (e) {
      console.error('解析食谱数据失败:', e)
    }
  }
})

// 格式化日期
const getDateStr = () => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
}

const currentDate = ref(getDateStr())
const babyName = ref('宝宝')
const monthAge = ref(8)
const features = ref(['营养均衡', '颜色丰富', '适合锻炼'])

const meals = ref<any[]>([])
const shoppingList = ref<string[]>([])

const showDetail = ref(false)
const selectedMeal = ref<any>(null)

const showMealDetail = (meal: any) => {
  selectedMeal.value = meal
  showDetail.value = true
}

const closeMealDetail = () => {
  showDetail.value = false
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

<style scoped>
.recipe-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 32rpx;
  padding-bottom: 200rpx;
}

.header {
  margin-bottom: 32rpx;
}

.date {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.feature-tag {
  padding: 8rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666666;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 24rpx;
}

.meal-section {
  margin-bottom: 40rpx;
}

.meal-list {
  border-radius: 16rpx;
  overflow: hidden;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.meal-item:last-child {
  border-bottom: none;
}

.meal-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.meal-name {
  font-size: 28rpx;
  color: #333333;
}

.meal-time {
  font-size: 24rpx;
  color: #999999;
}

.meal-action {
  font-size: 26rpx;
  color: #666666;
}

.shopping-section {
  margin-bottom: 40rpx;
}

.shopping-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.shopping-item {
  padding: 12rpx 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666666;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
}

.action-btn.primary {
  background-color: #4CAF50;
  color: #ffffff;
}
</style>