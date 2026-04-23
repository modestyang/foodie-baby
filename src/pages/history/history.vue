<template>
  <view class="history-page">
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
      :refresher-triggered="isRefreshing"
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
            <view class="card-decor"></view>
            <!-- 卡片主体：显示四餐信息 -->
            <view class="card-meals">
              <view
                v-for="(meal, mealIdx) in (item.meals || []).slice(0, 4)"
                :key="mealIdx"
                class="meal-row"
              >
                <view class="meal-tag" :class="'meal-tag-' + mealIdx">{{ getMealLabel(mealIdx) }}</view>
                <text class="meal-name">{{ meal.name || '未命名' }}</text>
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

    <!-- 自定义TabBar -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import TabBar from '@/components/TabBar.vue'

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
const isRefreshing = ref(false)

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
      // 确保视图更新
      await nextTick()
    }
  } catch (err) {
    console.error('加载历史失败:', err)
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  await loadHistory()
  isRefreshing.value = false
}

// 按日期分组
const groupedHistory = computed(() => {
  const now = new Date()
  const filtered = historyList.value.filter(item => {
    // 优先使用 created_at_str，没有则用 created_at 降序排列取日期部分
    const dateStr = item.created_at_str || (item.created_at ? item.created_at.split('T')[0] : null)
    if (!dateStr) return false

    const itemDate = new Date(dateStr + 'T00:00:00')
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
    const date = item.created_at_str || (item.created_at ? item.created_at.split('T')[0] : '未知')
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
  // 使用本地日期字符串，避免时区问题
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return '今天'
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  return `${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`
}

// 获取餐次标签
const getMealLabel = (index: number) => {
  const labels = ['早餐', '中餐', '下午茶', '晚餐']
  return labels[index] || ''
}

// 查看详情
const handleView = (item: HistoryItem) => {
  if (item.meals) {
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(item.meals))}`
    })
  }
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
  width: 100%;
  box-sizing: border-box;
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
  height: calc(100vh - 200rpx);
  padding: 24rpx 32rpx 130rpx;
  width: 100%;
  box-sizing: border-box;
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
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
  margin-bottom: 24rpx;
  position: relative;
  overflow: hidden;
}

.history-card:active {
  opacity: 0.75;
  transform: scale(0.98);
}

/* 装饰圆 */
.card-decor {
  position: absolute;
  right: -40rpx;
  bottom: -40rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #EFF6FF;
  z-index: 0;
}

/* 四餐展示 */
.card-meals {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.meal-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.meal-row {
  display: flex;
  align-items: center;
  min-height: 56rpx;
}

.meal-tag {
  width: 100rpx;
  height: 40rpx;
  line-height: 40rpx;
  font-size: 22rpx;
  padding: 0;
  border-radius: 8rpx;
  font-weight: 500;
  text-align: center;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.meal-tag-0 {
  background: rgba(255, 179, 71, 0.15);
  color: #FFB347;
}

.meal-tag-1 {
  background: rgba(99, 179, 253, 0.15);
  color: #63B3FD;
}

.meal-tag-2 {
  background: rgba(165, 155, 255, 0.15);
  color: #A59BFF;
}

.meal-tag-3 {
  background: rgba(255, 143, 143, 0.15);
  color: #FF8F8F;
}

.meal-name {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 600;
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
