// 完全简化版 - 无任何依赖
exports.main = async (event, context) => {
  console.log('generate-recipe 被调用')
  return {
    success: true,
    message: '简化版 generate-recipe 工作正常',
    meals: [
      { type: '早餐', name: '南瓜鳕鱼粥', ingredients: ['南瓜', '鳕鱼', '大米'], steps: ['南瓜去皮切块', '鳕鱼蒸熟捣碎', '大米煮粥加入南瓜和鳕鱼'] },
      { type: '午餐', name: '胡萝卜蒸蛋', ingredients: ['胡萝卜', '鸡蛋', '温水'], steps: ['胡萝卜切碎', '鸡蛋打散加入温水', '放入胡萝卜碎蒸熟'] },
      { type: '下午茶', name: '苹果小米饼', ingredients: ['苹果', '小米粉', '鸡蛋'], steps: ['苹果擦丝', '加入小米粉和鸡蛋搅拌', '小火煎熟'] },
      { type: '晚餐', name: '菠菜猪肝粥', ingredients: ['菠菜', '猪肝', '大米'], steps: ['菠菜焯水切碎', '猪肝煮熟切小块', '大米煮粥加入菠菜和猪肝'] }
    ]
  }
}
