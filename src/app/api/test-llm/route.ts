import { NextRequest, NextResponse } from 'next/server';

// API配置
const APIs = {
  deepseek: {
    name: 'DeepSeek',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },
  openrouter: {
    name: 'OpenRouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3.1-8b-instruct:free'
  }
};

// 测试单个API
async function testAPI(apiName: string, config: any) {
  const result = {
    name: config.name,
    status: 'unknown' as 'success' | 'error' | 'unknown',
    message: '',
    responseTime: 0,
    details: {} as any
  };

  if (!config.apiKey) {
    result.status = 'error';
    result.message = 'API密钥未配置';
    return result;
  }

  const startTime = Date.now();

  try {
    // 1. 测试连接
    const modelsResponse = await fetch(`${config.baseURL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(apiName === 'openrouter' ? {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Piaoshu Agent'
        } : {})
      }
    });

    if (!modelsResponse.ok) {
      result.status = 'error';
      result.message = `连接失败: HTTP ${modelsResponse.status}`;
      result.responseTime = Date.now() - startTime;
      return result;
    }

    // 2. 测试聊天功能
    const chatResponse = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(apiName === 'openrouter' ? {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Piaoshu Agent'
        } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是飘叔AI助手，请用中文简短回答。' },
          { role: 'user', content: '你好，请说"测试成功"' }
        ],
        temperature: 0.1,
        max_tokens: 50,
        stream: false
      })
    });

    result.responseTime = Date.now() - startTime;

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      const content = data.choices[0].message.content;
      
      result.status = 'success';
      result.message = '测试成功';
      result.details = {
        response: content,
        usage: data.usage,
        model: config.model
      };
    } else {
      const errorText = await chatResponse.text();
      result.status = 'error';
      result.message = `聊天测试失败: HTTP ${chatResponse.status}`;
      result.details = { error: errorText.substring(0, 200) };
    }

  } catch (error: any) {
    result.status = 'error';
    result.message = `请求失败: ${error.message}`;
    result.responseTime = Date.now() - startTime;
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiName = searchParams.get('api');

    // 如果指定了特定API，只测试该API
    if (apiName && APIs[apiName as keyof typeof APIs]) {
      const config = APIs[apiName as keyof typeof APIs];
      const result = await testAPI(apiName, config);
      return NextResponse.json({ [apiName]: result });
    }

    // 测试所有API
    const results: any = {};
    
    for (const [name, config] of Object.entries(APIs)) {
      results[name] = await testAPI(name, config);
      
      // 添加延迟避免频率限制
      if (Object.keys(results).length < Object.keys(APIs).length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 生成总结
    const summary = {
      total: Object.keys(APIs).length,
      working: Object.values(results).filter((r: any) => r.status === 'success').length,
      failed: Object.values(results).filter((r: any) => r.status === 'error').length,
      recommended: null as string | null
    };

    // 推荐最佳API
    const workingAPIs = Object.entries(results).filter(([_, r]: [string, any]) => r.status === 'success');
    if (workingAPIs.length > 0) {
      // 优先推荐DeepSeek，其次是响应时间最快的
      const deepseekWorking = workingAPIs.find(([name]) => name === 'deepseek');
      if (deepseekWorking) {
        summary.recommended = 'deepseek';
      } else {
        const fastest = workingAPIs.reduce((best, current) => 
          current[1].responseTime < best[1].responseTime ? current : best
        );
        summary.recommended = fastest[0];
      }
    }

    return NextResponse.json({
      summary,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: '测试过程中发生错误', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { api, message } = await request.json();
    
    if (!api || !APIs[api as keyof typeof APIs]) {
      return NextResponse.json(
        { error: '无效的API名称' },
        { status: 400 }
      );
    }

    const config = APIs[api as keyof typeof APIs];
    
    if (!config.apiKey) {
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(api === 'openrouter' ? {
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Piaoshu Agent'
        } : {})
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: '你是飘叔AI助手，请用中文回答。' },
          { role: 'user', content: message || '你好，请简单介绍一下你自己' }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        response: data.choices[0].message.content,
        responseTime,
        usage: data.usage,
        api: config.name,
        model: config.model
      });
    } else {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          error: `HTTP ${response.status}`, 
          details: errorText.substring(0, 200),
          responseTime 
        },
        { status: response.status }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '请求失败', details: error.message },
      { status: 500 }
    );
  }
}