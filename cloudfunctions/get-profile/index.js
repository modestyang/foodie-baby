const wxcloud = require('wx-server-sdk')

wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const db = cloud.database()
    const res = await db.collection('profiles').where({
      _openid: openid
    }).get()

    return { success: true, data: res.data }
  } catch (err) {
    console.error('查询失败:', err)
    return { success: false, error: err.message || '查询失败' }
  }
}
