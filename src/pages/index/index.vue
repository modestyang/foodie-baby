<template>
  <view class="page-container">
    
    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 1. 宝宝信息卡片 -->
      <view class="baby-card" @click="goToProfile">
        <view class="baby-left">
          <view class="baby-avatar">
            <text class="avatar-text">{{ profile ? profile.nickname?.slice(0, 1) : '?' }}</text>
          </view>
          <view class="baby-info">
            <view class="baby-name-row" v-if="profile">
              <text class="baby-name">{{ profile.nickname || '未命名' }}</text>
              <text class="age-badge">{{ profile.ageMonths }}月龄</text>
            </view>
            <text class="baby-stage" v-if="profile">{{ profile.stage || '已添加档案' }}</text>
            <text class="baby-stage" v-else>点击录入宝宝档案</text>
          </view>
        </view>
        <text class="iconfont icon-right chevron"></text>
      </view>

      <!-- 2. 生成按钮 -->
      <button class="generate-btn" @click="handleGenerate" :disabled="isLoading" v-if="todayMeals.length === 0">
        <view class="decor"></view>
        <text class="iconfont icon-service chef-icon"></text>
        <view class="badge">
          <text class="wand-icon">✨</text>
          <text class="label">Smart Menu</text>
        </view>
        <view class="title-row">
          <text class="title">定制今日食谱</text>
          <text class="sparkle">✨</text>
        </view>
        <text class="desc">根据小团子营养需求，智能规划四餐</text>
      </button>

      
      <!-- 3. 历史与收藏 -->
      <view class="grid-2">
        <button class="history-card" @click="goToHistory">
          <view class="card-decor-blue"></view>
          <view class="card-icon-wrap blue">
            <text class="iconfont icon-time card-icon"></text>
          </view>
          <view class="card-text">
            <text class="card-title">历史食谱</text>
            <text class="card-subtitle">看看过去吃了啥</text>
          </view>
        </button>

        <button class="fav-card" @click="goToFavorites">
          <view class="card-decor-pink"></view>
          <view class="card-icon-wrap pink">
            <text class="iconfont icon-favor card-icon"></text>
          </view>
          <view class="card-text">
            <text class="card-title">收藏食谱</text>
            <text class="card-subtitle">宝宝最爱的味道</text>
          </view>
        </button>
      </view>

      <!-- 4. 今日推荐四餐 -->
      <view class="meals-section" v-if="todayMeals.length > 0">
        <view class="section-header">
          <text class="section-title">今日推荐四餐</text>
          <view class="header-btns">
            <button class="action-btn" @click="goToRecipeDetail">查看详情</button>
            <button class="action-btn" :class="{ 'btn-favorited': isFavorited }" @click="toggleFavorite">{{ isFavorited ? '取消收藏' : '收藏' }}</button>
            <button class="action-btn" :class="{ 'btn-loading': isLoading }" :disabled="isLoading" @click="refreshMeals">{{ isLoading ? '替换中' : '换一换' }}</button>
          </view>
        </view>

        <view class="meals-card">
          <view class="timeline-wrap">
            <view class="timeline-line"></view>
            <view class="timeline-list">
              <view v-for="(meal, index) in todayMeals" :key="index" class="timeline-item">
                <view :class="['timeline-dot', getMealBg(meal.type)]">
                  <zx-icon :name="getMealIcon(meal.type)" :size="28" :color="getMealIconColor(meal.type)" />
                </view>
                <view class="meal-content">
                  <view class="meal-header">
                    <text class="meal-type">{{ meal.type }}</text>
                    <text class="meal-time">{{ meal.time || '' }}</text>
                  </view>
                  <text class="meal-title">{{ meal.name }}</text>
                  <view class="meal-ingredients-wrap">
                    <text class="meal-ingredients">{{ formatIngredients(meal.ingredients) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 试用模式弹窗 -->
    <view class="trial-modal" v-if="showTrialModal">
      <view class="modal-mask" @click="showTrialModal = false"></view>
      <view class="modal-content">
        <view class="modal-title">请输入宝宝月龄</view>
        <input
          class="trial-input"
          type="number"
          v-model="trialAge"
          placeholder="请输入月龄（6-36）"
        />
        <view class="modal-btns">
          <button class="btn-cancel" @click="showTrialModal = false">取消</button>
          <button class="btn-confirm" @click="confirmTrial">确认</button>
        </view>
      </view>
    </view>

    <!-- 自定义TabBar -->
    <TabBar />

    <!-- 调试日志浮标 -->
    <view class="debug-float" @click="showDebugLogs = !showDebugLogs">
      <text class="debug-btn">🪵</text>
    </view>

    <!-- 调试日志面板 -->
    <view class="debug-panel" v-if="showDebugLogs">
      <view class="debug-header">
        <text class="debug-title">调试日志 {{ debugLogs.length > 0 ? '(' + debugLogs.length + ')' : '' }}</text>
        <text class="debug-close" @click.stop="showDebugLogs = false">✕</text>
      </view>
      <scroll-view class="debug-content" scroll-y>
        <text v-if="debugLogs.length === 0" class="log-line log-empty">点击生成食谱后，日志将显示在这里...</text>
        <text v-for="(log, idx) in debugLogs" :key="idx" class="log-line">{{ log }}</text>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { buildPrompt } from '@/utils/prompt'
import { callLLMAPI, parseMealsFromResponse } from '@/utils/api'

const isLoading = ref(false)
const showDebugLogs = ref(false)
const debugLogs = ref<string[]>([])
const showTrialModal = ref(false)
const trialAge = ref<number | null>(null)
const profile = ref<any>(null)
const todayMeals = ref<any[]>([])
const recipeId = ref<string>('')
const isFavorited = ref(false)

// 调试日志
const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString()
  debugLogs.value.push(`[${time}] ${msg}`)
  console.log(msg)
}

// 辅助函数：获取餐次背景色
const getMealBg = (type: string) => {
  const map: Record<string, string> = {
    '早餐': 'breakfast', '午餐': 'lunch', '下午茶': 'snack', '晚餐': 'dinner'
  }
  return map[type] || 'breakfast'
}

// 辅助函数：获取餐次图标
const getMealIcon = (type: string) => {
  const map: Record<string, string> = {
    '早餐': 'time', '午餐': 'star', '下午茶': 'favor', '晚餐': 'home'
  }
  return map[type] || 'time'
}

// 辅助函数：获取餐次图标颜色
const getMealIconColor = (type: string) => {
  const map: Record<string, string> = {
    '早餐': '#f59e0b', '午餐': '#f97316', '下午茶': '#ec4899', '晚餐': '#6366f1'
  }
  return map[type] || '#f59e0b'
}

// 辅助函数：格式化食材
const formatIngredients = (ingredients: any) => {
  if (Array.isArray(ingredients)) return ingredients.join(', ')
  if (typeof ingredients === 'string') return ingredients
  return ''
}

// 获取宝宝档案
const loadProfile = async () => {
  // 优先从启动页缓存读取
  const cached = uni.getStorageSync('currentProfile')
  if (cached) {
    const found = cached
    if (found.birthday) {
      const birthDate = new Date(found.birthday)
      const now = new Date()
      const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth())
      found.ageMonths = months
    }
    if (found.gender === 'male' || found.gender === '女') found.genderText = '男'
    else if (found.gender === 'female' || found.gender === '男') found.genderText = '女'
    profile.value = found
    return
  }

  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'get-profile',
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(err)
      })
    })
    // 修复：云函数直接返回 { success, data }，不是 { result: { success, data } }
    const result = res.result || res
    if (result?.success && result?.data?.length > 0) {
      const profiles = result.data
      // 查找默认档案
      let found = profiles.find((p: any) => p.isDefault)
      if (!found) found = profiles[0]
      // 计算月龄
      if (found.birthday) {
        const birthDate = new Date(found.birthday)
        const now = new Date()
        const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth())
        found.ageMonths = months
      }
      // 标准化性别显示
      if (found.gender === 'male' || found.gender === '女') found.genderText = '男'
      else if (found.gender === 'female' || found.gender === '男') found.genderText = '女'
      profile.value = found
    }
  } catch (err) {
    console.error('获取档案失败:', err)
  }
}

// 加载今日食谱
const loadTodayRecipe = async () => {
  try {
    // 优先从启动页缓存读取
    const cached = uni.getStorageSync('cachedTodayMeals')
    const cachedId = uni.getStorageSync('cachedRecipeId')
    const cachedFav = uni.getStorageSync('cachedIsFavorited')
    if (cached && cached.length > 0) {
      todayMeals.value = cached
      recipeId.value = cachedId || ''
      isFavorited.value = cachedFav || false
      uni.removeStorageSync('cachedTodayMeals')
      uni.removeStorageSync('cachedRecipeId')
      uni.removeStorageSync('cachedIsFavorited')
      return
    }

    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const res: any = await new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'get-today-recipe',
        data: { dateStr },
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success && res.result?.data) {
      todayMeals.value = res.result.data.meals || []
      recipeId.value = res.result.data._id || ''
      isFavorited.value = res.result.data.is_favorite || false
    }
  } catch (err) {
    console.error('获取今日食谱失败:', err)
  }
}

// 生成食谱
const handleGenerate = async () => {
  if (isLoading.value) return

  if (!profile.value) {
    await loadProfile()
  }

  if (!profile.value) {
    uni.showModal({
      title: '提示',
      content: '请先录入宝宝档案，以便我们为您生成更合适的食谱',
      confirmText: '去录入',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/profile/profile?action=add' })
        }
      }
    })
    return
  }

  uni.showLoading({ title: '生成中...', mask: true })
  isLoading.value = true

  await generateWithProfile()
  uni.hideLoading()
}

// 构建提示词
// 生成食谱内容
const generateRecipeContent = async (ageMonths: number, allergies: string[], tastePreferences: string[], diversityPrefer: string = 'diverse', city?: string) => {
  const prompt = buildPrompt(ageMonths, allergies, tastePreferences, diversityPrefer, city)
  addLog('开始生成食谱...')
  try {
    const result = await callLLMAPI(prompt, addLog)
    if (result) {
      addLog('AI返回内容长度: ' + result.length)
      return result
    } else {
      addLog('AI返回为空')
    }
  } catch (e: any) {
    addLog('生成异常: ' + (e.message || e))
  }
  return null
}

// 使用档案生成
const generateWithProfile = async () => {
  isLoading.value = true
  try {
    const content = await generateRecipeContent(
      profile.value.ageMonths,
      profile.value.allergies || [],
      [...(profile.value.taste_like || []), ...(profile.value.taste_dislike || [])],
      profile.value.diversity_prefer || 'diverse',
      profile.value.city
    )

    const meals = parseMealsFromResponse(content, addLog)

    if (!meals || meals.length === 0) {
      uni.showToast({ title: '解析失败: ' + (content ? content.substring(0, 100) : '空'), icon: 'none', duration: 5000 })
      isLoading.value = false
      return
    }

    if (meals && meals.length > 0) {
      const ids = await saveRecipe(meals)
      recipeId.value = ids
      todayMeals.value = meals
      // 清除缓存，确保下次加载最新数据
      uni.removeStorageSync('cachedTodayMeals')
      uni.removeStorageSync('cachedRecipeId')
      uni.removeStorageSync('cachedIsFavorited')
      const genParams = {
        ageMonths: profile.value.ageMonths,
        allergies: profile.value.allergies || [],
        tastePreferences: [...(profile.value.taste_like || []), ...(profile.value.taste_dislike || [])],
        diversityPrefer: profile.value.diversity_prefer || 'diverse',
        city: profile.value.city
      }
      uni.navigateTo({
        url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(meals))}&id=${encodeURIComponent(ids)}&genParams=${encodeURIComponent(JSON.stringify(genParams))}`
      })
    } else {
      uni.showToast({ title: '生成失败，请重试', icon: 'none' })
    }
  } catch (err: any) {
    console.error('生成食谱失败:', err)
    uni.showToast({ title: err.message || '生成失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

// 保存食谱，返回recipe ID
const saveRecipe = async (meals: any[]) => {
  try {
    // 使用本地日期字符串（格式：2026-04-22）
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const res: any = await new Promise((resolve, reject) => {
      ;(uni as any).cloud.callFunction({
        name: 'save-recipe',
        data: { meals, dateStr },
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success) {
      console.log('食谱已保存:', res.result.id)
      return res.result.id || ''
    }
  } catch (err) {
    console.error('保存食谱失败:', err)
  }
  return ''
}

// 确认试用模式
const confirmTrial = async () => {
  const age = trialAge.value
  if (!age || age < 6 || age > 36) {
    uni.showToast({ title: '请输入6-36之间的月龄', icon: 'none' })
    return
  }

  showTrialModal.value = false
  uni.showLoading({ title: '生成中...', mask: true })
  isLoading.value = true

  try {
    const content = await generateRecipeContent(age, [], [])
    const meals = parseMealsFromResponse(content, addLog)

    if (!meals || meals.length === 0) {
      uni.showToast({ title: '解析失败: ' + (content ? content.substring(0, 100) : '空'), icon: 'none', duration: 5000 })
      isLoading.value = false
      return
    }

    if (meals && meals.length > 0) {
      const id = await saveRecipe(meals)
      recipeId.value = id
      todayMeals.value = meals
      // 清除缓存
      uni.removeStorageSync('cachedTodayMeals')
      uni.removeStorageSync('cachedRecipeId')
      uni.removeStorageSync('cachedIsFavorited')
      uni.navigateTo({
        url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(meals))}&id=${encodeURIComponent(id)}`
      })
    } else {
      uni.showToast({ title: '生成失败，请重试', icon: 'none' })
    }
  } catch (err: any) {
    uni.showToast({ title: err.message || '生成失败', icon: 'none' })
  } finally {
    isLoading.value = false
  }
}

// 查看餐次详情
const showMealDetail = (index: number) => {
  if (todayMeals.value && todayMeals.value.length > 0) {
    const genParams = profile.value ? {
      ageMonths: profile.value.ageMonths,
      allergies: profile.value.allergies || [],
      tastePreferences: [...(profile.value.taste_like || []), ...(profile.value.taste_dislike || [])],
      diversityPrefer: profile.value.diversity_prefer || 'diverse',
      city: profile.value.city
    } : null
    const url = genParams
      ? `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(todayMeals.value))}&id=${encodeURIComponent(recipeId.value)}&genParams=${encodeURIComponent(JSON.stringify(genParams))}`
      : `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(todayMeals.value))}&id=${encodeURIComponent(recipeId.value)}`
    uni.navigateTo({ url })
  } else {
    const mockMeals = [
      { type: '早餐', name: '苹果燕麦泥', ingredients: ['苹果 50g', '燕麦 20g'], steps: [], duration: 20 },
      { type: '午餐', name: '三文鱼土豆浓汤', ingredients: ['三文鱼 30g', '土豆 40g', '奶 20ml'], steps: [], duration: 25 },
      { type: '下午茶', name: '香蕉软松饼', ingredients: ['香蕉半根', '面粉 20g', '蛋黄 1个'], steps: [], duration: 15 },
      { type: '晚餐', name: '番茄牛肉软面', ingredients: ['番茄 30g', '牛肉 20g', '碎面 25g'], steps: [], duration: 20 }
    ]
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(mockMeals))}`
    })
  }
}

// 跳转食谱详情页
const goToRecipeDetail = () => {
  if (todayMeals.value.length === 0) return
  const genParams = profile.value ? {
    ageMonths: profile.value.ageMonths,
    allergies: profile.value.allergies || [],
    tastePreferences: [...(profile.value.taste_like || []), ...(profile.value.taste_dislike || [])],
    diversityPrefer: profile.value.diversity_prefer || 'diverse',
    city: profile.value.city
  } : null
  const url = genParams
    ? `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(todayMeals.value))}&id=${encodeURIComponent(recipeId.value)}&genParams=${encodeURIComponent(JSON.stringify(genParams))}`
    : `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(todayMeals.value))}&id=${encodeURIComponent(recipeId.value)}`
  uni.navigateTo({ url })
}

// 导航
const goToProfile = async () => {
  if (!profile.value) {
    await loadProfile()
  }
  if (profile.value?._id) {
    uni.setStorageSync('currentProfile', profile.value)
    uni.navigateTo({ url: '/pages/profile/profile?from=list' })
  } else {
    uni.navigateTo({ url: '/pages/profile/profile?action=add' })
  }
}

const goToHistory = () => {
  uni.switchTab({ url: '/pages/history/history' })
}

const goToFavorites = () => {
  uni.navigateTo({ url: '/pages/favorites/favorites' })
}

const toggleFavorite = async () => {
  if (todayMeals.value.length === 0) {
    uni.showToast({ title: '暂无食谱可收藏', icon: 'none' })
    return
  }
  // 如果没有 recipeId，先保存食谱获取 ID（正常情况应该已有）
  if (!recipeId.value) {
    const id = await saveRecipe(todayMeals.value)
    recipeId.value = id
  }

  const action = isFavorited.value ? 'remove-favorite' : 'save-favorite'
  const data = action === 'remove-favorite' ? { id: recipeId.value } : { id: recipeId.value }

  try {
    await new Promise((resolve, reject) => {
      (uni as any).cloud.callFunction({
        name: action,
        data,
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    isFavorited.value = !isFavorited.value
    uni.showToast({ title: isFavorited.value ? '已收藏' : '已取消收藏', icon: 'success' })
  } catch (err) {
    console.error('收藏操作失败:', err)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const refreshMeals = async () => {
  if (todayMeals.value.length === 0) return
  isLoading.value = true
  try {
    await generateWithProfile()
  } catch (err) {
    console.error('刷新失败:', err)
  } finally {
    isLoading.value = false
  }
}

const goToMy = () => {
  uni.navigateTo({ url: '/pages/my/my' })
}

onMounted(async () => {
  await loadProfile()
  await loadTodayRecipe()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: $background;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
}

/* 顶部导航 */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 48rpx 24rpx 16rpx;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: -0.5px;
}

.nav-avatar {
  width: 64rpx;
  height: 64rpx;
  background: #FFF3E0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.avatar-icon {
  font-size: 32rpx;
}

.avatar-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 16rpx;
  height: 16rpx;
  background: $primary;
  border-radius: 50%;
  border: 3rpx solid #fff;
}

/* 主内容区 */
.main-content {
  flex: 1;
  width: 100%;
  padding: 16rpx 24rpx 110rpx;
  box-sizing: border-box;
}

/* 宝宝信息卡片 */
.baby-card {
  background: $card-bg;
  border-radius: $card-radius;
  padding: 40rpx;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 20rpx $shadow-light;
  border: 1rpx solid rgba(255, 155, 94, 0.1);
  transition: all 0.2s ease;
}

.baby-card:active {
  opacity: 0.75;
  transform: scale(0.97);
  box-shadow: 0 2rpx 12rpx $shadow-light;
}

.baby-left {
  display: flex;
  align-items: center;
}

.baby-avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
  transform: rotate(3deg);
  margin-right: 24rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #FFCC80 0%, #FFE0B2 100%);
}

.avatar-text {
  font-size: 48rpx;
  color: $meal-lunch;
}

.baby-info {
  display: flex;
  flex-direction: column;
}

.baby-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.baby-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  margin-right: 12rpx;
}

.age-badge {
  background: #FFF3E0;
  color: $meal-lunch;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.baby-stage {
  font-size: 22rpx;
  color: $text-hint;
  font-weight: 500;
}

.chevron {
  font-size: 40rpx;
  color: #ccc;
}

/* 生成按钮 */
.generate-btn {
  width: 100%;
  background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
  border-radius: 28rpx;
  padding: 48rpx;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 24rpx;
  box-sizing: border-box;
  box-shadow: 0 12rpx 30rpx -10px rgba(255, 107, 107, 0.6);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: none;
  text-align: left;
}

.decor {
  position: absolute;
  top: -80rpx;
  right: -80rpx;
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.chef-icon {
  position: absolute;
  top: 40rpx;
  right: 40rpx;
  font-size: 80rpx;
  opacity: 0.2;
}

.badge {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.wand-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.label {
  font-size: 20rpx;
  font-weight: 600;
  color: rgba(255, 235, 205, 0.9);
  letter-spacing: 1px;
}

.title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.title {
  font-size: 44rpx;
  font-weight: 800;
  color: #fff;
}

.sparkle {
  font-size: 28rpx;
  margin-left: 12rpx;
}

.desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 历史与收藏 */
.grid-2 {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.history-card,
.fav-card {
  flex: 1;
  background: $card-bg;
  border-radius: $card-radius;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx $shadow-light;
  position: relative;
  overflow: hidden;
  border: none;
  text-align: left;
  transition: all 0.2s ease;
}

.history-card:active,
.fav-card:active {
  opacity: 0.72;
  transform: scale(0.96);
}

.card-decor-blue,
.card-decor-pink {
  position: absolute;
  right: -40rpx;
  bottom: -40rpx;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
}

.card-decor-blue {
  background: #EFF6FF;
}

.card-decor-pink {
  background: #FFF1F2;
}

.card-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.card-icon-wrap.blue {
  background: rgba(59, 130, 246, 0.1);
}

.card-icon-wrap.pink {
  background: rgba(244, 63, 94, 0.1);
}

.card-icon {
  font-size: 36rpx;
}

.card-text {
  position: relative;
  z-index: 1;
}

.card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.card-subtitle {
  display: block;
  font-size: 20rpx;
  color: $text-hint;
}

/* 今日推荐四餐 */
.meals-section {
  padding-top: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.action-btn {
  background: #FFF3E0;
  color: $meal-lunch;
  font-size: 22rpx;
  font-weight: 500;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  border: none;
}

.action-btn.btn-loading {
  background: rgba(255, 155, 94, 0.15);
  color: rgba(255, 107, 107, 0.6);
}

.header-btns {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meals-card {
  background: $card-bg;
  border-radius: 28rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx $shadow-light;
}

.timeline-wrap {
  position: relative;
  padding-left: 48rpx;
}

.timeline-line {
  position: absolute;
  left: 15px;
  top: 16px;
  bottom: 16px;
  width: 2px;
  background: rgba(255, 152, 130, 0.6);
  z-index: 0;
}

.timeline-list {
  position: relative;
  z-index: 10;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 48rpx;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  margin-left: -48rpx;
  margin-right: 24rpx;
}

.timeline-dot.breakfast { background: #FEF3C7; }
.timeline-dot.lunch { background: #FFEDD5; }
.timeline-dot.snack { background: #FFF1F2; }
.timeline-dot.dinner { background: #EEF2FF; }

.meal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meal-header {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.meal-type {
  font-size: 26rpx;
  font-weight: 700;
  color: $text-primary;
  margin-right: 16rpx;
}

.meal-time {
  font-size: 20rpx;
  color: $text-hint;
  font-weight: 500;
}

.meal-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.meal-ingredients-wrap {
  display: inline-block;
  align-self: flex-start;
  background: #f9f9f9;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  border: 1rpx solid #f0f0f0;
  margin-bottom: 8rpx;
}

.meal-ingredients {
  font-size: 20rpx;
  color: $text-secondary;
  line-height: 1.4;
}

.recipe-btn-wrap {
  display: flex;
  align-items: center;
  margin-top: 4rpx;
}

.recipe-btn-text {
  color: #f97316;
  font-size: 22rpx;
  font-weight: 500;
  margin-right: 4rpx;
}

/* 试用模式弹窗 */
.trial-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
  }

  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600rpx;
    background: $card-bg;
    border-radius: 20rpx;
    padding: 40rpx;
  }

  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
    text-align: center;
    margin-bottom: 32rpx;
  }

  .trial-input {
    border: 1rpx solid #eee;
    border-radius: 12rpx;
    padding: 24rpx;
    font-size: 28rpx;
    margin-bottom: 32rpx;
  }

  .modal-btns {
    display: flex;
    gap: 24rpx;

    .btn-cancel,
    .btn-confirm {
      flex: 1;
      height: 88rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      border: none;
    }

    .btn-cancel {
      background: #f5f5f5;
      color: $text-secondary;
    }

    .btn-confirm {
      background: linear-gradient(135deg, $primary-gradient-start 0%, $primary-gradient-end 100%);
      color: #fff;
    }
  }
}

/* 调试日志浮标 */
.debug-float {
  position: fixed;
  right: 24rpx;
  bottom: 200rpx;
  width: 80rpx;
  height: 80rpx;
  background: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.debug-btn {
  font-size: 36rpx;
}

/* 调试日志面板 */
.debug-panel {
  position: fixed;
  left: 24rpx;
  right: 120rpx;
  bottom: 200rpx;
  height: 500rpx;
  background: #1a1a1a;
  border-radius: 20rpx;
  overflow: hidden;
  z-index: 998;
  box-shadow: 0 4rpx 30rpx rgba(0, 0, 0, 0.4);
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #2a2a2a;
}

.debug-title {
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}

.debug-close {
  color: #888;
  font-size: 28rpx;
  padding: 8rpx;
}

.debug-content {
  padding: 20rpx 24rpx;
  height: calc(500rpx - 80rpx);
  background: #111;
}

.log-line {
  display: block;
  color: #0f0;
  font-size: 22rpx;
  font-family: monospace;
  line-height: 1.8;
  word-break: break-all;
}

.log-empty {
  color: #666;
}
</style>
