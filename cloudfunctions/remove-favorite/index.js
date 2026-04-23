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
    return { success: false, error: '缺少收藏ID' }
  }

  try {
    const db = cloud.database()
    await db.collection('recipes').doc(id).update({
      data: {
        is_favorite: false
      }
    })

    return { success: true }
  } catch (err) {
    console.error('remove-favorite error:', err)
    return { success: false, error: err.message || '取消收藏失败' }
  }
}
