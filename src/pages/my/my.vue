<template>
  <view class="my-page">
    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="goToHistory">
        <view class="menu-icon blue">
          <text class="iconfont icon-time"></text>
        </view>
        <text class="menu-text">历史食谱</text>
      </view>

      <view class="menu-item" @click="goToFavorites">
        <view class="menu-icon pink">
          <text class="iconfont icon-favor"></text>
        </view>
        <text class="menu-text">我的收藏</text>
      </view>

      <view class="menu-item" @click="goToProfile">
        <view class="menu-icon orange">
          <text class="iconfont icon-profile"></text>
        </view>
        <text class="menu-text">宝宝档案</text>
      </view>
    </view>

    <!-- 关于区域 -->
    <view class="about-section">
      <text class="about-title">关于</text>
      <view class="menu-item">
        <text class="menu-text">版本</text>
        <text class="version">v1.0.0</text>
      </view>
    </view>

    <!-- 自定义TabBar -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'

const profile = ref<any>(null)

const loadProfile = () => {
  return new Promise((resolve) => {
    uni.cloud.callFunction({
      name: 'get-profile',
      success: (res: any) => {
        const result = res.result || res
        if (result?.success && result?.data?.length > 0) {
          const profiles = result.data
          profile.value = profiles.find((p: any) => p.isDefault) || profiles[0] || null
        }
        resolve(profile.value)
      },
      fail: () => resolve(null)
    })
  })
}

const goToProfile = async () => {
  if (!profile.value) {
    await loadProfile()
  }
  if (profile.value?._id) {
    uni.setStorageSync('currentProfile', profile.value)
    uni.navigateTo({ url: '/pages/profile/profile?from=list' })
  } else {
    uni.navigateTo({ url: '/pages/profile/profile?action=add' })
  }
}

const goToHistory = () => {
  uni.switchTab({ url: '/pages/history/history' })
}

const goToFavorites = () => {
  uni.navigateTo({ url: '/pages/favorites/favorites' })
}

onMounted(() => {
  loadProfile()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.my-page {
  min-height: 100vh;
  background: $background;
  padding: 0 0 120rpx 0;
}

/* 功能列表 */
.menu-list {
  margin: 0 24rpx 24rpx;
  background: $card-bg;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;

  &.blue { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
  &.pink { background: rgba(244, 63, 94, 0.1); color: #F43F5E; }
  &.orange { background: rgba(255, 152, 0, 0.1); color: #FF9800; }
  &.gray { background: rgba(0, 0, 0, 0.05); color: #999; }

  .iconfont {
    font-size: 28rpx;
  }
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

/* 关于区域 */
.about-section {
  margin: 0 24rpx;
  background: $card-bg;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.02);

  .about-title {
    display: block;
    padding: 24rpx 24rpx 16rpx;
    font-size: 24rpx;
    color: $text-hint;
  }

  .menu-item {
    padding: 28rpx 24rpx;

    .menu-text {
      font-weight: 400;
      color: $text-secondary;
    }

    .version {
      color: $text-hint;
      font-size: 26rpx;
    }
  }
}
</style>