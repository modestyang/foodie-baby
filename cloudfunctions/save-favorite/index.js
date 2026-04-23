const wxcloud = require('wx-server-sdk')
wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, error: '无法获取用户身份' }
  }

  const { id } = event

  if (!id) {
    return { success: false, error: '缺少食谱ID' }
  }

  try {
    const db = cloud.database()
    await db.collection('recipes').doc(id).update({
      data: {
        is_favorite: true,
        favorited_at: new Date()
      }
    })

    return { success: true }
  } catch (err) {
    console.error('save-favorite error:', err)
    return { success: false, error: err.message || '收藏失败' }
  }
}
