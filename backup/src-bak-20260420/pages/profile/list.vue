<template>
  <view class="list-page">
    <!-- 宝宝档案列表 -->
    <view class="profile-list">
      <view
        class="profile-card"
        v-for="(profile, index) in profiles"
        :key="profile._id || index"
        @click="handleEdit(profile)"
      >
        <view class="card-header">
          <text class="nickname">{{ profile.nickname }}</text>
          <text v-if="profile.isDefault" class="default-tag">默认</text>
        </view>
        <view class="card-info">
          <text class="info-item">{{ profile.ageMonths || 0 }}月龄</text>
          <text class="info-item">{{ profile.gender === 'male' ? '男' : '女' }}</text>
          <text class="info-item">{{ profile.city }}</text>
        </view>
        <view class="card-actions">
          <view class="card-action" @click.stop="handleSetDefault(profile)">设为默认</view>
          <view class="card-action" @click.stop="handleDelete(profile)">删除</view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="profiles.length === 0 && !loading" class="empty">
      <text class="empty-text">暂无档案，请添加宝宝信息</text>
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="handleAdd">
      <text class="add-icon">+</text>
      <text class="add-text">添加宝宝</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

interface Profile {
  _id?: string
  nickname: string
  ageMonths: number
  gender: string
  city: string
  isDefault: boolean
  birthday?: string
  allergies?: string[]
}

const profiles = ref<Profile[]>([])
const loading = ref(true)

onMounted(async () => {
  await loadProfiles()
})

// 每次页面显示时刷新
onShow(async () => {
  await loadProfiles()
})

const loadProfiles = async () => {
  loading.value = true
  try {
    const res: any = await new Promise((resolve, reject) => {
      ;(uni as any).cloud.callFunction({
        name: 'get-profile',
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success && res.result?.data) {
      profiles.value = res.result.data.map((p: any) => {
        const birth = new Date(p.birthday)
        const now = new Date()
        const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
        return {
          ...p,
          ageMonths: months > 0 ? months : 0
        }
      })
    }
  } catch (err) {
    console.error('加载档案失败:', err)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  uni.navigateTo({ url: '/pages/profile/profile' })
}

const handleEdit = (profile: Profile) => {
  uni.navigateTo({
    url: `/pages/profile/profile?id=${profile._id}`
  })
}

const handleSetDefault = async (profile: Profile) => {
  uni.showLoading({ title: '设置中' })
  try {
    const res: any = await new Promise((resolve, reject) => {
      ;(uni as any).cloud.callFunction({
        name: 'set-default-profile',
        data: { profileId: profile._id },
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    uni.hideLoading()
    if (res.result?.success) {
      uni.showToast({ title: '已设为默认', icon: 'success' })
      await loadProfiles()
    } else {
      uni.showToast({ title: '设置失败', icon: 'none' })
    }
  } catch (err: any) {
    uni.hideLoading()
    uni.showToast({ title: err.message || '设置失败', icon: 'none' })
  }
}

const handleDelete = async (profile: Profile) => {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除 ${profile.nickname} 的档案吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '删除中' })
        try {
          const db = (uni as any).cloud.database()
          await db.collection('profiles').doc(profile._id!).remove()
          uni.hideLoading()
          uni.showToast({ title: '已删除', icon: 'success' })
          await loadProfiles()
        } catch (err: any) {
          uni.hideLoading()
          uni.showToast({ title: err.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped>
.list-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 32rpx;
  padding-bottom: 160rpx;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.profile-card {
  padding: 32rpx;
  background-color: #f8f8f8;
  border-radius: 16rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.nickname {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.default-tag {
  padding: 4rpx 12rpx;
  background-color: #4CAF50;
  border-radius: 8rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.card-info {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.info-item {
  font-size: 26rpx;
  color: #666666;
}

.card-actions {
  display: flex;
  gap: 24rpx;
}

.card-action {
  padding: 8rpx 24rpx;
  font-size: 26rpx;
  color: #666666;
}

.add-btn {
  position: fixed;
  bottom: 48rpx;
  left: 32rpx;
  right: 32rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background-color: #4CAF50;
  border-radius: 16rpx;
}

.add-icon {
  font-size: 40rpx;
  font-weight: 300;
  color: #ffffff;
}

.add-text {
  font-size: 30rpx;
  color: #ffffff;
}

.empty {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>