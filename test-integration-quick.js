// 快速集成测试 - 验证核心功能

const BASE_URL = 'http://localhost:3000';

// 测试基础API连通性
async function testBasicConnectivity() {
  console.log('🔗 测试基础连通性...');
  
  try {
    const response = await fetch(`${BASE_URL}`);
    if (response.ok) {
      console.log('✅ 主页访问正常');
      return true;
    } else {
      console.log(`❌ 主页访问失败: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 连接失败: ${error.message}`);
    return false;
  }
}

// 测试原始聊天API
async function testOriginalChatAPI() {
  console.log('\n💬 测试原始聊天API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '你好，测试原始API',
        userId: 'test-original-' + Date.now()
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 原始聊天API正常');
      console.log(`模型: ${result.data.model}`);
      console.log(`响应: ${result.data.message.content.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`❌ 原始聊天API失败: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 原始聊天API错误: ${error.message}`);
    return false;
  }
}

// 测试增强聊天API
async function testEnhancedChatAPI() {
  console.log('\n🚀 测试增强聊天API...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat-enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '你好，测试增强API功能',
        userId: 'test-enhanced-' + Date.now(),
        useNvidia: true,
        model: 'auto'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ 增强聊天API正常');
      console.log(`模型: ${result.data.model}`);
      console.log(`个性化程度: ${result.data.personalization?.adaptationLevel || 0}%`);
      console.log(`响应: ${result.data.message.content.substring(0, 100)}...`);
      return true;
    } else {
      const errorText = await response.text();
      console.log(`❌ 增强聊天API失败: ${response.status}`);
      console.log(`错误详情: ${errorText.substring(0, 200)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 增强聊天API错误: ${error.message}`);
    return false;
  }
}

// 测试NVIDIA模型直接调用
async function testNvidiaModels() {
  console.log('\n🤖 测试NVIDIA模型直接调用...');
  
  const testModels = ['glm4.7', 'nemotron', 'kimi2.5'];
  const results = {};
  
  for (const model of testModels) {
    try {
      console.log(`测试模型: ${model}`);
      
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `测试${model}模型响应`,
          userId: `test-${model}-${Date.now()}`,
          useNvidia: true,
          model: model
        })
      });

      if (response.ok) {
        const result = await response.json();
        results[model] = {
          success: true,
          model: result.data.model,
          contentLength: result.data.message.content.length
        };
        console.log(`  ✅ ${model}: ${result.data.model} (${result.data.message.content.length}字符)`);
      } else {
        results[model] = { success: false, status: response.status };
        console.log(`  ❌ ${model}: 失败 (${response.status})`);
      }
      
      // 等待避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results[model] = { success: false, error: error.message };
      console.log(`  ❌ ${model}: 错误 (${error.message})`);
    }
  }
  
  return results;
}

// 测试系统健康状态
async function testSystemHealth() {
  console.log('\n🏥 测试系统健康状态...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/system`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 系统健康检查正常');
      console.log(`数据库: ${result.database ? '正常' : '异常'}`);
      return true;
    } else {
      console.log(`❌ 系统健康检查失败: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 系统健康检查错误: ${error.message}`);
    return false;
  }
}

// 生成集成测试报告
function generateIntegrationReport(results) {
  console.log('\n📊 集成测试报告');
  console.log('='.repeat(50));
  
  const {
    connectivity,
    originalChat,
    enhancedChat,
    nvidiaModels,
    systemHealth
  } = results;
  
  console.log(`基础连通性: ${connectivity ? '✅ 正常' : '❌ 异常'}`);
  console.log(`原始聊天API: ${originalChat ? '✅ 正常' : '❌ 异常'}`);
  console.log(`增强聊天API: ${enhancedChat ? '✅ 正常' : '❌ 异常'}`);
  console.log(`系统健康状态: ${systemHealth ? '✅ 正常' : '❌ 异常'}`);
  
  console.log('\nNVIDIA模型测试:');
  Object.entries(nvidiaModels).forEach(([model, result]) => {
    if (result.success) {
      console.log(`  ${model}: ✅ 正常 (${result.contentLength}字符)`);
    } else {
      console.log(`  ${model}: ❌ 异常`);
    }
  });
  
  // 计算总体健康度
  const basicTests = [connectivity, originalChat, enhancedChat, systemHealth];
  const basicScore = basicTests.filter(Boolean).length / basicTests.length;
  
  const modelTests = Object.values(nvidiaModels);
  const modelScore = modelTests.filter(r => r.success).length / modelTests.length;
  
  const overallScore = (basicScore * 0.6 + modelScore * 0.4) * 100;
  
  console.log(`\n🎯 系统健康度: ${Math.round(overallScore)}%`);
  
  if (overallScore > 80) {
    console.log('🎉 系统运行状态优秀！可以正常启动服务');
    return 'excellent';
  } else if (overallScore > 60) {
    console.log('✅ 系统运行状态良好，建议启动服务');
    return 'good';
  } else {
    console.log('⚠️ 系统存在问题，建议修复后再启动');
    return 'needs_fix';
  }
}

// 主测试函数
async function runIntegrationTest() {
  console.log('🚀 开始快速集成测试');
  console.log('目标: 验证所有核心功能正常运行');
  
  const results = {
    connectivity: await testBasicConnectivity(),
    originalChat: await testOriginalChatAPI(),
    enhancedChat: await testEnhancedChatAPI(),
    nvidiaModels: await testNvidiaModels(),
    systemHealth: await testSystemHealth()
  };
  
  const status = generateIntegrationReport(results);
  
  console.log(`\n📝 测试完成时间: ${new Date().toLocaleString()}`);
  
  return { results, status };
}

// 运行测试
runIntegrationTest().catch(console.error);