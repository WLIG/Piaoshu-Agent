// 测试飘叔Agent个性化学习功能

const BASE_URL = 'http://localhost:3000';

// 模拟不同风格的用户对话
const userPersonalities = {
  formal: {
    name: '正式商务用户',
    messages: [
      '您好，请问能否为我分析一下当前市场的投资机会？',
      '麻烦您详细说明一下风险控制的策略',
      '请您从专业角度评估这个商业模式的可行性',
      '能否请您提供一些数据支撑的分析报告？'
    ],
    expectedTraits: {
      formalityLevel: 'high',
      directness: 'medium',
      businessFocus: 'high'
    }
  },
  
  casual: {
    name: '轻松随意用户',
    messages: [
      '嗨！最近AI发展得怎么样？',
      '哈哈，这个想法挺有趣的，再聊聊呗',
      '简单说说就行，别太复杂',
      '有什么好玩的创意点子吗？'
    ],
    expectedTraits: {
      formalityLevel: 'low',
      humorLevel: 'high',
      directness: 'high'
    }
  },
  
  analytical: {
    name: '分析型用户',
    messages: [
      '请深度分析电商平台的盈利模式和成本结构',
      '从数据角度看，人工智能的发展趋势如何？',
      '能否提供一些具体的案例和统计数据？',
      '这个策略的ROI如何计算？有什么风险点？'
    ],
    expectedTraits: {
      analyticalThinking: 'high',
      dataOriented: 'high',
      businessFocus: 'high'
    }
  },
  
  creative: {
    name: '创意型用户',
    messages: [
      '帮我想个超酷的产品创意吧！',
      '有什么新颖的营销方案吗？',
      '来点不一样的想法，要有创新性',
      '设计一个颠覆性的商业模式'
    ],
    expectedTraits: {
      creativityLevel: 'high',
      marketingFocus: 'high',
      directness: 'medium'
    }
  }
};

// 测试个性化学习
async function testPersonalizedLearning() {
  console.log('🧠 测试飘叔Agent个性化学习功能');
  console.log('='.repeat(60));
  
  const results = {};
  
  for (const [personalityType, userData] of Object.entries(userPersonalities)) {
    console.log(`\n👤 测试用户类型: ${userData.name}`);
    console.log('-'.repeat(40));
    
    const userId = `test-${personalityType}-${Date.now()}`;
    const conversationResults = [];
    
    // 进行多轮对话
    for (let i = 0; i < userData.messages.length; i++) {
      const message = userData.messages[i];
      console.log(`\n💬 第${i + 1}轮对话:`);
      console.log(`用户: ${message}`);
      
      try {
        const startTime = Date.now();
        
        const response = await fetch(`${BASE_URL}/api/chat-personalized`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: message,
            userId: userId,
            useNvidia: true,
            model: 'auto'
          })
        });
        
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          const aiResponse = result.data.message.content;
          const personalization = result.data.personalization;
          
          console.log(`飘叔: ${aiResponse.substring(0, 150)}...`);
          console.log(`学习进度: ${personalization.learningProgress}%`);
          console.log(`偏好风格: ${personalization.preferredStyle}`);
          console.log(`交互次数: ${personalization.interactionCount}`);
          console.log(`响应时间: ${responseTime}ms`);
          
          conversationResults.push({
            round: i + 1,
            message,
            response: aiResponse,
            responseTime,
            personalization
          });
        } else {
          console.log(`❌ 失败: ${result.error}`);
        }
        
        // 等待1秒避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ 第${i + 1}轮对话错误:`, error.message);
      }
    }
    
    // 获取最终的个性化档案
    try {
      const profileResponse = await fetch(`${BASE_URL}/api/personality?userId=${userId}`);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        console.log(`\n📊 ${userData.name} 最终个性化档案:`);
        const profile = profileData.data.personalityProfile;
        const analysis = profileData.data.conversationAnalysis;
        
        console.log(`正式程度: ${Math.round(profile.formalityLevel * 100)}%`);
        console.log(`幽默程度: ${Math.round(profile.humorLevel * 100)}%`);
        console.log(`直接程度: ${Math.round(profile.directness * 100)}%`);
        console.log(`分析思维: ${Math.round(profile.analyticalThinking * 100)}%`);
        console.log(`创意水平: ${Math.round(profile.creativityLevel * 100)}%`);
        console.log(`商业导向: ${Math.round(profile.businessFocus * 100)}%`);
        console.log(`技术导向: ${Math.round(profile.techFocus * 100)}%`);
        
        console.log(`\n常见话题: ${analysis.commonTopics?.join(', ') || '无'}`);
        console.log(`平均消息长度: ${analysis.averageMessageLength || 0} 字符`);
        
        results[personalityType] = {
          userData,
          conversationResults,
          finalProfile: profile,
          analysis
        };
      }
    } catch (error) {
      console.error('获取个性化档案失败:', error.message);
    }
  }
  
  return results;
}

// 分析学习效果
function analyzeLearningEffectiveness(results) {
  console.log('\n📈 个性化学习效果分析');
  console.log('='.repeat(60));
  
  Object.entries(results).forEach(([personalityType, data]) => {
    console.log(`\n🎯 ${data.userData.name} 学习效果:`);
    
    const profile = data.finalProfile;
    const expected = data.userData.expectedTraits;
    
    // 检查学习效果
    let matchCount = 0;
    let totalChecks = 0;
    
    Object.entries(expected).forEach(([trait, expectedLevel]) => {
      totalChecks++;
      const actualValue = profile[trait];
      
      let matches = false;
      if (expectedLevel === 'high' && actualValue > 0.6) matches = true;
      if (expectedLevel === 'medium' && actualValue >= 0.4 && actualValue <= 0.7) matches = true;
      if (expectedLevel === 'low' && actualValue < 0.5) matches = true;
      
      if (matches) matchCount++;
      
      console.log(`  ${trait}: 期望${expectedLevel}, 实际${Math.round(actualValue * 100)}% ${matches ? '✅' : '❌'}`);
    });
    
    const accuracy = Math.round((matchCount / totalChecks) * 100);
    console.log(`  学习准确率: ${accuracy}%`);
    
    // 分析对话质量变化
    const firstResponse = data.conversationResults[0];
    const lastResponse = data.conversationResults[data.conversationResults.length - 1];
    
    if (firstResponse && lastResponse) {
      console.log(`  首次响应长度: ${firstResponse.response.length} 字符`);
      console.log(`  最终响应长度: ${lastResponse.response.length} 字符`);
      console.log(`  学习进度提升: ${firstResponse.personalization.learningProgress}% → ${lastResponse.personalization.learningProgress}%`);
    }
  });
  
  // 总体评估
  console.log('\n🏆 总体评估:');
  const allAccuracies = Object.values(results).map(data => {
    const profile = data.finalProfile;
    const expected = data.userData.expectedTraits;
    
    let matchCount = 0;
    let totalChecks = 0;
    
    Object.entries(expected).forEach(([trait, expectedLevel]) => {
      totalChecks++;
      const actualValue = profile[trait];
      
      if (expectedLevel === 'high' && actualValue > 0.6) matchCount++;
      if (expectedLevel === 'medium' && actualValue >= 0.4 && actualValue <= 0.7) matchCount++;
      if (expectedLevel === 'low' && actualValue < 0.5) matchCount++;
    });
    
    return (matchCount / totalChecks) * 100;
  });
  
  const averageAccuracy = allAccuracies.reduce((sum, acc) => sum + acc, 0) / allAccuracies.length;
  console.log(`平均学习准确率: ${Math.round(averageAccuracy)}%`);
  
  if (averageAccuracy > 70) {
    console.log('🎉 个性化学习效果优秀！');
  } else if (averageAccuracy > 50) {
    console.log('✅ 个性化学习效果良好');
  } else {
    console.log('⚠️ 个性化学习需要优化');
  }
}

// 主测试函数
async function runPersonalizedLearningTest() {
  console.log('🚀 开始飘叔Agent个性化学习测试');
  console.log('目标: 验证系统能否学习不同用户的交流风格');
  
  const results = await testPersonalizedLearning();
  analyzeLearningEffectiveness(results);
  
  console.log(`\n📝 测试完成时间: ${new Date().toLocaleString()}`);
  
  return results;
}

// 运行测试
runPersonalizedLearningTest().catch(console.error);