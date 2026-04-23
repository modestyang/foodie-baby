const wxcloud = require('wx-server-sdk')
wxcloud.init({ env: 'cloud1-4ggckbdj5e78888c' })
const cloud = wxcloud

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, error: '无法获取用户身份' }
  }

  const { nickname, birthday, gender, city, allergies, taste_like, taste_dislike, diversity_prefer, _id } = event

  if (!nickname || !birthday || !gender || !city) {
    return { success: false, error: '缺少必填字段' }
  }

  try {
    const db = cloud.database()

    // 如果有 _id，更新现有档案
    if (_id) {
      await db.collection('profiles').doc(_id).update({
        data: {
          nickname,
          birthday,
          gender: gender === '男' ? 'male' : 'female',
          city,
          allergies: allergies || [],
          taste_like: taste_like || [],
          taste_dislike: taste_dislike || [],
          diversity_prefer: diversity_prefer || 'diverse',
          updated_at: new Date()
        }
      })
      return { success: true, id: _id }
    }

    // 取消其他默认档案
    await db.collection('profiles').where({
      _openid: openid,
      isDefault: true
    }).update({
      data: { isDefault: false }
    })

    // 添加新档案
    const res = await db.collection('profiles').add({
      data: {
        _openid: openid,
        nickname,
        birthday,
        gender: gender === '男' ? 'male' : 'female',
        city,
        allergies: allergies || [],
        taste_like: taste_like || [],
        taste_dislike: taste_dislike || [],
        diversity_prefer: diversity_prefer || 'diverse',
        isDefault: true,
        created_at: new Date()
      }
    })

    return { success: true, id: res._id }
  } catch (err) {
    console.error('save-profile error:', err)
    return { success: false, error: err.message || '保存失败' }
  }
}