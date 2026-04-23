// 构建AI提示词（统一入口）
export const buildPrompt = (
  ageMonths: number,
  allergies: string[],
  tastePreferences: string[],
  diversityPrefer: string = 'diverse',
  city?: string
) => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const dateInfo = `${now.getFullYear()}年${month}月${day}日`

  const getNutritionFocus = (age: number) => {
    if (age <= 6) return '糊状、流质食材，细腻软烂'
    if (age <= 9) return '碎末状、小颗粒，训练咀嚼'
    if (age <= 12) return '软烂手指食物，锻炼自主进食'
    return '小块状食物，鼓励自主进食，营养均衡'
  }

  let prompt = `# 角色
你是一个专业的宝宝辅食营养师。

# 任务
今天是${dateInfo}，为${ageMonths}月龄宝宝设计一日四餐（早餐、午餐、下午茶、晚餐）。

## 宝宝信息
- 月龄阶段：${getNutritionFocus(ageMonths)}
${allergies?.length ? `- 过敏原：${allergies.join('、')}` : ''}
${tastePreferences?.length ? `- 口味偏好：${tastePreferences.join('、')}` : ''}
${city ? `- 地域：${city}` : ''}

## 核心要求
- **多样化**：每餐至少2道菜，菜名用"+"连接（如"虾仁粥+番茄蛋"）
- **营养均衡**：每餐包含蛋白质（肉/鱼/蛋/豆）、碳水（米/面/薯）、维生素（蔬菜）
- **食材常见**：日常可采购，避免奇稀有食材
- **难度适中**：每道菜10-15分钟，步骤简洁
- **避免常用**：南瓜、小米、苹果、雪梨、山药

## 输出格式
只返回纯JSON，格式如下：
\`\`\`json
{
  "meals": [
    {"type": "早餐", "name": "菜名1+菜名2", "ingredients": ["食材1 20g", "食材2 30g"], "steps": ["步骤1", "步骤2"]},
    ...
  ]
}
\`\`\`
- name: 菜名用食材命名，如"胡萝卜牛肉粥"
- ingredients: "食材名+重量"，如"胡萝卜 20g"
- steps: 字符串数组，如["切碎食材","加水煮沸"]

不要markdown、不要注释、只返回JSON。`

  return prompt
}