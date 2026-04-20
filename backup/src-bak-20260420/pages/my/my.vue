<template>
  <view class="my-page">
    <view class="user-card" v-if="profile" @click="goToEdit(profile)">
      <view class="avatar">{{ profile.gender === 'male' ? '男' : '女' }}</view>
      <view class="info">
        <text class="nickname">{{ profile.nickname }}</text>
        <text class="age">{{ profile.ageMonths }}个月 · {{ profile.gender === 'male' ? '男宝宝' : '女宝宝' }}</text>
      </view>
      <text class="arrow">></text>
    </view>

    <view class="empty-card" v-else @click="goToProfile">
      <text>添加宝宝信息</text>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goToProfileList">
        <text>宝宝档案</text>
        <text class="arrow">></text>
      </view>
    </view>

    <view class="about-section">
      <text class="about-title">关于</text>
      <view class="menu-item">
        <text>版本</text>
        <text class="version">v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const profile = ref<any>(null)

const goToEdit = (profile: any) => {
  uni.navigateTo({ url: `/pages/profile/profile?id=${profile._id}` })
}

const goToProfile = () => {
  uni.navigateTo({ url: '/pages/profile/profile' })
}

const goToProfileList = () => {
  uni.navigateTo({ url: '/pages/profile/list' })
}

onMounted(() => {
  console.log('[my] onMounted - 开始调用云函数')
  uni.cloud.callFunction({
    name: 'get-profile',
    timeout: 10000,
    success: (res: any) => {
      console.log('[my] get-profile success:', res)
      if (res.result?.success !== false) {
        const profiles = res.result?.data || []
        profile.value = profiles.find((p: any) => p.isDefault) || profiles[0] || null
      }
    },
    fail: (err: any) => {
      console.error('[my] get-profile fail:', err)
    }
  })
})
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 32rpx;
}

.user-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;

  .avatar {
    width: 96rpx;
    height: 96rpx;
    background: #4CAF50;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    color: #fff;
    margin-right: 24rpx;
  }

  .info {
    flex: 1;

    .nickname {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
    }

    .age {
      font-size: 26rpx;
      color: #999;
    }
  }

  .arrow {
    color: #ccc;
    font-size: 28rpx;
  }
}

.empty-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 48rpx;
  text-align: center;
  color: #4CAF50;
  font-size: 28rpx;
}

.menu-list,
.about-section {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;
  color: #333;

  &:last-child {
    border-bottom: none;
  }

  .arrow {
    color: #ccc;
  }

  .version {
    color: #999;
  }
}

.about-title {
  display: block;
  padding: 24rpx 24rpx 16rpx;
  font-size: 24rpx;
  color: #999;
}
</style>