// 测试商业分析模式

const BASE_URL = 'http://localhost:3000';

async function testBusinessMode() {
  console.log('📊 测试商业分析专用模式');
  
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: '分析共享经济模式的核心竞争力和风险点',
        useNvidia: true,
        model: 'business',
        userId: 'test-business-user'
      })
    });

    console.log('响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return false;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 商业分析模式成功');
      console.log('模型:', result.data.model);
      console.log('内容长度:', result.data.message.content.length);
      console.log('预览:', result.data.message.content.substring(0, 200) + '...');
      return true;
    } else {
      console.error('❌ 业务逻辑失败:', result.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    return false;
  }
}

testBusinessMode();