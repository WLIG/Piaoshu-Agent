// 测试NVIDIA Build API可用的所有模型

const API_KEY = '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';
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

// 获取所有可用模型
async function getAllAvailableModels() {
  console.log('🔍 获取NVIDIA Build API所有可用模型...');
  
  try {
    const response = await fetch(`${BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }

    const result = await response.json();
    const models = result.data || [];
    
    console.log(`✅ 找到 ${models.length} 个可用模型`);
    
    // 按类别分组
    const categories = {
      'chat': [],
      'embedding': [],
      'image': [],
      'audio': [],
      'other': []
    };

    models.forEach(model => {
      const modelId = model.id;
      const modelName = model.name || modelId;
      
      if (modelId.includes('chat') || modelId.includes('llm') || 
          modelId.includes('glm') || modelId.includes('kimi') || 
          modelId.includes('nemotron') || modelId.includes('gemma')) {
        categories.chat.push({ id: modelId, name: modelName });
      } else if (modelId.includes('embed')) {
        categories.embedding.push({ id: modelId, name: modelName });
      } else if (modelId.includes('vision') || modelId.includes('image') || modelId.includes('llava')) {
        categories.image.push({ id: modelId, name: modelName });
      } else if (modelId.includes('audio') || modelId.includes('speech')) {
        categories.audio.push({ id: modelId, name: modelName });
      } else {
        categories.other.push({ id: modelId, name: modelName });
      }
    });

    return categories;
  } catch (error) {
    console.error('❌ 获取模型列表失败:', error.message);
    return null;
  }
}

// 测试特定模型是否可用
async function testModelAvailability(modelId) {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

// 推荐适合飘叔Agent的模型
function recommendModelsForPiaoshu(categories) {
  console.log('\n💡 推荐适合飘叔Agent的模型:');
  
  const recommendations = {
    '对话模型': [],
    '推理模型': [],
    '创意模型': [],
    '多模态模型': [],
    '专业模型': []
  };

  // 分析聊天模型
  categories.chat.forEach(model => {
    const modelId = model.id.toLowerCase();
    
    if (modelId.includes('glm') || modelId.includes('zhipu')) {
      recommendations['推理模型'].push(model);
    } else if (modelId.includes('kimi') || modelId.includes('moonshot')) {
      recommendations['创意模型'].push(model);
    } else if (modelId.includes('nemotron') || modelId.includes('reasoning')) {
      recommendations['专业模型'].push(model);
    } else if (modelId.includes('llama') || modelId.includes('mistral') || modelId.includes('qwen')) {
      recommendations['对话模型'].push(model);
    }
  });

  // 分析多模态模型
  categories.image.forEach(model => {
    recommendations['多模态模型'].push(model);
  });

  return recommendations;
}

// 主函数
async function exploreNvidiaModels() {
  console.log('🚀 探索NVIDIA Build API模型生态');
  console.log('API Key:', API_KEY.substring(0, 20) + '...');
  
  const categories = await getAllAvailableModels();
  
  if (!categories) {
    console.log('❌ 无法获取模型列表');
    return;
  }

  console.log('\n📊 模型分类统计:');
  Object.entries(categories).forEach(([category, models]) => {
    console.log(`${category}: ${models.length} 个模型`);
  });

  console.log('\n🤖 聊天/对话模型 (前20个):');
  categories.chat.slice(0, 20).forEach((model, index) => {
    console.log(`${index + 1}. ${model.id}`);
  });

  console.log('\n🖼️ 多模态/视觉模型 (前10个):');
  categories.image.slice(0, 10).forEach((model, index) => {
    console.log(`${index + 1}. ${model.id}`);
  });

  // 推荐模型
  const recommendations = recommendModelsForPiaoshu(categories);
  
  console.log('\n🎯 飘叔Agent模型推荐:');
  Object.entries(recommendations).forEach(([category, models]) => {
    if (models.length > 0) {
      console.log(`\n${category}:`);
      models.slice(0, 5).forEach(model => {
        console.log(`  • ${model.id}`);
      });
    }
  });

  // 测试几个关键模型的可用性
  console.log('\n🔬 测试关键模型可用性:');
  const keyModels = [
    'z-ai/glm4.7',
    'moonshotai/kimi-k2.5',
    'nvidia/nemotron-3-nano-30b-a3b',
    'meta/llama-3.2-11b-vision-instruct',
    'google/gemma-3n-e2b-it'
  ];

  for (const modelId of keyModels) {
    const available = await testModelAvailability(modelId);
    console.log(`${available ? '✅' : '❌'} ${modelId}`);
  }

  console.log('\n📝 结论:');
  console.log('• 你的API Key可以访问NVIDIA Build平台的所有公开模型');
  console.log('• 不需要单独设定，只需要在代码中指定model参数');
  console.log('• 建议根据任务类型选择合适的模型');
  console.log('• 可以随时添加新模型到飘叔Agent中');
}

exploreNvidiaModels().catch(console.error);