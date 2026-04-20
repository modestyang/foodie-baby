<template>
  <view class="container">
    <!-- 顶部欢迎区 -->
    <view class="header">
      <view class="greeting">
        <text class="hello">你好</text>
        <text class="subtitle">今天给宝宝做什么辅食呢？</text>
      </view>
    </view>

    <!-- 主卡片区域 -->
    <view class="main-card" @click="handleGenerate">
      <view class="card-icon">
        <text class="icon-emoji">🥣</text>
      </view>
      <view class="card-content">
        <text class="card-title">生成今日食谱</text>
        <text class="card-desc">AI智能推荐，科学营养搭配</text>
      </view>
      <view class="card-arrow">
        <text>></text>
      </view>
    </view>

    <!-- 功能模块 -->
    <view class="module-section">
      <view class="module-title">快捷功能</view>
      <view class="module-grid">
        <view class="module-item" @click="goToProfile">
          <view class="item-icon">👶</view>
          <text class="item-text">宝宝信息</text>
        </view>
        <view class="module-item" @click="goToHistory">
          <view class="item-icon">📋</view>
          <text class="item-text">历史记录</text>
        </view>
        <view class="module-item" @click="goToProfileList">
          <view class="item-icon">📁</view>
          <text class="item-text">档案管理</text>
        </view>
      </view>
    </view>

    <!-- 提示卡片 -->
    <view class="tip-card" @click="goToProfile">
      <view class="tip-left">
        <text class="tip-icon">💡</text>
        <view class="tip-content">
          <text class="tip-title">录入宝宝信息</text>
          <text class="tip-desc">获得更精准的个性化推荐</text>
        </view>
      </view>
      <view class="tip-btn">去设置</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    handleGenerate() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    goToProfile() {
      uni.navigateTo({ url: '/pages/profile/profile' })
    },
    goToHistory() {
      uni.switchTab({ url: '/pages/history/history' })
    },
    goToProfileList() {
      uni.navigateTo({ url: '/pages/profile/list' })
    }
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #eef1f5 100%);
  padding: 0 32rpx;
}

.header {
  padding: 48rpx 0 32rpx;

  .greeting {
    display: flex;
    flex-direction: column;

    .hello {
      font-size: 48rpx;
      font-weight: 700;
      color: #2c3e50;
    }

    .subtitle {
      font-size: 28rpx;
      color: #7f8c8d;
      margin-top: 8rpx;
    }
  }
}

.main-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 48rpx 36rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);

  .card-icon {
    width: 100rpx;
    height: 100rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-emoji {
      font-size: 48rpx;
    }
  }

  .card-content {
    flex: 1;
    margin-left: 24rpx;

    .card-title {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      color: #fff;
    }

    .card-desc {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8rpx;
    }
  }

  .card-arrow {
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.6);
  }
}

.module-section {
  margin-top: 40rpx;

  .module-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20rpx;
    padding-left: 8rpx;
  }

  .module-grid {
    display: flex;
    gap: 24rpx;
  }

  .module-item {
    flex: 1;
    background: #fff;
    border-radius: 20rpx;
    padding: 32rpx 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

    .item-icon {
      font-size: 44rpx;
      margin-bottom: 12rpx;
    }

    .item-text {
      font-size: 24rpx;
      color: #555;
    }
  }
}

.tip-card {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .tip-left {
    flex: 1;
    display: flex;
    align-items: center;

    .tip-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }

    .tip-content {
      display: flex;
      flex-direction: column;

      .tip-title {
        font-size: 28rpx;
        font-weight: 500;
        color: #2c3e50;
      }

      .tip-desc {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }
  }

  .tip-btn {
    font-size: 24rpx;
    color: #667eea;
    font-weight: 500;
  }
}
</style>