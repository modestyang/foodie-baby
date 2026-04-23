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
    const res = await db.collection('recipes').doc(id).get()

    if (res.data && res.data._openid === openid) {
      return { success: true, data: res.data }
    }

    return { success: false, error: '未找到该食谱' }
  } catch (err) {
    console.error('get-recipe error:', err)
    return { success: false, error: err.message || '获取失败' }
  }
}