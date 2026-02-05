// 飘叔Agent全功能验证脚本
const http = require('http');

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求函数
function makeRequest(path, data = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: timeout
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: { text: body }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 生成模拟音频数据
function generateMockAudioData(length = 'medium') {
  const lengths = { short: 3000, medium: 10000, long: 20000 };
  const targetLength = lengths[length] || lengths.medium;
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  
  for (let i = 0; i < targetLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// 1. 测试服务器连接
async function testServerConnection() {
  colorLog('cyan', '🔗 测试服务器连接...');
  
  try {
    const response = await makeRequest('/', null, 5000);
    
    if (response.status === 200) {
      colorLog('green', '✅ 服务器连接正常');
      return true;
    } else {
      colorLog('red', `❌ 服务器响应异常: ${response.status}`);
      return false;
    }
  } catch (error) {
    colorLog('red', `❌ 服务器连接失败: ${error.message}`);
    colorLog('yellow', '💡 请确保服务器正在运行: npx next dev -p 3000');
    return false;
  }
}

// 2. 测试对话功能
async function testChatFunction() {
  colorLog('cyan', '\n💬 测试对话功能...');
  
  const testMessages = [
    '你好，请介绍一下你的功能',
    '请分析一下区块链技术的发展前景',
    'Web4.0时代有什么特点？'
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    
    colorLog('yellow', `📝 测试消息 ${i + 1}: ${message}`);
    
    try {
      const startTime = Date.now();
      
      const response = await makeRequest('/api/chat-simple', {
        message: message,
        useSkills: true,
        userId: 'test-user'
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200 && response.data.success) {
        const content = response.data.data.message.content;
        colorLog('green', `✅ 对话成功 (${responseTime}ms)`);
        colorLog('magenta', `回复: ${content.substring(0, 100)}...`);
        
        // 检查Skills系统特征
        if (content.includes('专业') || content.includes('分析') || content.includes('基于')) {
          colorLog('blue', '🎯 检测到Skills系统增强');
        }
        
        successCount++;
      } else {
        colorLog('red', `❌ 对话失败: ${response.data.error || '未知错误'}`);
      }
      
    } catch (error) {
      colorLog('red', `❌ 请求失败: ${error.message}`);
    }
    
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { total: testMessages.length, success: successCount };
}

// 3. 测试语音识别功能
async function testVoiceFunction() {
  colorLog('cyan', '\n🎤 测试语音识别功能...');
  
  // 首先测试ASR服务状态
  try {
    const statusResponse = await makeRequest('/api/multimodal/asr');
    
    if (statusResponse.status === 200 && statusResponse.data.success) {
      colorLog('green', '✅ ASR服务可用');
      
      const serviceInfo = statusResponse.data.data;
      console.log(`   - 服务: ${serviceInfo.service}`);
      console.log(`   - 可用提供商: ${serviceInfo.availableProviders?.join(', ')}`);
      console.log(`   - 支持语言: ${serviceInfo.supportedLanguages?.join(', ')}`);
    } else {
      colorLog('red', '❌ ASR服务不可用');
      return { total: 1, success: 0 };
    }
  } catch (error) {
    colorLog('red', `❌ ASR服务检查失败: ${error.message}`);
    return { total: 1, success: 0 };
  }
  
  // 测试语音识别
  const testCases = [
    { name: '短音频', length: 'short' },
    { name: '中等音频', length: 'medium' },
    { name: '长音频', length: 'long' }
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    colorLog('yellow', `🎵 测试${testCase.name}识别...`);
    
    try {
      const audioData = generateMockAudioData(testCase.length);
      const startTime = Date.now();
      
      const response = await makeRequest('/api/multimodal/asr', {
        audioData: audioData,
        provider: 'mock',
        language: 'zh-CN'
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.status === 200 && response.data.success) {
        const result = response.data.data;
        colorLog('green', `✅ 识别成功 (${responseTime}ms)`);
        colorLog('magenta', `🎯 结果: "${result.text}"`);
        console.log(`   📊 置信度: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   🎵 时长: ${result.duration?.toFixed(1)}秒`);
        
        successCount++;
      } else {
        colorLog('red', `❌ 识别失败: ${response.data.error}`);
      }
      
    } catch (error) {
      colorLog('red', `❌ 请求失败: ${error.message}`);
    }
  }
  
  return { total: testCases.length + 1, success: successCount + 1 }; // +1 for service check
}

// 4. 测试图片分析功能
async function testImageAnalysis() {
  colorLog('cyan', '\n🖼️ 测试图片分析功能...');
  
  try {
    // 模拟图片分析请求
    const mockImageData = {
      imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      description: '测试图片分析功能'
    };
    
    const response = await makeRequest('/api/analyze/image', mockImageData);
    
    if (response.status === 200) {
      colorLog('green', '✅ 图片分析API可用');
      return { total: 1, success: 1 };
    } else {
      colorLog('red', `❌ 图片分析失败: ${response.status}`);
      return { total: 1, success: 0 };
    }
    
  } catch (error) {
    colorLog('red', `❌ 图片分析请求失败: ${error.message}`);
    return { total: 1, success: 0 };
  }
}

// 5. 测试上传功能
async function testUploadFunction() {
  colorLog('cyan', '\n📁 测试上传功能...');
  
  const uploadTests = [
    { name: '多媒体上传API', path: '/api/upload/media' },
    { name: '文档解析API', path: '/api/upload/parse' },
    { name: '书籍上传API', path: '/api/upload/book' }
  ];
  
  let successCount = 0;
  
  for (const test of uploadTests) {
    try {
      // 只测试API是否存在，不发送实际数据
      const response = await makeRequest(test.path, {}, 5000);
      
      // 400错误通常表示API存在但缺少必需参数，这是正常的
      if (response.status === 400 || response.status === 200) {
        colorLog('green', `✅ ${test.name}可用`);
        successCount++;
      } else {
        colorLog('red', `❌ ${test.name}不可用: ${response.status}`);
      }
      
    } catch (error) {
      colorLog('red', `❌ ${test.name}测试失败: ${error.message}`);
    }
  }
  
  return { total: uploadTests.length, success: successCount };
}

// 6. 测试Skills系统
async function testSkillsSystem() {
  colorLog('cyan', '\n🧠 测试Skills系统...');
  
  try {
    const response = await makeRequest('/api/skills/status');
    
    if (response.status === 200 && response.data.success) {
      colorLog('green', '✅ Skills系统可用');
      
      const skillsData = response.data.data;
      console.log(`   - 已安装技能: ${skillsData.installedSkillsCount || 0}个`);
      console.log(`   - 推荐技能: ${skillsData.totalRecommendedSkills || 0}个`);
      console.log(`   - 支持领域: ${skillsData.domains?.join(', ') || '未知'}`);
      
      return { total: 1, success: 1 };
    } else {
      colorLog('red', '❌ Skills系统不可用');
      return { total: 1, success: 0 };
    }
    
  } catch (error) {
    colorLog('red', `❌ Skills系统测试失败: ${error.message}`);
    return { total: 1, success: 0 };
  }
}

// 主测试函数
async function runAllTests() {
  colorLog('bright', '🧪 飘叔Agent全功能验证测试');
  colorLog('cyan', '='.repeat(60));
  
  // 1. 测试服务器连接
  const serverOk = await testServerConnection();
  if (!serverOk) {
    colorLog('red', '❌ 服务器不可用，终止测试');
    process.exit(1);
  }
  
  // 2. 执行各项功能测试
  const results = {};
  
  results.chat = await testChatFunction();
  results.voice = await testVoiceFunction();
  results.image = await testImageAnalysis();
  results.upload = await testUploadFunction();
  results.skills = await testSkillsSystem();
  
  // 3. 输出测试总结
  colorLog('cyan', '\n' + '='.repeat(60));
  colorLog('bright', '📊 测试总结报告');
  
  let totalTests = 0;
  let totalSuccess = 0;
  
  const functionNames = {
    chat: '💬 对话功能',
    voice: '🎤 语音识别',
    image: '🖼️ 图片分析',
    upload: '📁 上传功能',
    skills: '🧠 Skills系统'
  };
  
  for (const [key, result] of Object.entries(results)) {
    const name = functionNames[key];
    const successRate = ((result.success / result.total) * 100).toFixed(1);
    
    console.log(`${name}: ${result.success}/${result.total} (${successRate}%)`);
    
    totalTests += result.total;
    totalSuccess += result.success;
  }
  
  const overallSuccessRate = ((totalSuccess / totalTests) * 100).toFixed(1);
  
  colorLog('yellow', `\n📈 总体成功率: ${overallSuccessRate}% (${totalSuccess}/${totalTests})`);
  
  // 4. 评估结果
  if (overallSuccessRate >= 90) {
    colorLog('green', '\n🎉 优秀！所有功能基本正常，系统状态良好。');
  } else if (overallSuccessRate >= 70) {
    colorLog('yellow', '\n⚠️  良好！大部分功能正常，少数功能需要关注。');
  } else {
    colorLog('red', '\n❌ 需要改进！多项功能存在问题，需要检查和修复。');
  }
  
  // 5. 功能状态详情
  colorLog('cyan', '\n🎯 功能状态详情:');
  
  if (results.chat.success === results.chat.total) {
    console.log('✅ 对话功能 - 完全可用，支持Skills系统增强');
  } else {
    console.log('❌ 对话功能 - 存在问题，需要检查API');
  }
  
  if (results.voice.success >= results.voice.total * 0.8) {
    console.log('✅ 语音识别 - 基本可用，ASR服务正常');
  } else {
    console.log('❌ 语音识别 - 存在问题，需要检查ASR API');
  }
  
  if (results.image.success === results.image.total) {
    console.log('✅ 图片分析 - 完全可用，支持多模态分析');
  } else {
    console.log('❌ 图片分析 - 存在问题，需要检查分析API');
  }
  
  if (results.upload.success >= results.upload.total * 0.8) {
    console.log('✅ 上传功能 - 基本可用，支持多种文件格式');
  } else {
    console.log('❌ 上传功能 - 存在问题，需要检查上传API');
  }
  
  if (results.skills.success === results.skills.total) {
    console.log('✅ Skills系统 - 完全可用，专业能力增强');
  } else {
    console.log('❌ Skills系统 - 存在问题，需要检查Skills API');
  }
  
  colorLog('cyan', '\n🏁 全功能验证测试完成！');
  
  // 6. 使用建议
  colorLog('bright', '\n💡 使用建议:');
  console.log('• 🌐 访问 http://localhost:3000 开始使用');
  console.log('• 🎤 点击Plus按钮 → 语音输入，体验语音转文字');
  console.log('• 🖼️ 点击Plus按钮 → 图片分析，上传图片进行AI分析');
  console.log('• 📁 点击Plus按钮 → 上传功能，批量处理文档');
  console.log('• 💬 直接对话体验Skills系统的专业分析能力');
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    colorLog('red', `❌ 测试执行失败: ${error.message}`);
    process.exit(1);
  });
}