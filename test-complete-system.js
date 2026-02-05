// 飘叔Agent完整系统测试脚本
// 测试所有API端点和功能

const BASE_URL = 'http://localhost:3000';

// 测试聊天API（NVIDIA模型）
async function testChatAPI() {
  console.log('\n💬 测试聊天API（NVIDIA模型）...');
  
  const testMessages = [
    {
      message: '你好，我是新用户',
      useNvidia: true,
      model: 'auto'
    },
    {
      message: '请分析一下人工智能在商业中的应用前景',
      useNvidia: true,
      model: 'glm4.7'
    },
    {
      message: '帮我设计一个创新的产品营销策略',
      useNvidia: true,
      model: 'kimi2.5'
    }
  ];

  let conversationId = null;
  let successCount = 0;

  for (let i = 0; i < testMessages.length; i++) {
    const testData = testMessages[i];
    
    try {
      console.log(`\n📝 测试消息 ${i + 1}: ${testData.message.substring(0, 30)}...`);
      
      const payload = {
        ...testData,
        userId: 'test-user-' + Date.now(),
        conversationId: conversationId
      };

      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ 消息 ${i + 1} 成功`);
        console.log(`模型: ${result.data.model}`);
        console.log(`回复: ${result.data.message.content.substring(0, 100)}...`);
        
        if (!conversationId) {
          conversationId = result.data.conversationId;
          console.log(`📝 对话ID: ${conversationId}`);
        }
        
        successCount++;
      } else {
        console.log(`❌ 消息 ${i + 1} 失败: ${result.error}`);
      }
      
      // 等待1秒避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ 消息 ${i + 1} 错误:`, error.message);
    }
  }

  console.log(`\n📊 聊天API测试结果: ${successCount}/${testMessages.length} 成功`);
  return successCount === testMessages.length;
}

// 测试图片分析API
async function testImageAnalysis() {
  console.log('\n🖼️ 测试图片分析API...');
  
  try {
    const testData = {
      imageUrl: 'https://example.com/test-image.jpg',
      prompt: '请分析这张图片的商业价值'
    };

    const response = await fetch(`${BASE_URL}/api/analyze/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 图片分析API响应成功');
      console.log('分析结果:', result.analysis?.substring(0, 100) + '...');
      return true;
    } else {
      console.log('❌ 图片分析API失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 图片分析API错误:', error.message);
    return false;
  }
}

// 测试文档上传API
async function testDocumentUpload() {
  console.log('\n📄 测试文档上传API...');
  
  try {
    // 创建测试文本内容
    const testContent = '这是一个测试文档，包含商业分析内容。人工智能正在改变商业模式。';
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', blob, 'test-document.txt');
    formData.append('type', 'document');

    const response = await fetch(`${BASE_URL}/api/upload/media`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 文档上传API响应成功');
      console.log('上传结果:', result.message);
      return true;
    } else {
      console.log('❌ 文档上传API失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 文档上传API错误:', error.message);
    return false;
  }
}

// 测试知识库搜索API
async function testKnowledgeSearch() {
  console.log('\n🔍 测试知识库搜索API...');
  
  try {
    const testQuery = {
      query: '人工智能商业应用',
      limit: 5
    };

    const response = await fetch(`${BASE_URL}/api/memory/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testQuery)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 知识库搜索API响应成功');
      console.log('搜索结果数量:', result.results?.length || 0);
      return true;
    } else {
      console.log('❌ 知识库搜索API失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 知识库搜索API错误:', error.message);
    return false;
  }
}

// 测试统计API
async function testStatsAPI() {
  console.log('\n📊 测试统计API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/stats/overview`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 统计API响应成功');
      console.log('统计数据:', {
        totalUsers: result.totalUsers,
        totalConversations: result.totalConversations,
        totalMessages: result.totalMessages
      });
      return true;
    } else {
      console.log('❌ 统计API失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 统计API错误:', error.message);
    return false;
  }
}

// 测试服务器健康状态
async function testServerHealth() {
  console.log('\n🏥 测试服务器健康状态...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/system`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 服务器健康检查成功');
      console.log('系统状态:', result.status);
      console.log('数据库连接:', result.database ? '正常' : '异常');
      return true;
    } else {
      console.log('❌ 服务器健康检查失败:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 服务器健康检查错误:', error.message);
    return false;
  }
}

// 测试前端页面访问
async function testFrontendPages() {
  console.log('\n🌐 测试前端页面访问...');
  
  const pages = [
    '/',
    '/chat-test',
    '/upload',
    '/admin'
  ];

  let successCount = 0;

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page}`);
      
      if (response.ok) {
        console.log(`✅ 页面 ${page} 访问成功`);
        successCount++;
      } else {
        console.log(`❌ 页面 ${page} 访问失败: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ 页面 ${page} 访问错误:`, error.message);
    }
  }

  console.log(`📊 前端页面测试结果: ${successCount}/${pages.length} 成功`);
  return successCount === pages.length;
}

// 主测试函数
async function runCompleteSystemTest() {
  console.log('🚀 开始飘叔Agent完整系统测试');
  console.log('测试服务器:', BASE_URL);
  console.log('测试时间:', new Date().toLocaleString());
  
  const testResults = {
    serverHealth: await testServerHealth(),
    frontendPages: await testFrontendPages(),
    chatAPI: await testChatAPI(),
    imageAnalysis: await testImageAnalysis(),
    documentUpload: await testDocumentUpload(),
    knowledgeSearch: await testKnowledgeSearch(),
    statsAPI: await testStatsAPI()
  };

  console.log('\n🎯 完整系统测试结果汇总:');
  console.log('='.repeat(50));
  
  Object.entries(testResults).forEach(([test, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败';
    const testName = {
      serverHealth: '服务器健康检查',
      frontendPages: '前端页面访问',
      chatAPI: '聊天API（NVIDIA）',
      imageAnalysis: '图片分析API',
      documentUpload: '文档上传API',
      knowledgeSearch: '知识库搜索API',
      statsAPI: '统计API'
    }[test] || test;
    
    console.log(`${testName}: ${status}`);
  });

  const successCount = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  const successRate = (successCount / totalTests * 100).toFixed(1);

  console.log('='.repeat(50));
  console.log(`📈 总体成功率: ${successCount}/${totalTests} (${successRate}%)`);

  if (successCount === totalTests) {
    console.log('🎉 恭喜！所有测试通过！飘叔Agent系统运行完美！');
    console.log('🚀 系统已准备好投入使用！');
  } else if (successCount >= totalTests * 0.8) {
    console.log('✨ 系统基本功能正常，部分高级功能需要检查。');
    console.log('💡 建议检查失败的功能并进行修复。');
  } else {
    console.log('⚠️ 系统存在较多问题，需要进一步调试。');
    console.log('🔧 请检查服务器配置和依赖项。');
  }

  console.log('\n📝 测试完成时间:', new Date().toLocaleString());
  return testResults;
}

// 运行测试
runCompleteSystemTest().catch(console.error);