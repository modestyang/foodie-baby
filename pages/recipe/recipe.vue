<template>
  <view class="recipe-page">
    <!-- 顶部信息 -->
    <view class="header">
      <text class="date">4月11日 周五</text>
      <text class="baby-info">宝宝 8个月</text>
    </view>

    <!-- 今日特点 -->
    <view class="feature-card">
      <text class="feature-title">今日特点</text>
      <view class="feature-tags">
        <text class="tag">营养均衡</text>
        <text class="tag">颜色丰富</text>
        <text class="tag">锻炼咀嚼</text>
      </view>
    </view>

    <!-- 餐次列表 -->
    <view class="meals-section">
      <text class="section-title">今日辅食</text>
      <view class="meal-list">
        <view class="meal-item" v-for="(meal, index) in meals" :key="index" @click="showDetail(meal)">
          <view class="meal-time">{{ meal.time }}</view>
          <view class="meal-info">
            <text class="meal-name">{{ meal.name }}</text>
            <text class="meal-duration">{{ meal.duration }}</text>
          </view>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 采购清单 -->
    <view class="shopping-section">
      <text class="section-title">采购清单</text>
      <view class="shopping-list">
        <text class="shopping-item" v-for="(item, index) in ingredients" :key="index">{{ item }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="action-bar">
      <view class="action-btn adopt">采纳此食谱</view>
      <view class="action-btn regenerate">重新生成</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      meals: [
        { time: '早餐', name: '南瓜鳕鱼粥', duration: '15分钟' },
        { time: '午餐', name: '胡萝卜蒸蛋', duration: '20分钟' },
        { time: '下午茶', name: '苹果泥', duration: '5分钟' },
        { time: '晚餐', name: '西兰花土豆泥', duration: '25分钟' }
      ],
      ingredients: [
        '鳕鱼 30g', '南瓜 50g', '鸡蛋 1个', '胡萝卜 30g',
        '土豆 50g', '苹果 50g', '西兰花 30g', '宝宝粥米 20g'
      ]
    }
  },
  methods: {
    showDetail(meal) {
      uni.showToast({ title: meal.name, icon: 'none' })
    }
  }
}
</script>

<style lang="scss">
.recipe-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 32rpx 32rpx 160rpx;
}

.header {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 32rpx;

  .date {
    font-size: 44rpx;
    font-weight: 700;
    color: #2c3e50;
  }

  .baby-info {
    font-size: 28rpx;
    color: #7f8c8d;
  }
}

.feature-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .feature-title {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .feature-tags {
    display: flex;
    gap: 16rpx;

    .tag {
      background: #f0f5ff;
      color: #667eea;
      font-size: 24rpx;
      padding: 8rpx 20rpx;
      border-radius: 24rpx;
    }
  }
}

.meals-section {
  margin-top: 32rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20rpx;
    padding-left: 8rpx;
  }

  .meal-list {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  }

  .meal-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .meal-time {
      font-size: 24rpx;
      color: #999;
      width: 80rpx;
    }

    .meal-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16rpx;

      .meal-name {
        font-size: 28rpx;
        color: #333;
      }

      .meal-duration {
        font-size: 22rpx;
        color: #bbb;
      }
    }

    .arrow {
      font-size: 24rpx;
      color: #ccc;
    }
  }
}

.shopping-section {
  margin-top: 32rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20rpx;
    padding-left: 8rpx;
  }

  .shopping-list {
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

    .shopping-item {
      font-size: 24rpx;
      color: #555;
      background: #f8f9fa;
      padding: 10rpx 16rpx;
      border-radius: 8rpx;
    }
  }
}

.action-bar {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  bottom: 48rpx;
  display: flex;
  gap: 24rpx;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 500;
  }

  .adopt {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  }

  .regenerate {
    background: #fff;
    color: #667eea;
    border: 1rpx solid #667eea;
  }
}
</style>