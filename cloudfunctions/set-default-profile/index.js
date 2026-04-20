const wxcloud = require("wx-server-sdk")
wxcloud.init({ env: "cloud1-4ggckbdj5e78888c" })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { profileId } = event
  if (!profileId) return { success: false, error: "缺少档案ID" }
  if (!openid) return { success: false, error: "无法获取用户身份" }
  try {
    const db = cloud.database()
    await db.collection("profiles").where({ _openid: openid, isDefault: true }).update({ data: { isDefault: false } })
    await db.collection("profiles").doc(profileId).update({ data: { isDefault: true } })
    return { success: true }
  } catch (err) {
    return { success: false, error: err.message || "设置失败" }
  }
}
