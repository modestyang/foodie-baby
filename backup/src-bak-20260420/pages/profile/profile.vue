<template>
  <view class="profile-page">
    <view class="form-container">
      <!-- 昵称 -->
      <view class="form-item">
        <view class="form-label">昵称 <text class="required">*</text></view>
        <input
          class="form-input"
          v-model="form.nickname"
          placeholder="请输入宝宝昵称"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 出生日期 -->
      <view class="form-item">
        <view class="form-label">出生日期 <text class="required">*</text></view>
        <picker
          mode="date"
          :value="form.birthday"
          @change="onBirthdayChange"
        >
          <view class="form-picker" :class="{ placeholder: !form.birthday }">
            {{ form.birthday || '请选择出生日期' }}
          </view>
        </picker>
      </view>

      <!-- 性别 -->
      <view class="form-item">
        <view class="form-label">性别 <text class="required">*</text></view>
        <view class="radio-group">
          <view
            class="radio-item"
            :class="{ active: form.gender === '男' }"
            @click="form.gender = '男'"
          >
            男
          </view>
          <view
            class="radio-item"
            :class="{ active: form.gender === '女' }"
            @click="form.gender = '女'"
          >
            女
          </view>
        </view>
      </view>

      <!-- 城市 -->
      <view class="form-item">
        <view class="form-label">城市 <text class="required">*</text></view>
        <picker
          mode="region"
          :value="form.city"
          @change="onCityChange"
        >
          <view class="form-picker" :class="{ placeholder: !form.city }">
            {{ form.city || '请选择城市' }}
          </view>
        </picker>
      </view>

      <!-- 过敏原 -->
      <view class="form-item">
        <view class="form-label">过敏原</view>
        <view class="checkbox-group">
          <view
            v-for="item in allergyOptions"
            :key="item.value"
            class="checkbox-item"
            :class="{ active: form.allergies.includes(item.value) }"
            @click="toggleAllergy(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <!-- 口味偏好 -->
      <view class="form-item">
        <view class="form-label">口味偏好</view>
        <view class="checkbox-group">
          <view
            v-for="item in tasteOptions"
            :key="item.value"
            class="checkbox-item"
            :class="{ active: form.taste_like.includes(item.value) }"
            @click="toggleTasteLike(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <!-- 不喜欢的口味 -->
      <view class="form-item">
        <view class="form-label">不喜欢</view>
        <view class="checkbox-group">
          <view
            v-for="item in tasteOptions"
            :key="item.value"
            class="checkbox-item"
            :class="{ active: form.taste_dislike.includes(item.value) }"
            @click="toggleTasteDislike(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <view class="action-btn cancel" @click="handleCancel">取消</view>
      <view class="action-btn save" @click="handleSave">保存</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const isEditing = ref(false)
const profileId = ref('')

const allergyOptions = [
  { label: '鸡蛋', value: '鸡蛋' },
  { label: '牛奶', value: '牛奶' },
  { label: '坚果', value: '坚果' },
  { label: '鱼类', value: '鱼类' },
  { label: '虾蟹', value: '虾蟹' },
  { label: '大豆', value: '大豆' },
  { label: '小麦', value: '小麦' }
]

const tasteOptions = [
  { label: '甜的', value: '甜的' },
  { label: '酸的', value: '酸的' },
  { label: '软糯', value: '软糯' },
  { label: '细腻', value: '细腻' }
]

const form = reactive({
  nickname: '',
  birthday: '',
  gender: '' as '' | '男' | '女',
  city: '',
  allergies: [] as string[],
  taste_like: [] as string[],
  taste_dislike: [] as string[]
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage?.options || {}
  const id = options.id

  if (id) {
    isEditing.value = true
    profileId.value = id
  }
})

const onBirthdayChange = (e: any) => {
  form.birthday = e.detail.value
}

const onCityChange = (e: any) => {
  form.city = e.detail.value.join('')
}

const toggleAllergy = (value: string) => {
  const index = form.allergies.indexOf(value)
  if (index > -1) {
    form.allergies.splice(index, 1)
  } else {
    form.allergies.push(value)
  }
}

const toggleTasteLike = (value: string) => {
  const index = form.taste_like.indexOf(value)
  if (index > -1) {
    form.taste_like.splice(index, 1)
  } else {
    form.taste_like.push(value)
  }
}

const toggleTasteDislike = (value: string) => {
  const index = form.taste_dislike.indexOf(value)
  if (index > -1) {
    form.taste_dislike.splice(index, 1)
  } else {
    form.taste_dislike.push(value)
  }
}

const handleCancel = () => {
  uni.navigateBack()
}

const handleSave = async () => {
  // 验证必填项
  if (!form.nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  if (!form.birthday) {
    uni.showToast({ title: '请选择出生日期', icon: 'none' })
    return
  }
  if (!form.gender) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return
  }
  if (!form.city) {
    uni.showToast({ title: '请选择城市', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中' })

  try {
    const res: any = await new Promise((resolve, reject) => {
      (uni as any).cloud.callFunction({
        name: 'save-profile',
        data: {
          nickname: form.nickname,
          birthday: form.birthday,
          gender: form.gender,
          city: form.city,
          allergies: form.allergies
        },
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })

    uni.hideLoading()
    if (res.result?.success) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    } else {
      uni.showToast({ title: res.result?.error || '保存失败', icon: 'none' })
    }
  } catch (err: any) {
    uni.hideLoading()
    uni.showToast({ title: err.message || '保存失败', icon: 'none' })
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 32rpx;
  padding-bottom: 160rpx;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.required {
  color: #e53935;
}

.form-input {
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
}

.placeholder {
  color: #999999;
}

.form-picker {
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
  display: flex;
  align-items: center;
}

.form-picker.placeholder {
  color: #999999;
}

.radio-group {
  display: flex;
  gap: 24rpx;
}

.radio-item {
  width: 120rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666666;
}

.radio-item.active {
  background-color: #4CAF50;
  color: #ffffff;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.checkbox-item {
  padding: 12rpx 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666666;
}

.checkbox-item.active {
  background-color: #4CAF50;
  color: #ffffff;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.action-btn.cancel {
  background-color: #f5f5f5;
  color: #666666;
}

.action-btn.save {
  background-color: #4CAF50;
  color: #ffffff;
}
</style>