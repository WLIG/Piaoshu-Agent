// 完整的API测试脚本 - 测试所有配置的LLM服务
// 使用Node.js内置的fetch (Node 18+)

// API配置
const APIs = {
  deepseek: {
    name: 'DeepSeek',
    apiKey: 'sk-85004076a7fb47dc99ead5543dd8bda2',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    icon: '🧠'
  },
  openrouter: {
    name: 'OpenRouter',
    apiKey: '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',
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'meta-llama/llama-3.2-3b-instruct:free',
    icon: '🌐'
  }
};

// 测试用例
const testCases = [
  {
    name: '基础对话',
    messages: [
      { role: 'system', content: '你是飘叔AI助手，请用中文回答。' },
      { role: 'user', content: '你好，请简单介绍一下你自己' }
    ],
    expectedKeywords: ['助手', '帮助', 'AI']
  },
  {
    name: '数学计算',
    messages: [
      { role: 'system', content: '你是一个数学助手。' },
      { role: 'user', content: '请计算 15 * 23 + 47 = ?' }
    ],
    expectedKeywords: ['392']
  },
  {
    name: '代码生成',
    messages: [
      { role: 'system', content: '你是编程助手。' },
      { role: 'user', content: '写一个Python函数来判断一个数是否为质数' }
    ],
    expectedKeywords: ['def', 'return', 'prime']
  }
];

// 测试单个API
async function testAPI(apiName, config) {
  console.log(`\n${config.icon} ===== 测试 ${config.name} API =====`);
  
  const results = {
    name: config.name,
    connection: false,
    tests: [],
    totalTime: 0,
    errors: []
  };
  
  const startTime = Date.now();
  
  // 1. 测试连接
  console.log('🔗 测试API连接...');
  try {
    const response = await fetch(`${config.baseURL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(apiName === 'openrouter' ? {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Piaoshu Agent Test'
        } : {})
      },
      timeout: 10000
    });
    
    if (response.ok) {
      results.connection = true;
      console.log('✅ 连接成功');
    } else {
      console.log(`❌ 连接失败: ${response.status}`);
      results.errors.push(`连接失败: ${response.status}`);
      return results;
    }
  } catch (error) {
    console.log(`❌ 连接错误: ${error.message}`);
    results.errors.push(`连接错误: ${error.message}`);
    return results;
  }
  
  // 2. 运行测试用例
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🧪 测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
    
    const testResult = {
      name: testCase.name,
      success: false,
      responseTime: 0,
      responseLength: 0,
      keywordsFound: [],
      error: null
    };
    
    const testStartTime = Date.now();
    
    try {
      const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          ...(apiName === 'openrouter' ? {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Piaoshu Agent Test'
          } : {})
        },
        body: JSON.stringify({
          model: config.model,
          messages: testCase.messages,
          temperature: 0.7,
          max_tokens: 300,
          stream: false
        }),
        timeout: 30000
      });
      
      testResult.responseTime = Date.now() - testStartTime;
      
      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        testResult.responseLength = content.length;
        testResult.success = true;
        
        // 检查关键词
        testCase.expectedKeywords.forEach(keyword => {
          if (content.toLowerCase().includes(keyword.toLowerCase())) {
            testResult.keywordsFound.push(keyword);
          }
        });
        
        console.log(`✅ 成功 (${testResult.responseTime}ms)`);
        console.log(`📝 回复长度: ${testResult.responseLength} 字符`);
        console.log(`🔍 找到关键词: ${testResult.keywordsFound.join(', ') || '无'}`);
        console.log(`💬 回复预览: ${content.substring(0, 80)}...`);
        
      } else {
        const errorText = await response.text();
        testResult.error = `HTTP ${response.status}: ${errorText.substring(0, 100)}`;
        console.log(`❌ 失败: ${testResult.error}`);
      }
      
    } catch (error) {
      testResult.error = error.message;
      testResult.responseTime = Date.now() - testStartTime;
      console.log(`❌ 错误: ${error.message}`);
    }
    
    results.tests.push(testResult);
    
    // 添加延迟避免频率限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  results.totalTime = Date.now() - startTime;
  return results;
}

// 生成测试报告
function generateReport(results) {
  console.log('\n📊 ===== 测试报告 =====');
  
  results.forEach(result => {
    console.log(`\n${result.name === 'DeepSeek' ? '🧠' : '🌐'} ${result.name}:`);
    console.log(`  连接状态: ${result.connection ? '✅ 正常' : '❌ 失败'}`);
    console.log(`  总耗时: ${result.totalTime}ms`);
    
    if (result.tests.length > 0) {
      const successCount = result.tests.filter(t => t.success).length;
      console.log(`  测试通过: ${successCount}/${result.tests.length}`);
      
      const avgResponseTime = result.tests
        .filter(t => t.success)
        .reduce((sum, t) => sum + t.responseTime, 0) / successCount || 0;
      console.log(`  平均响应时间: ${Math.round(avgResponseTime)}ms`);
      
      const totalKeywords = result.tests.reduce((sum, t) => sum + t.keywordsFound.length, 0);
      console.log(`  关键词匹配: ${totalKeywords} 个`);
    }
    
    if (result.errors.length > 0) {
      console.log(`  错误: ${result.errors.join(', ')}`);
    }
  });
  
  // 推荐最佳API
  const workingAPIs = results.filter(r => r.connection && r.tests.some(t => t.success));
  if (workingAPIs.length > 0) {
    const best = workingAPIs.reduce((best, current) => {
      const bestScore = best.tests.filter(t => t.success).length;
      const currentScore = current.tests.filter(t => t.success).length;
      return currentScore > bestScore ? current : best;
    });
    
    console.log(`\n🏆 推荐使用: ${best.name}`);
  } else {
    console.log('\n⚠️  所有API都无法正常工作，请检查配置');
  }
}

// 主函数
async function runAllTests() {
  console.log('🚀 开始全面API测试...');
  console.log(`📋 将测试 ${Object.keys(APIs).length} 个API服务`);
  console.log(`🧪 每个服务将运行 ${testCases.length} 个测试用例\n`);
  
  const results = [];
  
  for (const [apiName, config] of Object.entries(APIs)) {
    const result = await testAPI(apiName, config);
    results.push(result);
    
    // API之间添加延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  generateReport(results);
  console.log('\n🎉 所有测试完成！');
}

// 运行测试
runAllTests().catch(console.error);