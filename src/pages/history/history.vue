<template>
  <view class="history-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">历史记录</text>
    </view>

    <!-- 筛选 Tab 栏 -->
    <view class="filter-tabs-wrapper">
      <view class="filter-tabs">
        <view
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: currentFilter === tab.value }"
          @click="onTabChange(tab.value)"
        >
          {{ tab.label }}
        </view>
        <!-- 活动的 Tab 下划线指示器 -->
        <view class="tab-indicator" :class="currentFilter"></view>
      </view>
    </view>

    <!-- 历史记录列表 -->
    <scroll-view
      class="history-scroll"
      scroll-y
      :refresher-enabled="true"
      @refresherrefresh="onRefresh"
    >
      <view class="history-list">
        <view v-for="(group, dateKey) in groupedHistory" :key="dateKey" class="history-group">
          <!-- 日期分组标签 -->
          <view class="group-date">{{ formatDate(dateKey) }}</view>

          <!-- 日期下的食谱卡片 -->
          <view
            v-for="item in group"
            :key="item._id"
            class="history-card"
            @click="handleView(item)"
          >
            <!-- 卡片头部：日期+餐次 -->
            <view class="card-header">
              <text class="card-date">{{ formatCardDate(item.created_at) }}</text>
              <text class="card-separator">·</text>
              <text class="card-meal-type">{{ getMealTypeText(item.meals?.[0]?.type) }}</text>
            </view>

            <!-- 卡片主体：食谱名称 -->
            <view class="card-body">
              <text class="card-title">{{ item.meals?.[0]?.name || '未命名食谱' }}</text>
              <text class="card-ingredients">{{ getIngredients(item.meals?.[0]) }}</text>
            </view>

            <!-- 卡片底部：状态+操作 -->
            <view class="card-footer">
              <view class="card-status" :class="item.status || 'pending'">
                <text class="status-dot"></text>
                <text class="status-text">{{ getStatusText(item.status) }}</text>
              </view>
              <view class="card-actions">
                <view class="action-btn" @click.stop="handleView(item)">查看</view>
                <view class="action-btn primary" @click.stop="handleReuse(item)">复用</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="Object.keys(groupedHistory).length === 0 && !loading" class="empty-state">
          <text class="empty-title">暂无历史记录</text>
          <text class="empty-subtitle">生成食谱后将自动保存到这里</text>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Meal {
  name?: string
  type?: string
  ingredients?: string[]
  steps?: string[]
}

interface HistoryItem {
  _id?: string
  meals?: Meal[]
  created_at?: string
  status?: 'pending' | 'adopted' | 'rejected'
}

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const currentFilter = ref('all')
const historyList = ref<HistoryItem[]>([])
const loading = ref(false)

// Tab 切换
const onTabChange = (value: string) => {
  currentFilter.value = value
  loadHistory()
}

// 加载历史
const loadHistory = async () => {
  loading.value = true
  try {
    const res: any = await new Promise((resolve, reject) => {
      ;(uni as any).cloud.callFunction({
        name: 'get-history',
        data: { filter: currentFilter.value },
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success && res.result?.list) {
      historyList.value = res.result.list
    }
  } catch (err) {
    console.error('加载历史失败:', err)
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  await loadHistory()
  uni.stopPullDownRefresh()
}

// 按日期分组
const groupedHistory = computed(() => {
  const now = new Date()
  const filtered = historyList.value.filter(item => {
    if (!item.created_at) return false

    const itemDate = new Date(item.created_at)
    if (currentFilter.value === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return itemDate >= weekAgo
    } else if (currentFilter.value === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return itemDate >= monthAgo
    }
    return true
  })

  // 按日期分组
  const groups: Record<string, HistoryItem[]> = {}
  filtered.forEach(item => {
    const date = item.created_at?.split('T')[0] || '未知'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })

  // 按日期降序排序
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a))
  const sortedGroups: Record<string, HistoryItem[]> = {}
  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key]
  })

  return sortedGroups
})

// 日期格式化
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  return `${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
}

// 卡片头部日期
const formatCardDate = (dateStr?: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`
}

// 状态文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'adopted': return '已采纳'
    case 'rejected': return '未采纳'
    default: return '待反馈'
  }
}

// 餐次类型文本
const getMealTypeText = (type?: string) => {
  const mealTypes: Record<string, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    snack: '下午茶',
    dinner: '晚餐'
  }
  return type ? mealTypes[type] || type : ''
}

// 获取食材文本
const getIngredients = (meal?: Meal) => {
  if (!meal?.ingredients || !Array.isArray(meal.ingredients)) return ''
  return meal.ingredients.slice(0, 3).join('、')
}

// 查看详情
const handleView = (item: HistoryItem) => {
  if (item.meals) {
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(item.meals))}`
    })
  }
}

// 复用
const handleReuse = (item: HistoryItem) => {
  if (item.meals) {
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(item.meals))}`
    })
  }
  uni.showToast({ title: '复用成功', icon: 'success' })
}

// 初始化加载
onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.history-page {
  min-height: 100vh;
  background-color: $background;
  display: flex;
  flex-direction: column;
}

/* 页面标题 */
.page-header {
  padding: 32rpx 32rpx 0;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: $text-primary;
}

/* 筛选 Tab 栏 */
.filter-tabs-wrapper {
  padding: 24rpx 32rpx 0;
}

.filter-tabs {
  position: relative;
  display: flex;
  background-color: $card-bg;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.filter-tab {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: $text-secondary;
  transition: color 0.3s ease;
  z-index: 1;
}

.filter-tab.active {
  color: $text-primary;
  font-weight: 500;
}

/* Tab 指示器 (渐变下划线) */
.tab-indicator {
  position: absolute;
  bottom: 8rpx;
  height: 56rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
  opacity: 0.15;
  transition: all 0.3s ease;

  &.all {
    left: 8rpx;
    width: calc(33.333% - 8rpx);
  }

  &.week {
    left: calc(33.333% + 4rpx);
    width: calc(33.333% - 8rpx);
  }

  &.month {
    left: calc(66.666% + 4rpx);
    width: calc(33.333% - 8rpx);
  }
}

/* 历史列表容器 */
.history-scroll {
  flex: 1;
  padding: 24rpx 32rpx 180rpx;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

/* 日期分组 */
.history-group {
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

/* 食谱卡片 */
.history-card {
  background: $card-bg;
  border-radius: $card-radius;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.card-date {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 500;
}

.card-separator {
  font-size: 24rpx;
  color: $text-hint;
}

.card-meal-type {
  font-size: 24rpx;
  color: $text-secondary;
}

/* 卡片主体 */
.card-body {
  margin-bottom: 20rpx;
}

.card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
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
  justify-content: space-between;
}

/* 状态标签 */
.card-status {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
}

.status-text {
  font-weight: 500;
}

.card-status.pending {
  background: rgba($status-pending, 0.12);
  color: $status-pending;

  .status-dot {
    background: $status-pending;
  }
}

.card-status.adopted {
  background: rgba($status-adopted, 0.12);
  color: $status-adopted;

  .status-dot {
    background: $status-adopted;
  }
}

.card-status.rejected {
  background: rgba($status-rejected, 0.10);
  color: $status-rejected;

  .status-dot {
    background: $status-rejected;
  }
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: $text-secondary;
  background: rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.action-btn:active {
  opacity: 0.7;
  transform: scale(0.96);
}

.action-btn.primary {
  color: #ffffff;
  background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-title {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 12rpx;
}

.empty-subtitle {
  font-size: 24rpx;
  color: $text-hint;
}

/* 加载状态 */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}

.loading-text {
  font-size: 26rpx;
  color: $text-hint;
}
</style>
