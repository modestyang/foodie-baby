const wxcloud = require('wx-server-sdk')
wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, error: '无法获取用户身份' }
  }

  const { page = 1, pageSize = 50 } = event

  try {
    const db = cloud.database()
    const offset = (Number(page) - 1) * Number(pageSize)

    const res = await db.collection('recipes')
      .where({ _openid: openid, is_favorite: true })
      .orderBy('favorited_at', 'desc')
      .skip(offset)
      .limit(Number(pageSize))
      .get()

    return {
      success: true,
      list: res.data || [],
      total: res.total || 0
    }
  } catch (err) {
    console.error('get-favorites error:', err)
    return { success: false, error: err.message || '查询失败', list: [] }
  }
}
