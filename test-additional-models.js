// 测试额外的NVIDIA模型
// Google Gemma-3n-e2b-it 和 NVIDIA Nemotron-3-nano-30b-a3b

const API_KEY = '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';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

// 测试Google Gemma模型
async function testGemmaModel() {
  console.log('\n🔍 测试 Google Gemma-3n-e2b-it 模型...');
  
  const payload = {
    model: 'google/gemma-3n-e2b-it',
    messages: [
      {
        role: 'user',
        content: '请简单介绍一下你的特点和优势'
      }
    ],
    max_tokens: 512,
    temperature: 0.20,
    top_p: 0.70,
    frequency_penalty: 0.00,
    presence_penalty: 0.00,
    stream: false
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
      throw new Error(`Gemma API错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Gemma模型响应成功:');
    console.log('模型:', result.model);
    console.log('内容:', result.choices[0].message.content);
    console.log('Token使用:', result.usage);
    
    return {
      success: true,
      model: 'google/gemma-3n-e2b-it',
      content: result.choices[0].message.content,
      usage: result.usage,
      characteristics: analyzeResponse(result.choices[0].message.content)
    };
  } catch (error) {
    console.error('❌ Gemma模型测试失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 测试NVIDIA Nemotron模型
async function testNemotronModel() {
  console.log('\n🧠 测试 NVIDIA Nemotron-3-nano-30b-a3b 模型...');
  
  const payload = {
    model: 'nvidia/nemotron-3-nano-30b-a3b',
    messages: [
      {
        role: 'user',
        content: '请分析一下人工智能在商业决策中的应用价值'
      }
    ],
    temperature: 1,
    top_p: 1,
    max_tokens: 1024,
    extra_body: {
      reasoning_budget: 1024,
      chat_template_kwargs: {
        enable_thinking: true
      }
    },
    stream: false
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
      throw new Error(`Nemotron API错误: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Nemotron模型响应成功:');
    console.log('模型:', result.model);
    console.log('内容:', result.choices[0].message.content);
    console.log('推理内容:', result.choices[0].message.reasoning_content || '无');
    console.log('Token使用:', result.usage);
    
    return {
      success: true,
      model: 'nvidia/nemotron-3-nano-30b-a3b',
      content: result.choices[0].message.content,
      reasoning: result.choices[0].message.reasoning_content,
      usage: result.usage,
      characteristics: analyzeResponse(result.choices[0].message.content)
    };
  } catch (error) {
    console.error('❌ Nemotron模型测试失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 分析响应特点
function analyzeResponse(content) {
  if (!content) return {};
  
  const length = content.length;
  const hasStructure = content.includes('1.') || content.includes('•') || content.includes('-');
  const hasAnalysis = content.includes('分析') || content.includes('角度') || content.includes('方面');
  const hasExamples = content.includes('例如') || content.includes('比如') || content.includes('如');
  const tone = content.includes('专业') ? 'professional' : 
              content.includes('简单') ? 'simple' : 'neutral';
  
  return {
    length,
    hasStructure,
    hasAnalysis,
    hasExamples,
    tone,
    complexity: length > 500 ? 'high' : length > 200 ? 'medium' : 'low'
  };
}

// 对比测试
async function compareModels() {
  console.log('\n📊 模型对比测试...');
  
  const testPrompt = '请从商业角度分析电商平台的核心竞争力';
  
  const models = [
    { name: 'GLM4.7', model: 'z-ai/glm4.7' },
    { name: 'Kimi2.5', model: 'moonshotai/kimi-k2.5' },
    { name: 'Gemma', model: 'google/gemma-3n-e2b-it' },
    { name: 'Nemotron', model: 'nvidia/nemotron-3-nano-30b-a3b' }
  ];

  const results = [];

  for (const modelInfo of models) {
    console.log(`\n🔄 测试 ${modelInfo.name}...`);
    
    try {
      const payload = {
        model: modelInfo.model,
        messages: [{ role: 'user', content: testPrompt }],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      };

      // 特殊配置
      if (modelInfo.model === 'z-ai/glm4.7') {
        payload.extra_body = {
          chat_template_kwargs: { enable_thinking: true, clear_thinking: false }
        };
      } else if (modelInfo.model === 'moonshotai/kimi-k2.5') {
        payload.chat_template_kwargs = { thinking: true };
      } else if (modelInfo.model === 'nvidia/nemotron-3-nano-30b-a3b') {
        payload.extra_body = {
          reasoning_budget: 800,
          chat_template_kwargs: { enable_thinking: true }
        };
      }

      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const result = await response.json();
        const content = result.choices[0].message.content;
        
        results.push({
          name: modelInfo.name,
          model: modelInfo.model,
          success: true,
          responseTime,
          contentLength: content?.length || 0,
          usage: result.usage,
          characteristics: analyzeResponse(content),
          preview: content?.substring(0, 100) + '...'
        });
        
        console.log(`✅ ${modelInfo.name} 成功 (${responseTime}ms)`);
      } else {
        console.log(`❌ ${modelInfo.name} 失败: ${response.status}`);
        results.push({
          name: modelInfo.name,
          model: modelInfo.model,
          success: false,
          error: response.status
        });
      }
    } catch (error) {
      console.log(`❌ ${modelInfo.name} 错误: ${error.message}`);
      results.push({
        name: modelInfo.name,
        model: modelInfo.model,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

// 生成建议报告
function generateRecommendation(gemmaResult, nemotronResult, comparisonResults) {
  console.log('\n📋 模型评估报告');
  console.log('='.repeat(60));
  
  const successfulModels = comparisonResults.filter(r => r.success);
  
  console.log('\n🎯 性能对比:');
  successfulModels.forEach(model => {
    console.log(`${model.name}:`);
    console.log(`  响应时间: ${model.responseTime}ms`);
    console.log(`  内容长度: ${model.contentLength} 字符`);
    console.log(`  复杂度: ${model.characteristics.complexity}`);
    console.log(`  结构化: ${model.characteristics.hasStructure ? '是' : '否'}`);
    console.log(`  分析性: ${model.characteristics.hasAnalysis ? '是' : '否'}`);
    console.log('');
  });

  console.log('💡 建议:');
  
  // 分析Gemma的价值
  if (gemmaResult.success) {
    const gemmaChar = gemmaResult.characteristics;
    if (gemmaChar.complexity === 'low' && gemmaChar.tone === 'simple') {
      console.log('✅ Gemma适合: 快速简答、基础对话、轻量级任务');
    } else {
      console.log('⚠️  Gemma特点不够突出，可能与现有模型重叠');
    }
  }

  // 分析Nemotron的价值
  if (nemotronResult.success) {
    const nemotronChar = nemotronResult.characteristics;
    if (nemotronResult.reasoning && nemotronChar.hasAnalysis) {
      console.log('✅ Nemotron适合: 深度推理、复杂分析、专业决策');
    } else {
      console.log('⚠️  Nemotron推理能力需要进一步验证');
    }
  }

  // 总体建议
  const currentModels = successfulModels.filter(m => m.name === 'GLM4.7' || m.name === 'Kimi2.5');
  const newModels = successfulModels.filter(m => m.name === 'Gemma' || m.name === 'Nemotron');
  
  if (newModels.length > 0) {
    console.log('\n🚀 集成建议:');
    
    // 检查是否有独特价值
    const hasUniqueValue = newModels.some(model => {
      const isUnique = model.characteristics.complexity !== 'medium' || 
                      model.responseTime < 1000 || 
                      model.contentLength > 1000;
      return isUnique;
    });

    if (hasUniqueValue) {
      console.log('✅ 建议集成新模型，可以提供差异化价值');
      newModels.forEach(model => {
        if (model.responseTime < 1000) {
          console.log(`  ${model.name}: 快速响应场景`);
        }
        if (model.characteristics.complexity === 'high') {
          console.log(`  ${model.name}: 复杂分析场景`);
        }
      });
    } else {
      console.log('⚠️  新模型与现有模型功能重叠，集成价值有限');
      console.log('   建议: 保持当前GLM4.7 + Kimi2.5的组合');
    }
  }
}

// 主测试函数
async function runAdditionalModelTests() {
  console.log('🚀 开始测试额外的NVIDIA模型');
  console.log('测试目标: 评估是否值得集成到飘叔Agent');
  
  const [gemmaResult, nemotronResult] = await Promise.all([
    testGemmaModel(),
    testNemotronModel()
  ]);

  const comparisonResults = await compareModels();
  
  generateRecommendation(gemmaResult, nemotronResult, comparisonResults);
  
  console.log('\n📝 测试完成时间:', new Date().toLocaleString());
}

// 运行测试
runAdditionalModelTests().catch(console.error);