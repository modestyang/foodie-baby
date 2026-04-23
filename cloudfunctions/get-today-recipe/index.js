const wxcloud = require('wx-server-sdk')
wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, error: '无法获取用户身份' }
  }

  try {
    const db = cloud.database()
    // 统一使用客户端传入的 dateStr，避免时区问题
    const { dateStr } = event
    const today = dateStr

    // 查找今天创建的食谱（未反馈的）
    const res = await db.collection('recipes')
      .where({
        _openid: openid,
        created_at_str: today,
        status: 'pending'
      })
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()

    if (res.data && res.data.length > 0) {
      return { success: true, data: res.data[0] }
    }

    return { success: false, error: '今日暂无食谱' }
  } catch (err) {
    console.error('get-today-recipe error:', err)
    return { success: false, error: err.message || '获取失败' }
  }
}