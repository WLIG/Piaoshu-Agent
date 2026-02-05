// 图片分析功能测试脚本

const BASE_URL = 'http://localhost:3000';

async function testImageAnalysis() {
  console.log('🖼️ 开始测试图片分析功能...\n');

  // 测试1: 直接调用图片分析API
  console.log('📋 测试1: 直接调用图片分析API');
  try {
    const response = await fetch(`${BASE_URL}/api/analyze/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: '/uploads/other/test-image.jpg',
        fileName: '微信图片_2026-01-01_214349_835.jpg'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ 图片分析成功');
      console.log('📊 分析方法:', data.data.details.analysisMethod);
      console.log('🎯 置信度:', data.data.details.confidence);
      console.log('📝 分析结果预览:', data.data.description.substring(0, 200) + '...');
      
      if (data.data.rawAnalysis) {
        console.log('🔍 原始分析:', data.data.rawAnalysis.substring(0, 150) + '...');
      }
    } else {
      console.log('❌ 图片分析失败:', data.error);
    }
  } catch (error) {
    console.log('❌ API调用失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试2: 测试NVIDIA视觉模型连接
  console.log('📋 测试2: NVIDIA视觉模型连接');
  try {
    const { NvidiaModelClient } = await import('./src/lib/nvidia-models-simple.ts');
    const client = new NvidiaModelClient();
    
    const testMessages = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '请描述这张图片的内容'
          },
          {
            type: 'image_url',
            image_url: {
              url: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Test+Image'
            }
          }
        ]
      }
    ];

    const visionResponse = await client.callVisionModel(testMessages);
    
    if (visionResponse.choices?.[0]?.message?.content) {
      console.log('✅ NVIDIA视觉模型连接成功');
      console.log('📝 测试回复:', visionResponse.choices[0].message.content.substring(0, 100) + '...');
    } else {
      console.log('⚠️ NVIDIA视觉模型返回空结果');
    }
  } catch (error) {
    console.log('❌ NVIDIA视觉模型测试失败:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试3: 测试完整的聊天流程（带图片）
  console.log('📋 测试3: 完整聊天流程（带图片）');
  try {
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `请分析这张图片：

📸 上传的图片：
1. 微信图片_2026-01-01_214349_835.jpg
   图片内容：这是一张微信相关的截图，包含聊天界面和功能按钮

请基于这些图片内容进行分析和回答。`,
        userId: 'test_user',
        hasAttachments: true,
        attachments: [
          {
            type: 'image',
            name: '微信图片_2026-01-01_214349_835.jpg',
            analysis: '这是一张微信相关的截图，包含聊天界面和功能按钮'
          }
        ]
      }),
    });

    const chatData = await chatResponse.json();
    
    if (chatData.success) {
      console.log('✅ 聊天API响应成功');
      console.log('🤖 AI回复预览:', chatData.data.message.content.substring(0, 200) + '...');
      console.log('🧠 思考过程:', chatData.data.message.thinking || '无');
    } else {
      console.log('❌ 聊天API失败:', chatData.error);
    }
  } catch (error) {
    console.log('❌ 聊天API调用失败:', error.message);
  }

  console.log('\n🎉 图片分析功能测试完成！');
}

// 运行测试
testImageAnalysis().catch(console.error);