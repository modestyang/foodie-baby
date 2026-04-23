// TabBar 全局状态（所有 TabBar 实例共享）
import { ref } from 'vue'

// TabBar 对应的页面路径
const tabBarPages = ['/pages/index/index', '/pages/history/history', '/pages/my/my']

// 根据当前页面获取 tabBar 索引
const getTabBarIndex = () => {
  const pages = getCurrentPages()
  if (!pages.length) return 0
  const route = `/${pages[pages.length - 1].route}`
  const idx = tabBarPages.indexOf(route)
  return idx !== -1 ? idx : 0
}

const currentIndex = ref(getTabBarIndex())
const currentRoute = ref('')

export function useTabBarState() {
  return { currentIndex, currentRoute }
}

// 每次小程序显示时同步 tabBar 状态
uni.onAppShow(() => {
  const idx = getTabBarIndex()
  currentIndex.value = idx
})