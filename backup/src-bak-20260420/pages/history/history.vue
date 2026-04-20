<template>
  <view class="history-page">
    <!-- 顶部筛选 -->
    <view class="filter-tabs">
      <view
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: currentFilter === tab.value }"
        @click="currentFilter = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- 历史记录列表 -->
    <view class="history-list">
      <view v-for="(group, date) in groupedHistory" :key="date" class="history-group">
        <view class="group-date">{{ formatDate(date) }}</view>
        <view
          v-for="item in group"
          :key="item._id"
          class="history-item"
          @click="handleView(item)"
        >
          <view class="item-main">
            <text class="item-name">{{ item.meals?.[0]?.name || '未命名食谱' }}</text>
            <text class="item-source">AI生成</text>
          </view>
          <view class="item-status" :class="item.status || 'pending'">{{ getStatusText(item.status) }}</view>
          <view class="item-action" @click.stop="handleReuse(item)">复用</view>
        </view>
      </view>

      <view v-if="Object.keys(groupedHistory).length === 0" class="empty">
        <text class="empty-text">暂无历史记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface HistoryItem {
  _id?: string
  meals?: any[]
  created_at?: string
  status?: 'pending' | 'adopted' | 'rejected'
}

const filterTabs = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '全部', value: 'all' }
]

const currentFilter = ref('today')
const historyList = ref<HistoryItem[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadHistory()
})

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

// 按日期分组
const groupedHistory = computed(() => {
  const now = new Date()
  const filtered = historyList.value.filter(item => {
    if (!item.created_at) return false

    const itemDate = new Date(item.created_at)
    if (currentFilter.value === 'today') {
      return itemDate.toDateString() === now.toDateString()
    } else if (currentFilter.value === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return itemDate >= weekAgo
    } else if (currentFilter.value === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      return itemDate >= monthAgo
    }
    return true
  })

  const groups: Record<string, HistoryItem[]> = {}
  filtered.forEach(item => {
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

const getStatusText = (status?: string) => {
  switch (status) {
    case 'adopted': return '已采纳'
    case 'rejected': return '未采纳'
    default: return '待反馈'
  }
}

const handleView = (item: HistoryItem) => {
  if (item.meals) {
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(item.meals))}`
    })
  }
}

const handleReuse = (item: HistoryItem) => {
  if (item.meals) {
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(item.meals))}`
    })
  }
  uni.showToast({ title: '复用成功', icon: 'success' })
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 32rpx;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
  padding: 8rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.filter-tab {
  flex: 1;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666666;
}

.filter-tab.active {
  background-color: #ffffff;
  color: #333333;
  font-weight: 500;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.history-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.group-date {
  font-size: 26rpx;
  color: #999999;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.item-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.item-name {
  font-size: 28rpx;
  color: #333333;
}

.item-source {
  font-size: 24rpx;
  color: #999999;
}

.item-status {
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  margin-right: 16rpx;
}

.item-status.pending {
  color: #ff9800;
  background-color: #fff3e0;
}

.item-status.adopted {
  color: #4CAF50;
  background-color: #e8f5e9;
}

.item-status.rejected {
  color: #999999;
  background-color: #f5f5f5;
}

.item-action {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  color: #4CAF50;
}

.empty {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>