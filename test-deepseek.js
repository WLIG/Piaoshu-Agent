// 测试DeepSeek API
async function testDeepSeek() {
  const apiKey = 'sk-85004076a7fb47dc99ead5543dd8bda2';
  const baseURL = 'https://api.deepseek.com/v1';
  
  console.log('🚀 开始测试DeepSeek API...\n');
  
  // 1. 测试API连接性
  console.log('1️⃣ 测试API连接性...');
  try {
    const modelsResponse = await fetch(`${baseURL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log('✅ API连接成功');
      console.log(`📋 可用模型数量: ${models.data?.length || 0}`);
      if (models.data && models.data.length > 0) {
        console.log('🎯 主要模型:', models.data.slice(0, 3).map(m => m.id).join(', '));
      }
    } else {
      console.log('❌ API连接失败:', modelsResponse.status);
      const errorText = await modelsResponse.text();
      console.log('错误详情:', errorText.substring(0, 200));
      return;
    }
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message);
    return;
  }
  
  // 2. 测试聊天完成功能
  console.log('\n2️⃣ 测试聊天完成功能...');
  
  const testCases = [
    {
      name: '基础对话测试',
      messages: [
        { role: 'system', content: '你是飘叔AI助手，一个智能的中文助手。' },
        { role: 'user', content: '你好，请简单介绍一下你自己' }
      ]
    },
    {
      name: '代码生成测试',
      messages: [
        { role: 'system', content: '你是一个专业的编程助手。' },
        { role: 'user', content: '请写一个JavaScript函数来计算斐波那契数列' }
      ]
    },
    {
      name: '中文理解测试',
      messages: [
        { role: 'system', content: '你是飘叔AI助手。' },
        { role: 'user', content: '请解释一下什么是人工智能，用通俗易懂的语言' }
      ]
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🧪 ${testCase.name}:`);
    
    try {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: testCase.messages,
          temperature: 0.7,
          max_tokens: 500,
          stream: false
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices[0].message.content;
        console.log('✅ 测试成功');
        console.log('📝 回复预览:', reply.substring(0, 100) + (reply.length > 100 ? '...' : ''));
        console.log('📊 使用tokens:', data.usage?.total_tokens || '未知');
      } else {
        console.log('❌ 测试失败:', response.status);
        const errorText = await response.text();
        console.log('错误详情:', errorText.substring(0, 200));
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
    
    // 添加延迟避免频率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. 测试流式响应
  console.log('\n3️⃣ 测试流式响应...');
  try {
    const streamResponse = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是飘叔AI助手。' },
          { role: 'user', content: '请数数从1到10' }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: true
      })
    });
    
    if (streamResponse.ok) {
      console.log('✅ 流式响应连接成功');
      console.log('📡 开始接收流式数据...');
      
      let streamContent = '';
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                streamContent += content;
                process.stdout.write(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      console.log('\n✅ 流式响应测试完成');
      console.log(`📝 总共接收字符数: ${streamContent.length}`);
    } else {
      console.log('❌ 流式响应测试失败:', streamResponse.status);
    }
  } catch (error) {
    console.log('❌ 流式响应测试失败:', error.message);
  }
  
  console.log('\n🎉 DeepSeek API测试完成！');
}

// 运行测试
testDeepSeek().catch(console.error);