<template>
  <view class="my-page">
    <!-- 用户卡片 -->
    <view class="user-card" @click="goToProfile">
      <view class="avatar">
        <text class="avatar-text">{{ hasProfile ? (profile.gender === 'male' ? '男' : '女') : '?' }}</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ hasProfile ? profile.nickname : '添加宝宝' }}</text>
        <text class="user-desc">{{ hasProfile ? (profile.ageMonths + '个月') : '点击完善信息' }}</text>
      </view>
      <view class="arrow">></view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="goToProfileList">
        <view class="menu-left">
          <text class="menu-icon">📋</text>
          <text class="menu-text">宝宝档案</text>
        </view>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="goToHistory">
        <view class="menu-left">
          <text class="menu-icon">📜</text>
          <text class="menu-text">历史记录</text>
        </view>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="about-section">
      <view class="menu-item">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">版本</text>
        </view>
        <text class="version">v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      hasProfile: false,
      profile: {}
    }
  },
  methods: {
    goToProfile() {
      uni.navigateTo({ url: '/pages/profile/profile' })
    },
    goToProfileList() {
      uni.navigateTo({ url: '/pages/profile/list' })
    },
    goToHistory() {
      uni.switchTab({ url: '/pages/history/history' })
    }
  }
}
</script>

<style lang="scss">
.my-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 32rpx;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

  .avatar {
    width: 96rpx;
    height: 96rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .avatar-text {
      font-size: 36rpx;
      color: #fff;
    }
  }

  .user-info {
    flex: 1;
    margin-left: 24rpx;

    .user-name {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #fff;
    }

    .user-desc {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 6rpx;
    }
  }

  .arrow {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

.menu-list,
.about-section {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .menu-left {
    display: flex;
    align-items: center;

    .menu-icon {
      font-size: 32rpx;
      margin-right: 16rpx;
    }

    .menu-text {
      font-size: 28rpx;
      color: #333;
    }
  }

  .arrow {
    color: #ccc;
    font-size: 26rpx;
  }

  .version {
    font-size: 26rpx;
    color: #999;
  }
}
</style>