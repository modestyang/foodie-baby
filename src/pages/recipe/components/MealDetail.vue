<template>
  <view class="meal-detail">
    <!-- 制作步骤标题 -->
    <view class="detail-label">制作步骤</view>

    <!-- 步骤列表 -->
    <view class="steps-list">
      <view
        class="step-item"
        v-for="(step, index) in meal.steps"
        :key="index"
      >
        <view class="step-num">{{ index + 1 }}</view>
        <text class="step-text">{{ step }}</text>
      </view>
    </view>

    <!-- 时长信息 -->
    <view class="duration-info">
      <text class="duration-text">约{{ meal.duration }}分钟</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Meal {
  name: string
  duration: number
  type: string
  ingredients: string[]
  steps: string[]
}

defineProps<{
  meal: Meal
}>()
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.meal-detail {
  padding: 8rpx 0 16rpx;
}

.detail-label {
  font-size: 26rpx;
  font-weight: 500;
  color: $text-secondary;
  margin-bottom: 20rpx;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.step-num {
  width: 44rpx;
  height: 44rpx;
  background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #ffffff;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.6;
  padding-top: 6rpx;
}

.duration-info {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx dashed #e8e8e8;
}

.duration-text {
  font-size: 24rpx;
  color: $text-hint;
}
</style>