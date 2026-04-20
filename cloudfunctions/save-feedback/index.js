const wxcloud = require('wx-server-sdk')
wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  const { recipe_id, type, reason } = event

  if (!recipe_id) {
    return { success: false, error: '缺少食谱ID' }
  }

  const db = cloud.database()
  const res = await db.collection('feedback').add({
    data: {
      _openid: openid,
      recipe_id,
      type, // favorite / dislike
      reason: reason || '',
      created_at: db.serverDate()
    }
  })

  return { success: true, feedback_id: res._id }
}