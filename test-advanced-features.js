// 测试高级功能：完整模型集成、精准个性化学习、情感智能和对话记忆

const BASE_URL = 'http://localhost:3000';

// 测试场景：不同类型的用户和对话
const testScenarios = [
  {
    name: '商业分析师',
    personality: 'analytical_business',
    messages: [
      '你好，我需要深度分析一下电商行业的发展趋势',
      '请提供具体的数据支撑和市场分析',
      '我特别关注用户获取成本和生命周期价值的关系',
      '基于这些分析，你认为哪些商业模式最有前景？'
    ],
    expectedFeatures: ['深度分析', '数据驱动', '商业导向', 'Nemotron模型']
  },
  
  {
    name: '创意营销人员',
    personality: 'creative_marketing',
    messages: [
      '嗨！我想为我们的AI产品设计一个超酷的营销活动',
      '需要一些有创意的想法，要能抓住年轻用户的眼球',
      '预算不多，但希望能病毒式传播',
      '你觉得我们应该重点突出哪些卖点？'
    ],
    expectedFeatures: ['创意思维', '营销导向', '轻松风格', 'Kimi模型']
  },
  
  {
    name: '技术负责人',
    personality: 'technical_leader',
    messages: [
      '我们团队正在考虑技术架构升级',
      '主要是微服务和容器化的问题',
      '需要平衡性能、成本和开发效率',
      '你有什么实用的建议吗？'
    ],
    expectedFeatures: ['技术深度', '实用导向', '系统思维', 'GLM模型']
  }
];

// 测试完整模型集成
async function testCompleteModelIntegration() {
  console.log('🤖 测试完整NVIDIA模型集成...');
  
  const testModels = [
    'z-ai/glm4.7',
    'nvidia/nemotron-3-nano-30b-a3b', 
    'moonshotai/kimi-k2.5',
    'nvidia/llama3-chatqa-1.5-8b',
    'meta/llama-3.2-11b-vision-instruct'
  ];

  const results = {};
  
  for (const model of testModels) {
    console.log(`\n📝 测试模型: ${model}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${BASE_URL}/api/chat-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: '请简单介绍一下你的特点和优势',
          userId: `test-model-${Date.now()}`,
          useNvidia: true,
          model: model.includes('/') ? model.split('/')[1] : model
        })
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const result = await response.json();
        
        results[model] = {
          success: true,
          responseTime,
          contentLength: result.data.message.content.length,
          modelUsed: result.data.model,
          personalization: result.data.personalization
        };
        
        console.log(`✅ 成功 (${responseTime}ms)`);
        console.log(`内容长度: ${result.data.message.content.length} 字符`);
        console.log(`个性化适应: ${result.data.personalization.adaptationLevel}%`);
      } else {
        results[model] = {
          success: false,
          error: response.status
        };
        console.log(`❌ 失败: ${response.status}`);
      }
      
      // 等待避免请求过快
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      results[model] = {
        success: false,
        error: error.message
      };
      console.error(`❌ 错误: ${error.message}`);
    }
  }
  
  return results;
}

// 测试高级个性化学习
async function testAdvancedPersonalization() {
  console.log('\n🧠 测试高级个性化学习...');
  
  const results = {};
  
  for (const scenario of testScenarios) {
    console.log(`\n👤 测试场景: ${scenario.name}`);
    console.log('-'.repeat(40));
    
    const userId = `test-${scenario.personality}-${Date.now()}`;
    const conversationResults = [];
    
    // 进行多轮对话以观察学习效果
    for (let i = 0; i < scenario.messages.length; i++) {
      const message = scenario.messages[i];
      console.log(`\n💬 第${i + 1}轮: ${message.slice(0, 50)}...`);
      
      try {
        const response = await fetch(`${BASE_URL}/api/chat-enhanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            userId,
            useNvidia: true,
            model: 'auto' // 让系统自动选择
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          const personalization = result.data.personalization;
          
          conversationResults.push({
            round: i + 1,
            message,
            response: result.data.message.content,
            modelUsed: result.data.model,
            personalization
          });
          
          console.log(`模型选择: ${result.data.model}`);
          console.log(`个性化程度: ${personalization.adaptationLevel}%`);
          console.log(`模型推荐: ${personalization.modelRecommendation}`);
          
          // 分析个性特征变化
          if (personalization.personalityInsights) {
            const insights = personalization.personalityInsights;
            console.log(`检测到特征: 分析性${Math.round(insights.analytical*100)}%, 创意性${Math.round(insights.creative*100)}%, 商业性${Math.round(insights.business*100)}%`);
          }
          
        } else {
          console.log(`❌ 第${i + 1}轮失败: ${response.status}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ 第${i + 1}轮错误:`, error.message);
      }
    }
    
    results[scenario.name] = {
      scenario,
      conversationResults,
      learningEffectiveness: analyzeLearningEffectiveness(conversationResults, scenario.expectedFeatures)
    };
  }
  
  return results;
}

// 分析学习效果
function analyzeLearningEffectiveness(conversationResults, expectedFeatures) {
  if (conversationResults.length === 0) return { score: 0, analysis: '无对话数据' };
  
  const firstResult = conversationResults[0];
  const lastResult = conversationResults[conversationResults.length - 1];
  
  let score = 0;
  const analysis = [];
  
  // 检查模型选择是否合理
  const modelProgression = conversationResults.map(r => r.modelUsed);
  const uniqueModels = new Set(modelProgression);
  
  if (uniqueModels.size > 1) {
    score += 20;
    analysis.push('模型选择有适应性变化');
  }
  
  // 检查个性化程度提升
  if (lastResult.personalization.adaptationLevel > firstResult.personalization.adaptationLevel) {
    score += 30;
    analysis.push(`个性化程度提升: ${firstResult.personalization.adaptationLevel}% → ${lastResult.personalization.adaptationLevel}%`);
  }
  
  // 检查响应质量变化
  const avgFirstLength = conversationResults.slice(0, 2).reduce((sum, r) => sum + r.response.length, 0) / 2;
  const avgLastLength = conversationResults.slice(-2).reduce((sum, r) => sum + r.response.length, 0) / 2;
  
  if (avgLastLength > avgFirstLength * 1.2) {
    score += 25;
    analysis.push('响应详细程度有提升');
  }
  
  // 检查特征匹配
  expectedFeatures.forEach(feature => {
    const matchFound = conversationResults.some(r => 
      r.modelUsed.includes(feature.toLowerCase()) || 
      r.personalization.modelRecommendation?.includes(feature)
    );
    if (matchFound) {
      score += 25 / expectedFeatures.length;
      analysis.push(`匹配预期特征: ${feature}`);
    }
  });
  
  return {
    score: Math.round(score),
    analysis: analysis.join('; '),
    modelProgression,
    adaptationTrend: conversationResults.map(r => r.personalization.adaptationLevel)
  };
}

// 测试情感智能
async function testEmotionalIntelligence() {
  console.log('\n💭 测试情感智能...');
  
  const emotionalScenarios = [
    {
      name: '兴奋用户',
      message: '太好了！我们的项目获得了投资！我超级兴奋！！！',
      expectedEmotion: 'positive_high_arousal'
    },
    {
      name: '困惑用户', 
      message: '我不太确定这个策略是否正确，有点担心会出问题...',
      expectedEmotion: 'negative_low_arousal'
    },
    {
      name: '专业用户',
      message: '请提供关于市场分析的详细报告，需要包含数据支撑。',
      expectedEmotion: 'neutral_medium_dominance'
    }
  ];
  
  const results = {};
  
  for (const scenario of emotionalScenarios) {
    console.log(`\n😊 测试情感场景: ${scenario.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/chat-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: scenario.message,
          userId: `emotion-test-${Date.now()}`,
          useNvidia: true,
          model: 'auto'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        results[scenario.name] = {
          success: true,
          message: scenario.message,
          response: result.data.message.content,
          emotionDetected: analyzeEmotionInResponse(result.data.message.content),
          adaptationLevel: result.data.personalization?.adaptationLevel || 0
        };
        
        console.log(`✅ 情感响应成功`);
        console.log(`响应风格: ${results[scenario.name].emotionDetected}`);
        console.log(`预览: ${result.data.message.content.slice(0, 100)}...`);
        
      } else {
        results[scenario.name] = {
          success: false,
          error: response.status
        };
        console.log(`❌ 失败: ${response.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results[scenario.name] = {
        success: false,
        error: error.message
      };
      console.error(`❌ 错误: ${error.message}`);
    }
  }
  
  return results;
}

// 分析响应中的情感适应
function analyzeEmotionInResponse(response) {
  const responseLower = response.toLowerCase();
  
  if (responseLower.includes('太好了') || responseLower.includes('恭喜') || responseLower.includes('！')) {
    return '积极兴奋';
  } else if (responseLower.includes('理解') || responseLower.includes('不用担心') || responseLower.includes('建议')) {
    return '理解支持';
  } else if (responseLower.includes('专业') || responseLower.includes('分析') || responseLower.includes('数据')) {
    return '专业客观';
  } else {
    return '中性平和';
  }
}

// 生成测试报告
function generateTestReport(modelResults, personalizationResults, emotionResults) {
  console.log('\n📊 高级功能测试报告');
  console.log('='.repeat(60));
  
  // 模型集成测试结果
  console.log('\n🤖 模型集成测试结果:');
  const successfulModels = Object.entries(modelResults).filter(([, result]) => result.success);
  console.log(`成功率: ${successfulModels.length}/${Object.keys(modelResults).length} (${Math.round(successfulModels.length/Object.keys(modelResults).length*100)}%)`);
  
  successfulModels.forEach(([model, result]) => {
    console.log(`  ${model}: ${result.responseTime}ms, ${result.contentLength}字符`);
  });
  
  // 个性化学习测试结果
  console.log('\n🧠 个性化学习测试结果:');
  Object.entries(personalizationResults).forEach(([scenarioName, result]) => {
    console.log(`  ${scenarioName}:`);
    console.log(`    学习效果评分: ${result.learningEffectiveness.score}/100`);
    console.log(`    分析: ${result.learningEffectiveness.analysis}`);
    console.log(`    模型选择: ${result.learningEffectiveness.modelProgression.join(' → ')}`);
  });
  
  // 情感智能测试结果
  console.log('\n💭 情感智能测试结果:');
  const emotionSuccessCount = Object.values(emotionResults).filter(r => r.success).length;
  console.log(`成功率: ${emotionSuccessCount}/${Object.keys(emotionResults).length} (${Math.round(emotionSuccessCount/Object.keys(emotionResults).length*100)}%)`);
  
  Object.entries(emotionResults).forEach(([scenarioName, result]) => {
    if (result.success) {
      console.log(`  ${scenarioName}: ${result.emotionDetected}`);
    }
  });
  
  // 总体评估
  console.log('\n🎯 总体评估:');
  const modelSuccessRate = successfulModels.length / Object.keys(modelResults).length;
  const avgPersonalizationScore = Object.values(personalizationResults).reduce((sum, r) => sum + r.learningEffectiveness.score, 0) / Object.keys(personalizationResults).length;
  const emotionSuccessRate = emotionSuccessCount / Object.keys(emotionResults).length;
  
  const overallScore = (modelSuccessRate * 30 + avgPersonalizationScore / 100 * 40 + emotionSuccessRate * 30) * 100;
  
  console.log(`模型集成: ${Math.round(modelSuccessRate * 100)}%`);
  console.log(`个性化学习: ${Math.round(avgPersonalizationScore)}%`);
  console.log(`情感智能: ${Math.round(emotionSuccessRate * 100)}%`);
  console.log(`综合评分: ${Math.round(overallScore)}%`);
  
  if (overallScore > 80) {
    console.log('🎉 优秀！高级功能运行完美！');
  } else if (overallScore > 60) {
    console.log('✅ 良好！大部分功能正常运行');
  } else {
    console.log('⚠️ 需要改进！部分功能需要优化');
  }
}

// 主测试函数
async function runAdvancedFeaturesTest() {
  console.log('🚀 开始高级功能综合测试');
  console.log('测试内容: 完整模型集成 + 精准个性化学习 + 情感智能 + 对话记忆');
  
  const modelResults = await testCompleteModelIntegration();
  const personalizationResults = await testAdvancedPersonalization();
  const emotionResults = await testEmotionalIntelligence();
  
  generateTestReport(modelResults, personalizationResults, emotionResults);
  
  console.log(`\n📝 测试完成时间: ${new Date().toLocaleString()}`);
  
  return {
    modelResults,
    personalizationResults,
    emotionResults,
    timestamp: new Date().toISOString()
  };
}

// 运行测试
runAdvancedFeaturesTest().catch(console.error);