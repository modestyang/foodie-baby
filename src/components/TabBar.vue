<template>
  <view class="custom-tabbar">
    <view
      v-for="(item, index) in tabList"
      :key="index"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="switchTab(item, index)"
    >
      <view class="tab-icon-wrap">
        <text class="iconfont tab-icon" :class="currentIndex === index ? item.selectedIcon : item.icon"></text>
      </view>
      <text class="tab-text" :class="{ active: currentIndex === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useTabBarState } from '@/utils/tabBarState'

interface TabItem {
  text: string
  icon: string
  selectedIcon: string
  pagePath: string
}

const tabList: TabItem[] = [
  { text: '首页', icon: 'icon-home', selectedIcon: 'icon-homefill', pagePath: '/pages/index/index' },
  { text: '历史', icon: 'icon-time', selectedIcon: 'icon-timefill', pagePath: '/pages/history/history' },
  { text: '我的', icon: 'icon-my', selectedIcon: 'icon-myfill', pagePath: '/pages/my/my' }
]

const { currentIndex } = useTabBarState()

// 每次页面显示时同步 tabbar 高亮状态
onShow(() => {
  const pages = getCurrentPages()
  if (!pages.length) return
  const route = `/${pages[pages.length - 1].route}`
  const idx = tabList.findIndex(t => t.pagePath === route)
  if (idx !== -1) {
    currentIndex.value = idx
  }
})

const switchTab = (item: TabItem, index: number) => {
  currentIndex.value = index
  uni.switchTab({ url: item.pagePath })
}
</script>

<style scoped lang="scss">
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: 8rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  z-index: 1000;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  padding: 6rpx 0;
  border-radius: 20rpx;
  transition: all 0.25s ease;
  min-width: 120rpx;
}

.tab-item.active {
  .tab-icon-wrap { transform: scale(1.15); }
  .tab-icon { color: #FF6B6B !important; }
  .tab-text { color: #FF6B6B; font-weight: 600; }
}

.tab-icon-wrap {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  transition: all 0.25s ease;
}

.tab-icon { font-size: 40rpx; color: #999; transition: color 0.25s ease; }
.tab-text { font-size: 18rpx; color: #999; font-weight: 400; transition: all 0.25s ease; }

.tab-item:active .tab-icon-wrap {
  transform: scale(0.88);
  background: rgba(255, 107, 107, 0.08);
  border-radius: 50%;
}
</style>