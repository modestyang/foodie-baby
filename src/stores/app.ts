import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const isReady = ref(false)
  const deviceInfo = ref<UniApp.DeviceInfo | null>(null)

  function init() {
    // 获取设备信息
    deviceInfo.value = uni.getSystemInfoSync()
    isReady.value = true
  }

  return {
    isReady,
    deviceInfo,
    init,
  }
})