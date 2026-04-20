// 云函数服务封装

export const cloudService = {
  // 生成食谱
  generateRecipe(params: {
    ageMonths: number
    allergies?: string[]
    tastePreferences?: { like?: string[]; dislike?: string[] }
    trial?: boolean
    profileId?: string
  }) {
    return uni.cloud.callFunction({
      name: 'generate-recipe',
      data: params
    })
  },

  // 获取档案列表
  getProfile() {
    return uni.cloud.callFunction({
      name: 'get-profile'
    })
  },

  // 保存档案
  saveProfile(profile: {
    nickname: string
    birthday: string
    gender: 'male' | 'female'
    city: string
    allergies?: string[]
    tasteLike?: string[]
    tasteDislike?: string[]
    isDefault?: boolean
  }) {
    return uni.cloud.callFunction({
      name: 'save-profile',
      data: profile
    })
  },

  // 删除档案
  deleteProfile(id: string) {
    return uni.cloud.callFunction({
      name: 'delete-profile',
      data: { id }
    })
  },

  // 获取历史记录
  getHistory(params: { filter?: string; page?: number; pageSize?: number }) {
    return uni.cloud.callFunction({
      name: 'get-history',
      data: params
    })
  },

  // 保存反馈
  saveFeedback(recipeId: string, type: 'favorite' | 'dislike', reason?: string) {
    return uni.cloud.callFunction({
      name: 'save-feedback',
      data: { recipeId, type, reason }
    })
  },

  // 采纳食谱
  adoptRecipe(recipeId: string) {
    return this.saveFeedback(recipeId, 'favorite')
  }
}

// 工具函数
export const utils = {
  // 计算月龄
  calculateAgeMonths(birthday: string): number {
    const birth = new Date(birthday)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    const days = now.getDate() - birth.getDate()
    return months + (days < 0 ? -1 : 0)
  },

  // 格式化日期
  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return '今天'
    if (date.toDateString() === yesterday.toDateString()) return '昨天'

    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}