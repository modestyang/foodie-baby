// 统一的微信云开发 AI 调用模块
const MODEL = 'qwen3.5-plus-2026-04-20'

type LogFunc = (msg: string) => void
type ThinkFunc = (content: string) => void

interface StreamResult {
  content: string
  thinking: string
}

// 调用微信云开发 AI 模型
export const callLLMAPI = async (
  prompt: string,
  log?: LogFunc
): Promise<string | null> => {
  log?.('调用微信云AI...')

  try {
    const ai = wx.cloud.extend.AI
    const model = ai.createModel("dashscope-custom")

    const res = await model.streamText({
      data: {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "你是一个专业的宝宝辅食营养师。你必须始终返回一个合法的JSON对象，不要返回任何JSON之外的文本，不要使用markdown格式，不要在JSON中添加注释。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        top_p: 0.7,
        max_tokens: 2048,
        enable_thinking: false
      }
    })

    log?.('streamText res: ' + JSON.stringify(res))
    log?.('res.textStream type: ' + typeof res.textStream + ', isPromise: ' + (res.textStream && typeof res.textStream.then === 'function'))
    log?.('res.eventStream type: ' + typeof res.eventStream + ', isPromise: ' + (res.eventStream && typeof res.eventStream.then === 'function'))

    // 使用 textStream 获取完整内容
    let content = ''
    if (res.textStream) {
      log?.('发现 textStream，开始读取内容...')
      try {
        const textStream = res.textStream
        let count = 0
        while (true) {
          const result = await textStream.next()
          log?.('textStream next result: ' + JSON.stringify(result))
          if (result.done) break
          if (result.value) {
            content += result.value
            count++
            if (count <= 3) log?.('textStream value: ' + result.value)
          }
        }
        log?.('textStream 共返回 ' + count + ' 段内容')
      } catch (e) {
        log?.('textStream 读取异常: ' + (e as Error).message)
      }
    }

    log?.('=== 云AI返回 ===\n' + content + '\n=== 返回结束 ===')
    if (!content) {
      log?.('AI返回内容为空')
    }
    return content
  } catch (err: any) {
    console.error('云AI请求失败:', err)
    log?.('云AI请求失败: ' + (err.message || err))
    return null
  }
}

// 解析返回的JSON
export const parseMealsFromResponse = (content: string | null, log?: LogFunc) => {
  if (!content) {
    log?.('解析失败: 内容为空')
    return null
  }
  try {
    let cleaned = content.trim()
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7)
    if (cleaned.startsWith('```')) cleaned = cleaned.substring(3)
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3)
    cleaned = cleaned.trim()

    const parsed = JSON.parse(cleaned)
    if (parsed.meals && Array.isArray(parsed.meals)) {
      log?.('解析成功: 找到 meals 数组, 长度=' + parsed.meals.length)
      return parsed.meals
    }
    if (Array.isArray(parsed)) {
      log?.('解析成功: 直接返回数组, 长度=' + parsed.length)
      return parsed
    }
    log?.('解析失败: 无meals字段')
  } catch (e) {
    console.error('解析失败:', e)
    log?.('解析失败: ' + (e as Error).message)
  }
  return null
}
