<template>
  <view class="intro-page">
    <view class="intro-content">
      <!-- 顶部食物动画 -->
      <view class="food-float">
        <view class="food-item" v-for="(item, i) in foodItems" :key="i" :class="item.class" :style="{ animationDelay: item.delay + 's' }">
          <text>{{ item.emoji }}</text>
        </view>
      </view>

      <!-- Logo 区域 -->
      <view class="logo-area">
        <view class="logo-bowl">
          <text class="bowl-emoji">🍱</text>
        </view>
        <text class="app-name">Foodie Baby</text>
        <text class="app-slogan">宝宝辅食智能助手</text>
      </view>

      <!-- 加载动画 -->
      <view class="loading-area">
        <view class="loading-dots">
          <view class="dot" v-for="i in 3" :key="i" :style="{ animationDelay: (i - 1) * 0.2 + 's' }"></view>
        </view>
        <text class="loading-text">{{ loadingTip }}</text>
      </view>

      <!-- 底部装饰 -->
      <view class="bottom-decor">
        <view class="wave wave1"></view>
        <view class="wave wave2"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loadingTip = ref('正在准备美味...')

const foodItems = [
  { emoji: '🥦', class: 'float-1', delay: 0 },
  { emoji: '🥕', class: 'float-2', delay: 0.5 },
  { emoji: '🍎', class: 'float-3', delay: 1 },
  { emoji: '🥚', class: 'float-4', delay: 1.5 },
  { emoji: '🥦', class: 'float-5', delay: 2 },
  { emoji: '🍠', class: 'float-6', delay: 2.5 },
]

onMounted(async () => {
  // 初始化微信云
  wx.cloud.init({ env: 'cloud1-4ggckbdj5e78888c', traceUser: true })

  let loadingDone = false

  // 启动加载任务
  const loadTasks = async () => {
    try {
      loadingTip.value = '正在读取宝宝信息...'
      await loadProfile()
      loadingTip.value = '正在获取今日食谱...'
      await loadTodayRecipe()
    } catch (e) {
      console.error('初始化数据加载失败', e)
    } finally {
      loadingDone = true
    }
  }

  // 启动加载（不等待）
  loadTasks()

  // 等待至少 2.5 秒
  await new Promise(resolve => setTimeout(resolve, 2500))

  // 再等待加载完成
  while (!loadingDone) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // 进入首页
  uni.switchTab({ url: '/pages/index/index' })
})

// 加载宝宝档案
const loadProfile = () => {
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name: 'get-profile',
      success: (res: any) => {
        const result = res.result || res
        if (result?.success && result?.data?.length > 0) {
          const profiles = result.data
          const defaultProfile = profiles.find((p: any) => p.isDefault) || profiles[0]
          if (defaultProfile) {
            uni.setStorageSync('currentProfile', defaultProfile)
          }
          resolve(defaultProfile || null)
        } else {
          resolve(null)
        }
      },
      fail: () => resolve(null)
    })
  })
}

// 加载今日食谱
const loadTodayRecipe = () => {
  return new Promise((resolve) => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    wx.cloud.callFunction({
      name: 'get-today-recipe',
      data: { dateStr },
      success: (res: any) => {
        const result = res.result || res
        if (result?.success && result?.data) {
          const data = result.data
          uni.setStorageSync('cachedTodayMeals', data.meals || [])
          uni.setStorageSync('cachedRecipeId', data._id || '')
          uni.setStorageSync('cachedIsFavorited', data.is_favorite || false)
        }
        resolve(result.data)
      },
      fail: () => resolve(null)
    })
  })
}
</script>

<style scoped lang="scss">
.intro-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF8F5 0%, #FFE8E0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.intro-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 60rpx;
  padding-top: 100rpx;
}

/* 食物漂浮动画 */
.food-float {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.food-item {
  position: absolute;
  font-size: 60rpx;
  opacity: 0.6;
}

.float-1 { animation: floatUp 4s ease-in-out infinite; top: 15%; left: 10%; }
.float-2 { animation: floatUp 4.5s ease-in-out infinite; top: 25%; right: 15%; }
.float-3 { animation: floatUp 5s ease-in-out infinite; top: 40%; left: 5%; }
.float-4 { animation: floatUp 4.2s ease-in-out infinite; top: 55%; right: 8%; }
.float-5 { animation: floatUp 5.5s ease-in-out infinite; top: 70%; left: 15%; }
.float-6 { animation: floatUp 4.8s ease-in-out infinite; top: 80%; right: 12%; }

@keyframes floatUp {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
  50% { transform: translateY(-30rpx) rotate(10deg); opacity: 0.8; }
}

/* Logo 区域 */
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  z-index: 1;
}

.logo-bowl {
  width: 180rpx;
  height: 180rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(255, 107, 107, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.bowl-emoji {
  font-size: 100rpx;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 12rpx 40rpx rgba(255, 107, 107, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 16rpx 50rpx rgba(255, 107, 107, 0.5); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

.app-name {
  font-size: 48rpx;
  font-weight: 800;
  color: #FF6B6B;
  letter-spacing: 4rpx;
}

.app-slogan {
  font-size: 26rpx;
  color: #999;
  letter-spacing: 2rpx;
}

/* 加载动画 */
.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.loading-dots {
  display: flex;
  gap: 16rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  border-radius: 50%;
  animation: dotBounce 1.2s ease-in-out infinite;
}

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1.2); opacity: 1; }
}

.loading-text {
  font-size: 24rpx;
  color: #bbb;
  letter-spacing: 1rpx;
}

/* 底部波浪装饰 */
.bottom-decor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: -50%;
  width: 200%;
  height: 100rpx;
  background: rgba(255, 107, 107, 0.08);
  border-radius: 50% 50% 0 0;
}

.wave1 {
  animation: waveFloat 6s ease-in-out infinite;
  opacity: 0.5;
}

.wave2 {
  bottom: 20rpx;
  background: rgba(255, 143, 143, 0.1);
  animation: waveFloat 8s ease-in-out infinite reverse;
  opacity: 0.3;
}

@keyframes waveFloat {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(2%) translateY(-10rpx); }
}
</style>