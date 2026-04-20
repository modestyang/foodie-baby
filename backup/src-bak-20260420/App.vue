<script setup lang="ts">
console.log('[App] 1. Script setup start')

import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('[App] 2. onLaunch - 初始化云开发')
  // 初始化云开发
  wx.cloud.init({
    env: 'cloud1-4ggckbdj5e78888c',
    traceUser: true
  })
  console.log('[App] 云开发初始化完成')
})

onShow(() => {
  console.log('[App] 3. onShow')
})

onHide(() => {
  console.log('[App] onHide')
})

console.log('[App] 4. Script setup end')
</script>

<style lang="scss">
@import './static/index.scss';
</style>
