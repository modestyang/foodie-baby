## ADDED Requirements

### Requirement: 创建宝宝档案
系统 SHALL 允许用户录入宝宝的档案信息。

#### Scenario: 录入必填信息
- **WHEN** 用户首次录入档案
- **THEN** 必须填写：昵称、出生日期、性别、城市；可选填：过敏原、口味偏好

#### Scenario: 自动计算月龄
- **WHEN** 用户输入出生日期
- **THEN** 系统自动计算宝宝月龄并显示

### Requirement: 管理多个宝宝
系统 SHALL 允许用户添加、编辑、删除多个宝宝的档案。

#### Scenario: 添加多宝宝
- **WHEN** 用户添加第2个宝宝
- **THEN** 在档案列表中显示多个宝宝卡片，支持切换

#### Scenario: 编辑档案
- **WHEN** 用户编辑已有档案
- **THEN** 更新云端数据，刷新显示

### Requirement: 多宝宝生成策略
系统 SHALL 支持多个宝宝时选择分别生成或统一生成。

#### Scenario: 选择生成策略
- **WHEN** 用户有多个宝宝档案
- **THEN** 生成前可选择"统一生成"或"分别生成"

### Requirement: 设置默认宝宝
系统 SHALL 允许用户设置默认档案用于快速生成。

#### Scenario: 设置默认
- **WHEN** 用户设置默认档案
- **THEN** 标记该档案为默认，生成时默认使用