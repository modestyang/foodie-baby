# Proposal: baby-food-helper

## Why

新手父母每天面临"给宝宝做什么辅食"的选择困难市面上的辅食APP大多功能复杂、需要订阅推送，且内容同质化。用户需要一个简单高效的工具：一键生成符合宝宝月龄、口味的科学辅食安排。

## What Changes

开发一款微信小程序宝宝辅食助手，核心功能：
- 一键生成每日辅食安排（AI驱动）
- 宝宝档案管理（支持多宝宝）
- 历史记录查看与复用
- 试用生成（无需注册即可体验）

MVP阶段不做：
- 推送服务
- 电商功能
- 社区分享

## Capabilities

### New Capabilities
- `ai-recipe-generation`: AI生成宝宝辅食食谱
- `baby-profile-management`: 宝宝档案管理，支持多宝宝
- `trial-generation`: 试用生成，无需档案
- `history-management`: 历史记录查看与复用

### Modified Capabilities
- 无（全新项目）

## Impact

- 新增微信小程序 前端
- 新增云函数后端
- 接入 MiniMax AI API

---

## Appendix: 产品概述

### 目标用户
- 0-3岁宝宝家长
- 新手妈妈/职场妈妈

### 核心流程
```
用户打开 → 试用/正式生成 → 查看食谱 → 采纳/反馈
```

### 技术栈
- 前端: UniApp (Vue3 + TS)
- 后端: 微信云开发
- AI: MiniMax API