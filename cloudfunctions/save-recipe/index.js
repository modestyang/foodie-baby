const wxcloud = require('wx-server-sdk')
wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, error: '无法获取用户身份' }
  }

  const { meals, dateStr } = event

  if (!meals || !Array.isArray(meals)) {
    return { success: false, error: '缺少食谱数据' }
  }

  try {
    const db = cloud.database()
    // 统一使用客户端传入的 dateStr，避免时区问题
    const todayStr = dateStr

    const res = await db.collection('recipes').add({
      data: {
        _openid: openid,
        meals,
        status: 'pending',
        is_favorite: false,
        created_at: new Date(),
        created_at_str: todayStr
      }
    })

    return { success: true, id: res._id }
  } catch (err) {
    console.error('save-recipe error:', err)
    return { success: false, error: err.message || '保存失败' }
  }
}