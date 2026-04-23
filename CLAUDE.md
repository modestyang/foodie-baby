# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat mini-program (微信小程序) project for generating baby food recipes. The target users are parents of babies aged 0-3 years who need daily meal suggestions.

**Tech Stack:**
- Frontend: UniApp (Vue3 + TypeScript)
- Backend: WeChat Cloud Development (WeChat Cloud Functions)
- AI: MiniMax API

## Architecture

```
┌─────────────────────────────────────────────┐
│         WeChat Mini Program                  │
├─────────────────────────────────────────────┤
│  Pages:                                   │
│  - Home (trial/generation入口)              │
│  - Recipe Detail (一日多餐)                │
│  - Profile (baby档案管理)                  │
│  - History (历史记录)                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       WeChat Cloud Functions                 │
├─────────────────────────────────────────────┤
│  - ai-recipe-generation                    │
│  - baby-profile-management               │
│  - history-sync                          │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         MiniMax API                        │
│    (AI-powered recipe generation)        │
└─────────────────────────────────────────────┘
```

## Development

Since this is a greenfield project, code doesn't exist yet. The project planning uses the **OpenSpec** workflow:

### OpenSpec Commands

```bash
# Explore ideas (thinking partner)
/opsx:explore <topic>

# Propose new changes
/opsx:propose <change-name>

# Continue implementation
/opsx:apply <change-name>

# Archive completed changes
/opsx:archive <change-name>
```

### OpenSpec Artifacts

Project specification is stored in `openspec/changes/`:
- `proposal.md` - Change proposal with why/what
- `design.md` - Design decisions and trade-offs
- `tasks.md` - Implementation task list
- `specs/<capability>/spec.md` - Detailed requirements

**Current active change:** `baby-food-helper`
- AI recipe generation
- Baby profile management
- Trial generation (no registration)
- History management

### Development Phases (from tasks.md)

1. **Phase 1: Project Init** - UniApp setup, WeChat cloud, database collections
2. **Phase 2: Core Features** - Home, generation flow, recipe detail, profile management
3. **Phase 3: Auxiliary** - History, feedback, photo recording
4. **Phase 4: Optimization** - Loading states, error handling, launch

## Skills

Custom skills are documented in `docs/.claude/skills/`:
- `openspec-explore` - Thinking partner mode
- `openspec-propose` - Create new proposals
- `openspec-apply-change` - Implementation workflow
- `openspec-archive-change` - Completion workflow

## Important Conventions

- **Design style**: Minimalist, avoid excessive emojis
- **Trial generation**: Month age input not stored, only used for single generation
- **One-click generation**: Shows full day (breakfast + lunch + afternoon snack + dinner)
- **History awareness**: Pass 7-day summary to AI for smart recommendations
## Build & Deploy

每次修改代码后必须执行：

```bash
npm run build:mp-weixin
```

**输出目录**：`dist/build/mp-weixin/`

**重要**：UniApp CLI 编译时**不会自动复制** `cloudfunctions/` 目录到 `dist/build/mp-weixin/`。每次修改云函数源码后，必须手动将 `cloudfunctions/` 下的内容同步到 `dist/build/mp-weixin/cloudfunctions/`，否则微信开发者工具运行的还是旧代码。

同步命令（修改云函数后执行）：
```bash
cp -r cloudfunctions/* dist/build/mp-weixin/cloudfunctions/
```

**云函数配置**：`dist/build/mp-weixin/project.config.json` 中已配置 `"cloudfunctionRoot": "cloudfunctions/"`，指向编译输出内的 `cloudfunctions/` 目录。

用微信开发者工具导入 `dist/build/mp-weixin/` 即可运行调试。