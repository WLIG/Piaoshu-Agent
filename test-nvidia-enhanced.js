// NVIDIA Build API 增强测试脚本
// 测试GLM4.7和Kimi2.5模型

const API_KEY = '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';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

// 测试GLM4.7模型
async function testGLM47() {
  console.log('\n🧠 测试 GLM4.7 模型...');
  
  const payload = {
    model: 'z-ai/glm4.7',
    messages: [
      {
        role: 'user',
        content: '请用中文简单介绍一下人工智能的发展历程，并分析未来趋势。'
      }
    ],
    temperature: 1,
    top_p: 1,
    max_tokens: 2048,
    stream: false,
    extra_body: {
      chat_template_kwargs: {
        enable_thinking: true,
        clear_thinking: false
      }
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GLM4.7 API错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ GLM4.7 响应成功:');
    console.log('模型:', result.model);
    console.log('内容:', result.choices[0].message.content.substring(0, 200) + '...');
    console.log('Token使用:', result.usage);
    
    return true;
  } catch (error) {
    console.error('❌ GLM4.7 测试失败:', error.message);
    return false;
  }
}

// 测试Kimi2.5模型
async function testKimi25() {
  console.log('\n🎨 测试 Kimi2.5 模型...');
  
  const payload = {
    model: 'moonshotai/kimi-k2.5',
    messages: [
      {
        role: 'user',
        content: '请创作一首关于春天的现代诗，要求有创意和想象力。'
      }
    ],
    temperature: 1.00,
    top_p: 1.00,
    max_tokens: 1024,
    stream: false,
    chat_template_kwargs: {
      thinking: true
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kimi2.5 API错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Kimi2.5 响应成功:');
    console.log('模型:', result.model);
    console.log('内容:', result.choices[0].message.content);
    console.log('Token使用:', result.usage);
    
    return true;
  } catch (error) {
    console.error('❌ Kimi2.5 测试失败:', error.message);
    return false;
  }
}

// 测试流式响应
async function testStreamResponse() {
  console.log('\n🌊 测试流式响应...');
  
  const payload = {
    model: 'z-ai/glm4.7',
    messages: [
      {
        role: 'user',
        content: '请简单介绍一下Next.js框架的特点。'
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
    stream: true,
    extra_body: {
      chat_template_kwargs: {
        enable_thinking: false,
        clear_thinking: false
      }
    }
  };

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`流式API错误: ${response.status} - ${errorText}`);
    }

    console.log('✅ 流式响应开始:');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.content) {
              content += delta.content;
              process.stdout.write(delta.content);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    console.log('\n✅ 流式响应完成');
    return true;
  } catch (error) {
    console.error('❌ 流式响应测试失败:', error.message);
    return false;
  }
}

// 测试API连接
async function testConnection() {
  console.log('🔗 测试NVIDIA API连接...');
  
  try {
    const response = await fetch(`${BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    if (response.ok) {
      const models = await response.json();
      console.log('✅ API连接成功');
      console.log('可用模型数量:', models.data?.length || 0);
      return true;
    } else {
      console.log('❌ API连接失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始NVIDIA Build API增强测试');
  console.log('API Key:', API_KEY.substring(0, 20) + '...');
  console.log('Base URL:', BASE_URL);
  
  const results = {
    connection: await testConnection(),
    glm47: await testGLM47(),
    kimi25: await testKimi25(),
    stream: await testStreamResponse()
  };

  console.log('\n📊 测试结果汇总:');
  console.log('API连接:', results.connection ? '✅ 成功' : '❌ 失败');
  console.log('GLM4.7模型:', results.glm47 ? '✅ 成功' : '❌ 失败');
  console.log('Kimi2.5模型:', results.kimi25 ? '✅ 成功' : '❌ 失败');
  console.log('流式响应:', results.stream ? '✅ 成功' : '❌ 失败');

  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 总体成功率: ${successCount}/4 (${(successCount/4*100).toFixed(1)}%)`);

  if (successCount === 4) {
    console.log('🎉 所有测试通过！NVIDIA API集成完美运行！');
  } else {
    console.log('⚠️  部分测试失败，请检查配置和网络连接。');
  }
}

// 运行测试
runTests().catch(console.error);