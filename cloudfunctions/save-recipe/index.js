const wxcloud = require('wx-server-sdk')
wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, error: '无法获取用户身份' }
  }

  const { meals } = event

  if (!meals || !Array.isArray(meals)) {
    return { success: false, error: '缺少食谱数据' }
  }

  try {
    const db = cloud.database()
    const res = await db.collection('recipes').add({
      data: {
        _openid: openid,
        meals,
        status: 'pending',
        created_at: new Date(),
        created_at_str: new Date().toISOString().split('T')[0]
      }
    })

    return { success: true, id: res._id }
  } catch (err) {
    console.error('save-recipe error:', err)
    return { success: false, error: err.message || '保存失败' }
  }
}