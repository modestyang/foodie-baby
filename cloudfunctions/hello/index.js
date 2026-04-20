// 最简单的测试云函数
exports.main = async (event, context) => {
  return {
    success: true,
    message: 'Hello from cloud function!',
    timestamp: Date.now()
  }
}
