<template>
  <view class="profile-page">
    <!-- 页面标题 + 编辑/保存按钮 -->
    <view class="page-header">
      <text class="page-title">宝宝档案</text>
      <view
        class="edit-btn"
        :class="{ editing: isEditing }"
        @click="toggleEdit"
      >
        {{ isEditing ? '保存' : '编辑' }}
      </view>
    </view>

    <!-- 表单卡片 -->
    <view class="form-container">

      <!-- Section 1: 基本信息 -->
      <view class="form-card">
        <view class="section-header">
          <text class="section-title">基本信息</text>
        </view>

        <!-- 昵称 -->
        <view class="form-item">
          <view class="form-label">昵称 <text class="required">*</text></view>
          <input
            class="form-input"
            :class="{ disabled: !isEditing }"
            v-model="form.nickname"
            placeholder="请输入宝宝昵称"
            placeholder-class="placeholder"
            :disabled="!isEditing"
          />
        </view>

        <!-- 出生日期 -->
        <view class="form-item">
          <view class="form-label">出生日期 <text class="required">*</text></view>
          <picker
            mode="date"
            :value="form.birthday"
            @change="onBirthdayChange"
            :disabled="!isEditing"
          >
            <view class="form-picker" :class="{ placeholder: !form.birthday, disabled: !isEditing }">
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
              :class="{ active: form.gender === '男', disabled: !isEditing }"
              @click="isEditing && (form.gender = '男')"
            >
              男
            </view>
            <view
              class="radio-item"
              :class="{ active: form.gender === '女', disabled: !isEditing }"
              @click="isEditing && (form.gender = '女')"
            >
              女
            </view>
          </view>
        </view>
      </view>

      <!-- Section 2: 健康信息 -->
      <view class="form-card">
        <view class="section-header">
          <text class="section-title">健康信息</text>
        </view>

        <!-- 过敏原 -->
        <view class="form-item">
          <view class="form-label">过敏原</view>
          <view class="tag-group">
            <view
              v-for="item in allergyOptions"
              :key="item.value"
              class="tag-item"
              :class="{ active: form.allergies.includes(item.value), disabled: !isEditing }"
              @click="isEditing && toggleAllergy(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>

        <!-- 口味偏好 -->
        <view class="form-item">
          <view class="form-label">口味偏好</view>
          <view class="tag-group">
            <view
              v-for="item in tasteOptions"
              :key="item.value"
              class="tag-item"
              :class="{ active: form.taste_like.includes(item.value), disabled: !isEditing }"
              @click="isEditing && toggleTasteLike(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>

        <!-- 不喜欢 -->
        <view class="form-item">
          <view class="form-label">不喜欢</view>
          <view class="tag-group">
            <view
              v-for="item in dislikeOptions"
              :key="item.value"
              class="tag-item"
              :class="{ active: form.taste_dislike.includes(item.value), disabled: !isEditing }"
              @click="isEditing && toggleTasteDislike(item.value)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>

      <!-- Section 3: 地区信息 -->
      <view class="form-card">
        <view class="section-header">
          <text class="section-title">地区信息</text>
        </view>

        <!-- 城市 -->
        <view class="form-item">
          <view class="form-label">城市 <text class="required">*</text></view>
          <picker
            mode="region"
            :value="form.cityArray"
            @change="onCityChange"
            :disabled="!isEditing"
          >
            <view class="form-picker" :class="{ placeholder: !form.city, disabled: !isEditing }">
              {{ form.city || '请选择城市' }}
            </view>
          </picker>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const isEditing = ref(true) // 默认编辑模式
const profileId = ref('')

// 过敏原选项
const allergyOptions = [
  { label: '鸡蛋', value: '鸡蛋' },
  { label: '牛奶', value: '牛奶' },
  { label: '坚果', value: '坚果' },
  { label: '鱼类', value: '鱼类' },
  { label: '虾蟹', value: '虾蟹' },
  { label: '大豆', value: '大豆' },
  { label: '小麦', value: '小麦' }
]

// 口味偏好选项
const tasteOptions = [
  { label: '甜的', value: '甜的' },
  { label: '酸的', value: '酸的' },
  { label: '软的', value: '软的' },
  { label: '细腻', value: '细腻' }
]

// 不喜欢选项
const dislikeOptions = [
  { label: '酸的', value: '酸的' },
  { label: '苦的', value: '苦的' },
  { label: '辣的', value: '辣的' },
  { label: '腥的', value: '腥的' }
]

const form = reactive({
  nickname: '',
  birthday: '',
  gender: '' as '' | '男' | '女',
  city: '',
  cityArray: [] as string[],
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
    loadProfile(id)
  }
})

const loadProfile = (id: string) => {
  // TODO: 从云数据库加载现有档案
}

const toggleEdit = () => {
  if (isEditing.value) {
    // 保存
    handleSave()
  } else {
    // 进入编辑
    isEditing.value = true
  }
}

const onBirthdayChange = (e: any) => {
  form.birthday = e.detail.value
}

const onCityChange = (e: any) => {
  form.cityArray = e.detail.value
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
          allergies: form.allergies,
          taste_like: form.taste_like,
          taste_dislike: form.taste_dislike
        },
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })

    uni.hideLoading()
    if (res.result?.success) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      isEditing.value = false
    } else {
      uni.showToast({ title: res.result?.error || '保存失败', icon: 'none' })
    }
  } catch (err: any) {
    uni.hideLoading()
    uni.showToast({ title: err.message || '保存失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
// 引入全局样式变量
@import '@/styles/variables.scss';

.profile-page {
  min-height: 100vh;
  background-color: $background;
  padding: 32rpx;
  padding-bottom: 40rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0 40rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 600;
  color: $text-primary;
}

.edit-btn {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, $primary-gradient-start, $primary-gradient-end);
  color: #fff;
  font-size: 26rpx;
  border-radius: 32rpx;
  transition: opacity 0.2s;

  &.editing {
    background: $primary-light;
    color: $primary;
  }
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-card {
  background: $card-bg;
  border-radius: $card-radius;
  padding: 32rpx;
  box-shadow: 0 2rpx 16rpx $shadow-light;
}

.section-header {
  margin-bottom: 32rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 24rpx;
  color: $text-hint;
  font-weight: 400;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 28rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.required {
  color: $primary;
}

.form-input {
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: $text-primary;
  transition: opacity 0.2s;

  &.disabled {
    opacity: 0.6;
  }
}

.placeholder {
  color: $text-hint;
}

.form-picker {
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: $text-primary;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;

  &.placeholder {
    color: $text-hint;
  }

  &.disabled {
    opacity: 0.6;
  }
}

.radio-group {
  display: flex;
  gap: 24rpx;
}

.radio-item {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: $text-secondary;
  transition: all 0.2s;

  &.active {
    background: linear-gradient(135deg, $primary-gradient-start, $primary-gradient-end);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
  }

  &.disabled {
    opacity: 0.6;
  }
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  padding: 14rpx 28rpx;
  background-color: #f8f8f8;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: $text-secondary;
  transition: all 0.2s;

  &.active {
    background: linear-gradient(135deg, $primary-gradient-start, $primary-gradient-end);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.3);
  }

  &.disabled {
    opacity: 0.6;
  }
}
</style>