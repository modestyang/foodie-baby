<template>
  <view class="meal-detail">
    <!-- 食材用量 -->
    <view class="detail-label">食材用量</view>
    <view class="ingredients-list">
      <view
        class="ingredient-item"
        v-for="(ing, index) in meal.ingredients"
        :key="index"
      >
        <text class="ing-text">{{ ing }}</text>
      </view>
    </view>

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
        <text class="step-text">{{ cleanStep(step) }}</text>
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

const cleanStep = (step: string) => {
  // 移除开头的中文或阿拉伯数字序号，如 "1."、"1、"、"第一步" 等
  return step.replace(/^[一二三四五六七八九十零0-9]+[.、、\s]+/, '').replace(/^第[一二三四五六七八九十零]+步\s*/, '')
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.meal-detail {
  padding: 8rpx 0 16rpx;
}

.detail-label {
  font-size: 22rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 12rpx;
  margin-top: 4rpx;
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
  padding-left: 4rpx;
}

.ingredient-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
}

.ing-text {
  font-size: 22rpx;
  color: $text-primary;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.step-item {
  display: flex;
  gap: 16rpx;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-num {
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 600;
  color: #ffffff;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  font-size: 24rpx;
  color: $text-primary;
  line-height: 1.6;
  padding-top: 4rpx;
}

.duration-info {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1rpx dashed #e8e8e8;
}

.duration-text {
  font-size: 22rpx;
  color: $text-hint;
}
</style>