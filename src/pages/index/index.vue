<template>
  <view class="page-container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <text class="nav-title">辅食日记</text>
      <view class="nav-avatar" @click="goToProfile">
        <text class="iconfont icon-baby avatar-icon"></text>
        <view class="avatar-badge"></view>
      </view>
    </view>

    <!-- 主内容区 -->
    <scroll-view class="main-content" scroll-y>
      <!-- 1. 宝宝信息卡片 -->
      <view class="baby-card" @click="goToProfile">
        <view class="baby-left">
          <view class="baby-avatar">
            <text class="avatar-text">团</text>
          </view>
          <view class="baby-info">
            <view class="baby-name-row">
              <text class="baby-name">小团子</text>
              <text class="age-badge">8月龄</text>
            </view>
            <text class="baby-stage">已进入"块状食物"适应期</text>
          </view>
        </view>
        <text class="iconfont icon-right chevron"></text>
      </view>

      <!-- 2. AI生成按钮 -->
      <button class="ai-generate-btn" @click="handleGenerate" :disabled="isLoading">
        <view class="ai-decor"></view>
        <text class="iconfont icon-service chef-icon"></text>
        <view class="ai-badge">
          <text class="wand-icon">✨</text>
          <text class="ai-label">AI Smart Menu</text>
        </view>
        <view class="ai-title-row">
          <text class="ai-title">定制今日食谱</text>
          <text class="sparkle">✨</text>
        </view>
        <text class="ai-desc">根据小团子营养需求，智能规划四餐</text>
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
      <view class="meals-section">
        <view class="section-header">
          <text class="section-title">今日推荐四餐</text>
          <button class="refresh-btn">换一换</button>
        </view>

        <view class="meals-card">
          <view class="timeline">
            <!-- 早餐 -->
            <view class="timeline-item">
              <view class="timeline-dot breakfast">
                <text class="iconfont icon-timefill dot-icon"></text>
              </view>
              <view class="meal-content">
                <view class="meal-header">
                  <text class="meal-type">早餐</text>
                  <text class="meal-time">08:00</text>
                </view>
                <text class="meal-title">苹果燕麦泥</text>
                <text class="meal-ingredients">苹果 50g, 燕麦 20g</text>
                <button class="recipe-btn" @click="showMealDetail(0)">做法 ›</button>
              </view>
            </view>

            <!-- 午餐 -->
            <view class="timeline-item">
              <view class="timeline-dot lunch">
                <text class="iconfont icon-service dot-icon"></text>
              </view>
              <view class="meal-content">
                <view class="meal-header">
                  <text class="meal-type">午餐</text>
                  <text class="meal-time">12:00</text>
                </view>
                <text class="meal-title">三文鱼土豆浓汤</text>
                <text class="meal-ingredients">三文鱼 30g, 土豆 40g, 奶 20ml</text>
                <button class="recipe-btn" @click="showMealDetail(1)">做法 ›</button>
              </view>
            </view>

            <!-- 下午茶 -->
            <view class="timeline-item">
              <view class="timeline-dot snack">
                <text class="iconfont icon-favorfill dot-icon"></text>
              </view>
              <view class="meal-content">
                <view class="meal-header">
                  <text class="meal-type">下午茶</text>
                  <text class="meal-time">15:30</text>
                </view>
                <text class="meal-title">香蕉软松饼</text>
                <text class="meal-ingredients">香蕉半根, 面粉 20g, 蛋黄 1个</text>
                <button class="recipe-btn" @click="showMealDetail(2)">做法 ›</button>
              </view>
            </view>

            <!-- 晚餐 -->
            <view class="timeline-item">
              <view class="timeline-dot dinner">
                <text class="iconfont icon-homefill dot-icon"></text>
              </view>
              <view class="meal-content">
                <view class="meal-header">
                  <text class="meal-type">晚餐</text>
                  <text class="meal-time">18:30</text>
                </view>
                <text class="meal-title">番茄牛肉软面</text>
                <text class="meal-ingredients">番茄 30g, 牛肉 20g, 碎面 25g</text>
                <button class="recipe-btn" @click="showMealDetail(3)">做法 ›</button>
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
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isLoading = ref(false)
const showTrialModal = ref(false)
const trialAge = ref<number | null>(null)
const profile = ref<any>(null)
const todayMeals = ref<any[]>([])

// API 配置
const API_KEY = 'sk-fcb46129ad3c44b5b3b294fc8245d972'
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

// 获取宝宝档案
const loadProfile = async () => {
  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'get-profile',
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success && res.result?.data?.length > 0) {
      profile.value = res.result.data.find((p: any) => p.isDefault) || res.result.data[0]
    }
  } catch (err) {
    console.error('获取档案失败:', err)
  }
}

// 加载今日食谱
const loadTodayRecipe = async () => {
  try {
    const res: any = await new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'get-today-recipe',
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success && res.result?.data) {
      todayMeals.value = res.result.data.meals || []
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

  if (profile.value) {
    await generateWithProfile()
  } else {
    showTrialModal.value = true
  }
}

// 构建AI提示词
const buildPrompt = (ageMonths: number, allergies: string[], tastePreferences: string[]) => {
  let prompt = `你是一个专业的宝宝辅食营养师。请为${ageMonths}月龄的宝宝生成一日四餐的辅食食谱。`

  if (allergies?.length) {
    prompt += `\n食谱需避免以下过敏原：${allergies.join('、')}`
  }
  if (tastePreferences?.length) {
    prompt += `\n宝宝口味偏好：${tastePreferences.join('、')}`
  }

  prompt += `\n重要：只返回纯JSON字符串，不要任何markdown格式、不要代码块、不要注释。格式如下：\n{"meals":[{"type":"早餐","name":"","ingredients":[""],"steps":[""]},{"type":"午餐","name":"","ingredients":[""],"steps":[""]},{"type":"下午茶","name":"","ingredients":[""],"steps":[""]},{"type":"晚餐","name":"","ingredients":[""],"steps":[""]}]}`

  return prompt
}

// 调用百炼 API
const callLLMAPI = async (prompt: string) => {
  console.log('调用百炼 API...')
  const token = uni.getStorageSync('api_key') || API_KEY

  const res = await new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/chat/completions`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      data: {
        model: 'qwen3.5-35b-a3b',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的宝宝辅食营养师。你必须始终返回一个合法的JSON对象，不要返回任何JSON之外的文本。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      },
      success: (res: any) => {
        console.log('百炼响应:', res)
        resolve(res)
      },
      fail: (err: any) => {
        console.error('百炼请求失败:', err)
        reject(err)
      }
    })
  })

  const data = (res as any).data
  if (data && data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content
  }
  return null
}

// 调用AI生成食谱
const generateWithAI = async (ageMonths: number, allergies: string[], tastePreferences: string[]) => {
  const prompt = buildPrompt(ageMonths, allergies, tastePreferences)

  try {
    console.log('尝试调用百炼 API...')
    const result = await callLLMAPI(prompt)
    if (result) {
      console.log('百炼 返回:', result)
      return result
    }
  } catch (e) {
    console.log('百炼 调用失败，尝试腾讯混元:', e)
  }

  if (typeof wx !== 'undefined' && wx.cloud && wx.cloud.extend && wx.cloud.extend.AI) {
    console.log('使用 wx.cloud.extend.AI (腾讯混元)')
    const ai = wx.cloud.extend.AI
    const model = ai.createModel('hunyuan-exp')
    const res = await model.generateText({
      model: 'hunyuan-2.0-instruct-20251111',
      messages: [{ role: 'user', content: prompt }]
    })
    console.log('腾讯混元响应:', res)
    return res.choices?.[0]?.message?.content || ''
  }

  return null
}

// 解析AI返回的JSON
const parseMealsFromResponse = (content: string | null) => {
  if (!content) return null

  try {
    const parsed = JSON.parse(content)
    if (parsed.meals && Array.isArray(parsed.meals)) {
      return parsed.meals
    }
    if (Array.isArray(parsed)) {
      return parsed
    }
  } catch (e) {
    console.error('解析失败:', e)
  }
  return null
}

// 使用档案生成
const generateWithProfile = async () => {
  isLoading.value = true
  try {
    const content = await generateWithAI(
      profile.value.ageMonths,
      profile.value.allergies || [],
      [...(profile.value.tasteLike || []), ...(profile.value.tasteDislike || [])]
    )

    const meals = parseMealsFromResponse(content)

    if (meals && meals.length > 0) {
      await saveRecipe(meals)
      todayMeals.value = meals
      uni.navigateTo({
        url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(meals))}`
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

// 保存食谱
const saveRecipe = async (meals: any[]) => {
  try {
    const res: any = await new Promise((resolve, reject) => {
      ;(uni as any).cloud.callFunction({
        name: 'save-recipe',
        data: { meals },
        success: (r: any) => resolve(r),
        fail: (err: any) => reject(err)
      })
    })
    if (res.result?.success) {
      console.log('食谱已保存:', res.result.id)
    }
  } catch (err) {
    console.error('保存食谱失败:', err)
  }
}

// 确认试用模式
const confirmTrial = async () => {
  const age = trialAge.value
  if (!age || age < 6 || age > 36) {
    uni.showToast({ title: '请输入6-36之间的月龄', icon: 'none' })
    return
  }

  showTrialModal.value = false
  isLoading.value = true

  try {
    const content = await generateWithAI(age, [], [])
    const meals = parseMealsFromResponse(content)

    if (meals && meals.length > 0) {
      await saveRecipe(meals)
      todayMeals.value = meals
      uni.navigateTo({
        url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(meals))}`
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
    uni.navigateTo({
      url: `/pages/recipe/recipe?data=${encodeURIComponent(JSON.stringify(todayMeals.value))}`
    })
  } else {
    // 模拟数据
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

// 导航
const goToProfile = () => {
  uni.navigateTo({ url: '/pages/profile/profile' })
}

const goToHistory = () => {
  uni.navigateTo({ url: '/pages/history/history' })
}

const goToFavorites = () => {
  uni.navigateTo({ url: '/pages/favorites/favorites' })
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
  padding: 16rpx 24rpx 120rpx;
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

/* AI生成按钮 */
.ai-generate-btn {
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

.ai-decor {
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

.ai-badge {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.wand-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.ai-label {
  font-size: 20rpx;
  font-weight: 600;
  color: rgba(255, 235, 205, 0.9);
  letter-spacing: 1px;
}

.ai-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.ai-title {
  font-size: 44rpx;
  font-weight: 800;
  color: #fff;
}

.sparkle {
  font-size: 28rpx;
  margin-left: 12rpx;
}

.ai-desc {
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

.refresh-btn {
  background: #FFF3E0;
  color: $meal-lunch;
  font-size: 22rpx;
  font-weight: 500;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  border: none;
}

.meals-card {
  background: $card-bg;
  border-radius: 28rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx $shadow-light;
}

.timeline {
  position: relative;
  padding-left: 40rpx;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 16rpx;
  top: 0;
  bottom: 0;
  width: 4rpx;
  background: rgba(255, 152, 130, 0.3);
  border-radius: 2rpx;
}

.timeline-item {
  position: relative;
  padding-bottom: 48rpx;
  padding-left: 64rpx;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -64rpx;
  top: 0;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.timeline-dot.breakfast { background: #FEF3C7; }
.timeline-dot.lunch { background: #FFEDD5; }
.timeline-dot.snack { background: #FFF1F2; }
.timeline-dot.dinner { background: #EEF2FF; }

.dot-icon {
  font-size: 24rpx;
}

.meal-content {
  display: flex;
  flex-direction: column;
  padding-top: 12rpx;
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

.meal-ingredients {
  font-size: 20rpx;
  color: $text-secondary;
  background: #f9f9f9;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  border: 1rpx solid #f0f0f0;
  display: inline-block;
  margin-bottom: 8rpx;
}

.recipe-btn {
  color: $primary-gradient-start;
  font-size: 22rpx;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
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
</style>
