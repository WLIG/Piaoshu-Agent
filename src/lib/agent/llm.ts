// LLM客户端配置 - 支持OpenRouter
interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

interface Message {
  role: string;
  content: string;
}

// 获取LLM配置
function getLLMConfig(): LLMConfig {
  // 优先使用DeepSeek（高质量且成本效益好）
  if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'demo_key') {
    return {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      model: 'deepseek-chat' // DeepSeek的主要对话模型
    };
  }
  
  // 备用OpenRouter（免费模型）
  if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'demo_key') {
    return {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      model: 'meta-llama/llama-3.1-8b-instruct:free' // 使用免费模型
    };
  }
  
  // 备用Z.ai配置
  if (process.env.Z_AI_API_KEY && process.env.Z_AI_API_KEY !== 'demo_key') {
    return {
      apiKey: process.env.Z_AI_API_KEY,
      baseURL: process.env.Z_AI_BASE_URL || 'https://api.z.ai/v1',
      model: 'gpt-4'
    };
  }
  
  // 如果都没有配置，抛出错误
  throw new globalThis.Error('No valid LLM API key configured');
}

// 生成回答
export async function generateResponse(
  systemPrompt: string,
  userMessage: string,
  conversationHistory?: Message[]
): Promise<{ content: string; thinking: string }> {
  try {
    const config = getLLMConfig();

    // 构建消息历史
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
    ];

    // 添加历史对话（最近10轮）
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      messages.push(...recentHistory);
    }

    // 添加当前用户消息
    messages.push({ role: 'user', content: userMessage });

    // 调用OpenRouter API
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Piaoshu Agent'
      },
      body: globalThis.JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', response.status, errorText);
      throw new globalThis.Error(`LLM API Error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new globalThis.Error('Invalid response format from LLM API');
    }

    let content = data.choices[0].message.content || '抱歉，我无法回答这个问题。';
    let thinking = '';

    // 检查是否包含思考标记
    const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/i);
    if (thinkingMatch) {
      thinking = thinkingMatch[1].trim();
      content = content.replace(/<thinking>[\s\S]*?<\/thinking>/i, '').trim();
    }

    // 如果没有明确的思考过程，生成一个简单的
    if (!thinking) {
      const messagePreview = typeof userMessage === 'string' && userMessage.length > 50 
        ? userMessage.slice(0, 50) + '...' 
        : userMessage;
      thinking = `正在分析用户关于"${messagePreview}"的问题，并基于飘叔的专业知识提供回答。`;
    }

    return {
      content: content || '我正在思考如何最好地回答您的问题...',
      thinking: thinking,
    };
  } catch (error) {
    console.error('Error in generateResponse:', error);

    // 降级处理：返回简单回答
    return {
      content: '抱歉，我现在无法连接到AI服务。请稍后再试。',
      thinking: '服务暂时不可用，正在尝试重新连接...',
    };
  }
}
