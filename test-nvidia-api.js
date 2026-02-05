// 测试NVIDIA多模型API
const testNvidiaAPI = async () => {
  console.log('🚀 开始测试NVIDIA多模型API...\n');

  // 测试1: 获取模型信息
  console.log('📋 测试1: 获取可用模型信息');
  try {
    const response = await fetch('http://localhost:3000/api/nvidia/chat', {
      method: 'GET'
    });
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 模型信息获取成功:');
      console.log(`- API Key: ${result.data.apiKey}`);
      console.log(`- 用户名: ${result.data.username}`);
      console.log(`- 连接状态: ${result.data.connected ? '已连接' : '未连接'}`);
      console.log(`- 可用模型: ${result.data.models.length}个`);
      result.data.models.forEach(model => {
        console.log(`  * ${model.name}: ${model.description}`);
      });
    } else {
      console.log('❌ 模型信息获取失败:', result.error);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: GLM4.7推理测试
  console.log('🧠 测试2: GLM4.7推理能力测试');
  try {
    const response = await fetch('http://localhost:3000/api/nvidia/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '请分析一下人工智能在商业领域的应用前景，从技术、市场、投资三个角度进行深度分析。'
          }
        ],
        model: 'glm4.7',
        taskType: 'reasoning',
        enableThinking: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ GLM4.7推理测试成功:');
      console.log(`- 模型: ${result.data.model}`);
      console.log(`- 回复长度: ${result.data.message.length}字符`);
      if (result.data.reasoning) {
        console.log(`- 推理过程: ${result.data.reasoning.substring(0, 100)}...`);
      }
      console.log(`- 回复预览: ${result.data.message.substring(0, 200)}...`);
    } else {
      console.log('❌ GLM4.7测试失败:', result.error);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: Kimi2.5创意测试
  console.log('🎨 测试3: Kimi2.5创意能力测试');
  try {
    const response = await fetch('http://localhost:3000/api/nvidia/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '请为一个AI驱动的智能办公助手产品设计一个创新的商业模式，包括盈利模式、目标用户、核心功能等。'
          }
        ],
        model: 'kimi2.5',
        taskType: 'creative',
        thinking: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Kimi2.5创意测试成功:');
      console.log(`- 模型: ${result.data.model}`);
      console.log(`- 回复长度: ${result.data.message.length}字符`);
      if (result.data.reasoning) {
        console.log(`- 思维过程: ${result.data.reasoning.substring(0, 100)}...`);
      }
      console.log(`- 回复预览: ${result.data.message.substring(0, 200)}...`);
    } else {
      console.log('❌ Kimi2.5测试失败:', result.error);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试4: 智能模型选择测试
  console.log('🤖 测试4: 智能模型选择测试');
  try {
    const response = await fetch('http://localhost:3000/api/nvidia/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: '你好，我想了解一下当前科技行业的发展趋势，特别是AI和区块链技术的结合应用。'
          }
        ],
        model: 'auto',
        taskType: 'analysis'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 智能模型选择测试成功:');
      console.log(`- 自动选择模型: ${result.data.model}`);
      console.log(`- 回复长度: ${result.data.message.length}字符`);
      console.log(`- 回复预览: ${result.data.message.substring(0, 200)}...`);
    } else {
      console.log('❌ 智能选择测试失败:', result.error);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试5: 飘叔Agent集成测试
  console.log('👨‍💼 测试5: 飘叔Agent集成测试');
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '飘叔，请从商业角度分析一下web4.0时代的机遇和挑战，以及我们应该如何应对？',
        userId: 'test-user',
        useNvidia: true,
        model: 'auto'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 飘叔Agent集成测试成功:');
      console.log(`- 使用模型: ${result.data.model}`);
      console.log(`- 对话ID: ${result.data.conversationId}`);
      if (result.data.reasoning) {
        console.log(`- 推理过程: 已包含`);
      }
      console.log(`- 飘叔回复: ${result.data.message.content.substring(0, 300)}...`);
    } else {
      console.log('❌ 飘叔Agent测试失败:', result.error);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
  }

  console.log('\n🎉 NVIDIA多模型API测试完成！');
};

// 运行测试
testNvidiaAPI().catch(console.error);