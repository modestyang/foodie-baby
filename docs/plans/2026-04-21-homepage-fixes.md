# 首页及关联页面修复方案

> **For Claude:** 使用 superpowers:executing-plans 或 superpowers:subagent-driven-development 执行此计划。

**目标：** 修复首页及关联页面的 UI 问题和功能逻辑，统一视觉风格

**架构：** 单次修改涉及多个文件，按优先级依次处理：首页修复 → 关联页面重构 → 云函数/数据层确认

**涉及页面：**
- `src/pages/index/index.vue` - 首页
- `src/pages/history/history.vue` - 历史食谱
- `src/pages/my/my.vue` - 我的页面
- `src/pages/profile/profile.vue` - 宝宝档案
- `src/pages/profile/list.vue` - 档案列表/选择
- `src/pages/favorites/favorites.vue` - 收藏食谱

---

## Task 1: 首页布局修复

**文件：** `src/pages/index/index.vue`

**Step 1: 修复换一换按钮**
```vue
<!-- 移动到右侧，使用 flex justify-between -->
<view class="section-header">
  <text class="section-title">今日推荐四餐</text>
  <button class="refresh-btn" @click="refreshMeals">换一换</button>
</view>
```

**Step 2: 移除顶部标题"辅食日记"，改为"辅食秘籍"**
```vue
<!-- 删除 nav-title，保留导航栏空白或放其他元素 -->
```

**Step 3: 修改宝宝信息卡片 - 有档案显示实际信息，无档案显示引导**
```vue
<!-- 有 profile 时显示真实数据，无时显示引导用户录入 -->
<view class="baby-card" @click="goToProfile">
  <view v-if="profile">
    <!-- 现有真实数据展示 -->
  </view>
  <view v-else class="baby-card-empty">
    <text class="empty-hint">点击录入宝宝档案</text>
  </view>
</view>
```

**Step 4: 修改右上角入口逻辑**
```vue
<!-- 删除 avatar-badge，点击宝宝卡片直接跳转档案页 -->
<!-- 宝宝卡片本身成为唯一入口 -->
```

**Step 5: 在"换一换"旁边添加收藏入口**
```vue
<view class="section-header">
  <text class="section-title">今日推荐四餐</text>
  <view class="header-btns">
    <button class="icon-btn" @click="goToFavorites">
      <zx-icon name="favor" :size="20" color="#f97316" />
    </button>
    <button class="refresh-btn" @click="refreshMeals">换一换</button>
  </view>
</view>
```

---

## Task 2: 首页逻辑修复

**文件：** `src/pages/index/index.vue`

**Step 1: 实现 refreshMeals 方法**
```typescript
const refreshMeals = async () => {
  if (todayMeals.value.length > 0) {
    // 调用云函数重新生成
    await generateWithProfile()
  }
}
```

**Step 2: 修改 handleGenerate 逻辑 - 无档案时先引导录入**
```typescript
const handleGenerate = async () => {
  if (isLoading.value) return
  if (!profile.value) {
    uni.showModal({
      title: '提示',
      content: '请先录入宝宝档案',
      confirmText: '去录入',
      success: (res) => {
        if (res.confirm) goToProfile()
      }
    })
    return
  }
  await generateWithProfile()
}
```

**Step 3: 修改宝宝卡片点击 - 无档案时跳转录入，有档案时跳转详情**
```typescript
const goToProfile = () => {
  if (profile.value) {
    uni.navigateTo({ url: '/pages/profile/profile' })
  } else {
    uni.navigateTo({ url: '/pages/profile/profile?action=add' })
  }
}
```

---

## Task 3: 历史食谱页面重构

**文件：** `src/pages/history/history.vue`

**目标：** 保持与首页一致的卡片风格（圆角、阴影、装饰圆）

**需要统一的样式：**
- `.history-card` → 使用首页卡片样式
- 顶部标题区
- 卡片内时间/标题/食材布局
- 装饰圆 `.card-decor-blue`

---

## Task 4: 我的页面重构

**文件：** `src/pages/my/my.vue`

**目标：** 统一风格，包括：
- 页面标题
- 功能卡片样式（历史食谱、收藏食谱、设置等）
- 统一字体和间距

---

## Task 5: 收藏食谱页面重命名和调整

**文件：** `src/pages/favorites/favorites.vue`

**改动：**
- 页面标题从"收藏食谱"改为"我的收藏"
- 检查点击收藏的入口是否正常

---

## Task 6: 宝宝档案页面风格统一

**文件：** `src/pages/profile/profile.vue`

**目标：** 与首页风格统一
- 卡片样式
- 按钮样式
- 输入框样式
- 颜色变量使用

---

## Task 7: 编译验证

**Step 1: 编译项目**
```bash
npm run dev:mp-weixin
```

**Step 2: 检查报错并修复**

---

## 执行方式

**选择 1: Subagent-Driven（当前会话）** - 我逐个任务派发子代理，任务间审查，快速迭代

**选择 2: Parallel Session（新会话）** - 在 worktree 中开新会话，使用 executing-plans 批量执行

**选择哪个？**