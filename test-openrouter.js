// 测试OpenRouter API
const fetch = require('node-fetch');

async function testOpenRouter() {
  const apiKey = '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';
  const baseURL = 'https://openrouter.ai/api/v1';
  
  // 测试免费模型
  const models = [
    'meta-llama/llama-3.1-8b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'google/gemma-2-9b-it:free',
    'qwen/qwen-2-7b-instruct:free'
  ];
  
  for (const model of models) {
    console.log(`\n测试模型: ${model}`);
    
    try {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Piaoshu Agent Test'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: '你是飘叔AI助手，请用中文回答。' },
            { role: 'user', content: '你好，请简单介绍一下你自己' }
          ],
          temperature: 0.7,
          max_tokens: 500,
          stream: false
        })
      });
      
      console.log(`状态码: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('成功！回复:', data.choices[0].message.content.substring(0, 100) + '...');
        break; // 找到可用模型就停止
      } else {
        const errorText = await response.text();
        console.log('错误:', errorText.substring(0, 200));
      }
    } catch (error) {
      console.log('请求失败:', error.message);
    }
  }
}

testOpenRouter();