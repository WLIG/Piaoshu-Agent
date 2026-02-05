// 测试Nemotron模型集成到飘叔Agent系统

const BASE_URL = 'http://localhost:3000';

// 测试不同模型的聊天API
async function testNemotronIntegration() {
  console.log('🚀 测试Nemotron模型集成到飘叔Agent');
  
  const testCases = [
    {
      name: 'GLM4.7 对话测试',
      message: '你好，请简单介绍一下自己',
      model: 'glm4.7',
      expectedFeatures: ['快速响应', '基础对话']
    },
    {
      name: 'Kimi2.5 创意测试',
      message: '请为一个AI产品写一个创意广告文案',
      model: 'kimi2.5',
      expectedFeatures: ['创意内容', '营销文案']
    },
    {
      name: 'Nemotron 推理测试',
      message: '请深度分析电商平台的盈利模式，包括成本结构和收入来源',
      model: 'nemotron',
      expectedFeatures: ['深度分析', '结构化思维', '商业洞察']
    },
    {
      name: '商业分析专用模式',
      message: '分析共享经济模式的核心竞争力和风险点',
      model: 'business',
      expectedFeatures: ['专业分析', '风险评估', '竞争分析']
    },
    {
      name: '智能自动选择',
      message: '请从技术和商业两个角度分析人工智能的发展趋势',
      model: 'auto',
      expectedFeatures: ['智能选择', '多角度分析']
    }
  ];

  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 ${i + 1}. ${testCase.name}`);
    console.log(`   消息: ${testCase.message.substring(0, 50)}...`);
    console.log(`   模型: ${testCase.model}`);

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: testCase.message,
          useNvidia: true,
          model: testCase.model,
          userId: `test-user-${Date.now()}`
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const content = result.data.message.content;
        const thinking = result.data.message.thinking;
        const modelUsed = result.data.model;

        console.log(`   ✅ 成功 (${responseTime}ms)`);
        console.log(`   模型: ${modelUsed}`);
        console.log(`   内容长度: ${content.length} 字符`);
        console.log(`   思维过程: ${thinking ? '有' : '无'}`);
        console.log(`   预览: ${content.substring(0, 100)}...`);

        // 分析响应特征
        const features = analyzeResponseFeatures(content, thinking);
        console.log(`   特征: ${features.join(', ')}`);

        results.push({
          name: testCase.name,
          model: testCase.model,
          modelUsed,
          success: true,
          responseTime,
          contentLength: content.length,
          hasThinking: !!thinking,
          features,
          expectedFeatures: testCase.expectedFeatures,
          matchesExpectation: checkExpectation(features, testCase.expectedFeatures)
        });
      } else {
        console.log(`   ❌ 失败: ${result.error}`);
        results.push({
          name: testCase.name,
          model: testCase.model,
          success: false,
          error: result.error
        });
      }

      // 等待1秒避免请求过快
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`   ❌ 错误: ${error.message}`);
      results.push({
        name: testCase.name,
        model: testCase.model,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

// 分析响应特征
function analyzeResponseFeatures(content, thinking) {
  const features = [];
  
  // 内容分析
  if (content.length > 1000) features.push('详细回复');
  if (content.includes('分析') || content.includes('角度')) features.push('分析性');
  if (content.includes('1.') || content.includes('•') || content.includes('**')) features.push('结构化');
  if (content.includes('商业') || content.includes('市场') || content.includes('成本')) features.push('商业导向');
  if (content.includes('创意') || content.includes('创新') || content.includes('想法')) features.push('创意性');
  if (content.includes('数据') || content.includes('趋势') || content.includes('统计')) features.push('数据驱动');
  
  // 思维过程分析
  if (thinking) {
    features.push('有思维过程');
    if (thinking.length > 100) features.push('深度思考');
  }
  
  // 专业性分析
  if (content.includes('从商业角度') || content.includes('就像') || content.includes('趋势表明')) {
    features.push('飘叔风格');
  }
  
  return features;
}

// 检查是否符合预期
function checkExpectation(actualFeatures, expectedFeatures) {
  return expectedFeatures.some(expected => 
    actualFeatures.some(actual => 
      actual.includes(expected) || expected.includes(actual)
    )
  );
}

// 生成测试报告
function generateReport(results) {
  console.log('\n📊 Nemotron集成测试报告');
  console.log('='.repeat(60));
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`\n🎯 测试结果: ${successfulTests.length}/${results.length} 成功`);
  
  if (successfulTests.length > 0) {
    console.log('\n✅ 成功的测试:');
    successfulTests.forEach(test => {
      console.log(`   ${test.name}:`);
      console.log(`     模型: ${test.model} → ${test.modelUsed}`);
      console.log(`     响应时间: ${test.responseTime}ms`);
      console.log(`     内容长度: ${test.contentLength} 字符`);
      console.log(`     思维过程: ${test.hasThinking ? '✓' : '✗'}`);
      console.log(`     特征匹配: ${test.matchesExpectation ? '✓' : '✗'}`);
      console.log(`     实际特征: ${test.features.join(', ')}`);
      console.log('');
    });
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ 失败的测试:');
    failedTests.forEach(test => {
      console.log(`   ${test.name}: ${test.error}`);
    });
  }
  
  // 模型性能对比
  console.log('\n📈 模型性能对比:');
  const modelStats = {};
  successfulTests.forEach(test => {
    const model = test.model;
    if (!modelStats[model]) {
      modelStats[model] = {
        count: 0,
        totalTime: 0,
        totalLength: 0,
        withThinking: 0
      };
    }
    modelStats[model].count++;
    modelStats[model].totalTime += test.responseTime;
    modelStats[model].totalLength += test.contentLength;
    if (test.hasThinking) modelStats[model].withThinking++;
  });
  
  Object.entries(modelStats).forEach(([model, stats]) => {
    console.log(`   ${model}:`);
    console.log(`     平均响应时间: ${Math.round(stats.totalTime / stats.count)}ms`);
    console.log(`     平均内容长度: ${Math.round(stats.totalLength / stats.count)} 字符`);
    console.log(`     思维过程率: ${Math.round(stats.withThinking / stats.count * 100)}%`);
  });
  
  // 总结建议
  console.log('\n💡 集成建议:');
  
  const nemotronTests = successfulTests.filter(t => t.model === 'nemotron' || t.modelUsed.includes('nemotron'));
  if (nemotronTests.length > 0) {
    const avgTime = nemotronTests.reduce((sum, t) => sum + t.responseTime, 0) / nemotronTests.length;
    const avgLength = nemotronTests.reduce((sum, t) => sum + t.contentLength, 0) / nemotronTests.length;
    
    console.log('✅ Nemotron模型集成成功:');
    console.log(`   - 平均响应时间: ${Math.round(avgTime)}ms`);
    console.log(`   - 平均内容长度: ${Math.round(avgLength)} 字符`);
    console.log(`   - 适合: 复杂分析、商业决策、深度推理`);
    
    if (avgTime < 20000 && avgLength > 800) {
      console.log('🚀 建议: Nemotron可以作为主要的分析模型使用');
    } else {
      console.log('⚠️  建议: Nemotron适合特定场景使用');
    }
  } else {
    console.log('❌ Nemotron模型集成可能存在问题');
  }
  
  console.log(`\n📝 测试完成时间: ${new Date().toLocaleString()}`);
}

// 主测试函数
async function runNemotronIntegrationTest() {
  console.log('🧠 开始Nemotron模型集成测试');
  console.log('目标: 验证Nemotron模型在飘叔Agent中的表现');
  
  const results = await testNemotronIntegration();
  generateReport(results);
  
  return results;
}

// 运行测试
runNemotronIntegrationTest().catch(console.error);