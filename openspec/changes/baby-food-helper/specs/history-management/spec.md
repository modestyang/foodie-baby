## ADDED Requirements

### Requirement: 查看历史记录
系统 SHALL 允许用户查看过往生成的食谱记录。

#### Scenario: 按日期查看
- **WHEN** 用户进入历史记录页面
- **THEN** 按日期倒序列出历史记录，支持筛选（今日/本周/本月/全部）

#### Scenario: 查看详情
- **WHEN** 用户点击某条历史记录
- **THEN** 跳转到食谱详情页，展示完整内容

### Requirement: 复用历史食谱
系统 SHALL 允许用户选择历史食谱复用。

#### Scenario: 复用食谱
- **WHEN** 用户在历史记录中点击"复用"
- **THEN** 使用该食谱作为模板重新生成（日期更新为今天）

### Requirement: 成果记录
系统 SHALL 允许用户记录宝宝实际吃辅食的情况。

#### Scenario: 拍照记录
- **WHEN** 用户点击"成果记录"
- **THEN** 可以拍照或从相册选择，添加备注后存入历史