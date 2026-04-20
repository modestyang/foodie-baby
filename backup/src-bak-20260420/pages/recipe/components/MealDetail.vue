<template>
  <view class="meal-detail-overlay" @click="handleClose">
    <view class="meal-detail-card" @click.stop>
      <view class="detail-header">
        <text class="meal-name">{{ meal?.name }}</text>
        <text class="close-btn" @click="handleClose">×</text>
      </view>

      <view class="detail-section">
        <view class="section-label">食材</view>
        <view class="ingredients-list">
          <text
            class="ingredient-item"
            v-for="(item, index) in meal?.ingredients"
            :key="index"
          >{{ item }}</text>
        </view>
      </view>

      <view class="detail-section">
        <view class="section-label">制作步骤</view>
        <view class="steps-list">
          <view
            class="step-item"
            v-for="(step, index) in meal?.steps"
            :key="index"
          >
            <text class="step-num">{{ index + 1 }}</text>
            <text class="step-text">{{ step }}</text>
          </view>
        </view>
      </view>

      <view class="detail-footer">
        <text class="duration">约{{ meal?.duration }}分钟</text>
      </view>
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
  meal?: Meal
}>()

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.meal-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.meal-detail-card {
  width: 100%;
  max-height: 80vh;
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.meal-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  font-size: 48rpx;
  color: #999999;
  line-height: 1;
}

.detail-section {
  margin-bottom: 40rpx;
}

.section-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #666666;
  margin-bottom: 20rpx;
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.ingredient-item {
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333333;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
}

.step-num {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 50%;
  font-size: 24rpx;
  color: #666666;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.detail-footer {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.duration {
  font-size: 26rpx;
  color: #999999;
}
</style>