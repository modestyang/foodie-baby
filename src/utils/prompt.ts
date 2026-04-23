// 构建AI提示词（统一入口）
export const buildPrompt = (
  ageMonths: number,
  allergies: string[],
  tastePreferences: string[],
  diversityPrefer: string = 'diverse',
  city?: string
) => {
  // 获取当前日期用于时令食材推荐
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const dateInfo = `${now.getFullYear()}年${month}月${day}日`

  // 月龄阶段对应的营养重点
  const getNutritionFocus = (age: number) => {
    if (age <= 6) return '此阶段宝宝刚添加辅食，以糊状、流质为主，食材需细腻软烂'
    if (age <= 9) return '此阶段宝宝可以吃碎末状、小颗粒辅食，训练咀嚼能力'
    if (age <= 12) return '此阶段宝宝可以吃软烂的手指食物，锻炼自主进食'
    return '此阶段宝宝可以吃小块状食物，鼓励自主进食，注意营养均衡'
  }

  let prompt = `你是一个专业的宝宝辅食营养师。今天是${dateInfo}，请为${ageMonths}月龄的宝宝生成一日四餐的辅食食谱。`
  prompt += `\n${getNutritionFocus(ageMonths)}`

  if (allergies?.length) {
    prompt += `\n食谱需避免以下过敏原：${allergies.join('、')}`
  }
  if (tastePreferences?.length) {
    prompt += `\n宝宝口味偏好：${tastePreferences.join('、')}`
  }

  if (diversityPrefer === 'single') {
    prompt += `\n重要要求：食谱应该单一化。每餐建议只做一道主菜，但这道菜的食材搭配必须满足营养均衡（包含蛋白质、碳水化合物、蔬菜等），例如"A类谷物B类蔬菜粥"这样一道辅食就包含了多种营养。连续多日的主菜品类要固定重复，不要每天换花样。菜名格式示例："A肉B菜粥"、"C鱼D面"。`
  } else {
    prompt += `\n重要要求：食谱必须真正多样化。
1. 每餐建议包含多道菜（至少2道以上），菜名之间用"+"连接以示区分，例如"A粥+B菜肉丸"、"B饭+C鱼+D菜"。菜名要能明确看出是多道菜，不能把多道菜名合并成一个看不懂的字符串。
2. 连续多日的餐次搭配要有明显差异，今天午餐吃某类组合，明天午餐换完全不同类型的组合，每天、每餐的菜品种类都不要重复，真正做到天天不重样。
3. 避免总是使用南瓜、小米、苹果、雪梨、山药等常见食材，多用当季特色食材、罕见搭配，同一餐内食材组合要有创意。`
  }

  if (city) {
    prompt += `\n地域参考：${city}（可根据当地当季食材适当调整，但营养均衡原则不变）。`
  }

  prompt += `
核心原则：
- 食材：必须选择日常家庭可轻松采购的食材（如常见蔬菜、肉类、谷物），避免奇稀有食材
- 难度：做法难度系数平均，一道菜控制在10-15分钟以内，步骤简洁易操作
- 营养：每餐必须包含蛋白质（肉/鱼/蛋/豆）、碳水化合物（米/面/薯类）、维生素（蔬菜）三大类，确保营养均衡
- 科学：根据月龄调整食物质地（糊→碎末→颗粒→小块），符合宝宝发育特点`

  prompt += `\n重要：只返回纯JSON字符串，不要任何markdown格式、不要代码块、不要注释。格式要求如下：
- name: 菜名，用具体常见食材命名，如"胡萝卜牛肉粥"、"番茄鸡蛋面"
- ingredients: 食材列表，每项格式为"食材名+重量"，如"胡萝卜 20g"、"牛肉 30g"、"宝宝面条 40g"
- steps: 步骤数组，每步一个字符串，如 ["准备好食材，切碎","放入锅中加水煮沸","煮至软烂后搅拌成泥"]`

  prompt += `\n返回格式：只返回纯JSON，包含meals数组，每项包含type/name/ingredients/steps四个字段，不要有任何额外文本。`

  return prompt
}