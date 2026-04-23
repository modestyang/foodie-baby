<script setup lang="ts">
import { ref, provide } from 'vue'
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

const isLoading = ref(true)

// provide 给子页面使用
provide('isAppReady', isLoading)

onLaunch(() => {
  wx.cloud.init({
    env: 'cloud1-4ggckbdj5e78888c',
    traceUser: true
  })

  // 等待页面数据加载完成后再展示内容
  setTimeout(() => {
    isLoading.value = false
  }, 1200)
})

onShow(() => {})
onHide(() => {})
</script>

<template>
  <view class="app-root">
    <!-- 启动加载遮罩 -->
    <view v-if="isLoading" class="app-loading">
      <view class="loading-inner">
        <text class="loading-emoji">🍱</text>
        <text class="loading-title">Foodie Baby</text>
        <view class="loading-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
    </view>
    <!-- 主内容 -->
    <view v-else class="app-content">
      <slot />
    </view>
  </view>
</template>

<style lang="scss">
@import './styles/common.scss';
@import 'colorui-for-uniapp/icon.css';

page,
.app-root {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #FFF8F5;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.loading-emoji {
  font-size: 100rpx;
}

.loading-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #FF6B6B;
  letter-spacing: 2px;
}

.loading-dots {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.dot {
  width: 10rpx;
  height: 10rpx;
  background: #FFB4A2;
  border-radius: 50%;
  animation: dotPulse 1.2s ease-in-out infinite;

  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}

@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.app-content {
  width: 100%;
  min-height: 100vh;
}
</style>
