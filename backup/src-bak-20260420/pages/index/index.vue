<template>
  <view class="container">
    <view class="header">
      <text class="title">宝宝辅食</text>
    </view>

    <view class="main-action">
      <view class="generate-btn" @click="handleGenerate">
        <text class="btn-text">{{ isLoading ? '生成中...' : '生成今日食谱' }}</text>
        <text class="btn-desc">点击生成宝宝今日辅食</text>
      </view>
    </view>

    <view class="tips" @click="goToProfile">
      <text class="tips-text">录入宝宝信息，获取更精准的食谱 ></text>
    </view>

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
import { ref } from 'vue'

const isLoading = ref(false)
const showTrialModal = ref(false)
const trialAge = ref<number | null>(null)
const profile = ref<any>(null)

// 阿里云百炼 API 配置
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
        model: 'glm-5.1',
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

  // 优先使用百炼
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

  // 降级到腾讯混元
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
      console.log('解析成功:', parsed.meals)
      return parsed.meals
    }
    if (Array.isArray(parsed)) {
      console.log('解析成功（数组）:', parsed)
      return parsed
    }
    console.log('内容不是有效JSON格式:', content.substring(0, 200))
  } catch (e) {
    console.error('解析失败:', e, '原始内容:', content?.substring(0, 300))
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
    } else {
      console.error('保存失败:', res.result?.error)
      uni.showToast({ title: '保存失败', icon: 'none' })
    }
  } catch (err) {
    console.error('保存食谱失败:', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
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

const goToProfile = () => {
  uni.navigateTo({ url: '/pages/profile/profile' })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40rpx 32rpx;
}

.header {
  padding: 40rpx 0;

  .title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
  }
}

.main-action {
  margin-top: 60rpx;

  .generate-btn {
    background: #4CAF50;
    border-radius: 16rpx;
    padding: 64rpx 32rpx;
    display: flex;
    flex-direction: column;
    align-items: center;

    .btn-text {
      font-size: 36rpx;
      font-weight: 600;
      color: #fff;
    }

    .btn-desc {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 16rpx;
    }
  }
}

.tips {
  margin-top: 48rpx;
  text-align: center;

  .tips-text {
    font-size: 26rpx;
    color: #999;
  }
}

// 试用模式弹窗
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
    background: #fff;
    border-radius: 16rpx;
    padding: 40rpx;

    .modal-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin-bottom: 32rpx;
    }

    .trial-input {
      border: 1rpx solid #ddd;
      border-radius: 8rpx;
      padding: 20rpx;
      font-size: 28rpx;
      margin-bottom: 32rpx;
    }

    .modal-btns {
      display: flex;
      gap: 24rpx;

      .btn-cancel,
      .btn-confirm {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
      }

      .btn-cancel {
        background: #f5f5f5;
        color: #666;
      }

      .btn-confirm {
        background: #4CAF50;
        color: #fff;
      }
    }
  }
}
</style>
