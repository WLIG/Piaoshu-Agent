// 语音输入功能测试脚本
const http = require('http');

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求函数
function makeRequest(path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
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
  const lengths = {
    short: 3000,
    medium: 10000,
    long: 20000
  };
  
  const targetLength = lengths[length] || lengths.medium;
  
  // 生成随机base64数据模拟音频
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  
  for (let i = 0; i < targetLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// 测试ASR服务状态
async function testASRStatus() {
  colorLog('cyan', '🔍 测试ASR服务状态...');
  
  try {
    const response = await makeRequest('/api/multimodal/asr');
    
    if (response.status === 200 && response.data.success) {
      colorLog('green', '✅ ASR服务运行正常');
      
      const serviceInfo = response.data.data;
      console.log(`📋 服务信息:`);
      console.log(`   - 服务: ${serviceInfo.service}`);
      console.log(`   - 版本: ${serviceInfo.version}`);
      console.log(`   - 状态: ${serviceInfo.status}`);
      console.log(`   - 可用提供商: ${serviceInfo.availableProviders?.join(', ')}`);
      console.log(`   - 默认提供商: ${serviceInfo.defaultProvider}`);
      console.log(`   - 支持语言: ${serviceInfo.supportedLanguages?.join(', ')}`);
      console.log(`   - 支持格式: ${serviceInfo.supportedFormats?.join(', ')}`);
      
      return true;
    } else {
      colorLog('red', `❌ ASR服务状态异常: ${response.status}`);
      return false;
    }
  } catch (error) {
    colorLog('red', `❌ 无法连接ASR服务: ${error.message}`);
    return false;
  }
}

// 测试语音识别功能
async function testVoiceRecognition() {
  colorLog('cyan', '\n🎤 测试语音识别功能...');
  
  const testCases = [
    { name: '短音频', length: 'short', expected: '简单问候' },
    { name: '中等音频', length: 'medium', expected: '一般问题' },
    { name: '长音频', length: 'long', expected: '复杂问题' }
  ];
  
  let successCount = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    colorLog('yellow', `\n📝 测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
    
    try {
      const audioData = generateMockAudioData(testCase.length);
      const startTime = Date.now();
      
      const response = await makeRequest('/api/multimodal/asr', {
        audioData: audioData,
        provider: 'mock',
        language: 'zh-CN'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.status === 200 && response.data.success) {
        const result = response.data.data;
        
        colorLog('green', `✅ 识别成功 (${responseTime}ms)`);
        colorLog('magenta', `🎯 识别结果: "${result.text}"`);
        console.log(`📊 置信度: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`🌐 语言: ${result.language}`);
        console.log(`⏱️  处理时间: ${result.processingTime}ms`);
        
        if (result.duration) {
          console.log(`🎵 音频时长: ${result.duration.toFixed(1)}秒`);
        }
        
        if (result.alternatives && result.alternatives.length > 0) {
          console.log(`🔄 备选结果:`);
          result.alternatives.forEach((alt, idx) => {
            console.log(`   ${idx + 1}. "${alt.text}" (${(alt.confidence * 100).toFixed(1)}%)`);
          });
        }
        
        successCount++;
      } else {
        colorLog('red', `❌ 识别失败: ${response.data.error || '未知错误'}`);
        if (response.data.suggestion) {
          colorLog('yellow', `💡 建议: ${response.data.suggestion}`);
        }
      }
      
    } catch (error) {
      colorLog('red', `❌ 请求失败: ${error.message}`);
    }
    
    // 添加延迟
    if (i < testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return { total: testCases.length, success: successCount };
}

// 测试错误处理
async function testErrorHandling() {
  colorLog('cyan', '\n🚨 测试错误处理...');
  
  const errorTests = [
    {
      name: '空音频数据',
      data: { audioData: '', provider: 'mock' },
      expectedError: 'Audio data is required'
    },
    {
      name: '无效音频数据',
      data: { audioData: 'invalid-base64-data', provider: 'mock' },
      expectedError: 'Invalid audio data format'
    },
    {
      name: '不支持的提供商',
      data: { audioData: generateMockAudioData('short'), provider: 'unsupported' },
      expectedError: null // 应该降级到mock
    }
  ];
  
  let errorHandlingScore = 0;
  
  for (let i = 0; i < errorTests.length; i++) {
    const test = errorTests[i];
    
    colorLog('yellow', `\n🧪 错误测试 ${i + 1}: ${test.name}`);
    
    try {
      const response = await makeRequest('/api/multimodal/asr', test.data);
      
      if (test.expectedError) {
        if (response.status >= 400 && response.data.error) {
          colorLog('green', `✅ 正确处理错误: ${response.data.error}`);
          errorHandlingScore++;
        } else {
          colorLog('red', `❌ 未正确处理错误，期望错误但得到成功响应`);
        }
      } else {
        if (response.status === 200 && response.data.success) {
          colorLog('green', `✅ 正确降级处理`);
          errorHandlingScore++;
        } else {
          colorLog('red', `❌ 降级处理失败`);
        }
      }
      
    } catch (error) {
      colorLog('red', `❌ 测试执行失败: ${error.message}`);
    }
  }
  
  return { total: errorTests.length, success: errorHandlingScore };
}

// 主测试函数
async function main() {
  colorLog('cyan', '🧪 语音输入功能完整测试');
  colorLog('cyan', '='.repeat(50));
  
  // 1. 测试ASR服务状态
  const serviceOk = await testASRStatus();
  if (!serviceOk) {
    colorLog('red', '❌ ASR服务不可用，终止测试');
    process.exit(1);
  }
  
  // 2. 测试语音识别功能
  const recognitionResult = await testVoiceRecognition();
  
  // 3. 测试错误处理
  const errorResult = await testErrorHandling();
  
  // 输出测试总结
  colorLog('cyan', '\n' + '='.repeat(50));
  colorLog('cyan', '📊 测试总结:');
  
  console.log(`🎤 语音识别: ${recognitionResult.success}/${recognitionResult.total} 成功`);
  console.log(`🚨 错误处理: ${errorResult.success}/${errorResult.total} 成功`);
  
  const totalTests = recognitionResult.total + errorResult.total;
  const totalSuccess = recognitionResult.success + errorResult.success;
  const successRate = ((totalSuccess / totalTests) * 100).toFixed(1);
  
  colorLog('yellow', `📈 总体成功率: ${successRate}%`);
  
  if (totalSuccess === totalTests) {
    colorLog('green', '\n🎉 所有测试通过！语音输入功能完全正常。');
  } else if (totalSuccess >= totalTests * 0.8) {
    colorLog('yellow', '\n⚠️  大部分测试通过，语音输入功能基本正常。');
  } else {
    colorLog('red', '\n❌ 多项测试失败，语音输入功能需要修复。');
  }
  
  colorLog('cyan', '\n✨ 语音输入功能特性:');
  console.log('• 🎯 智能语音识别 - 支持中文语音转文字');
  console.log('• 🔄 多提供商支持 - OpenAI、百度、阿里云等');
  console.log('• 📊 置信度评估 - 提供识别结果可信度');
  console.log('• 🚨 错误处理 - 完善的错误提示和降级机制');
  console.log('• ⚡ 实时处理 - 快速响应用户语音输入');
  
  colorLog('cyan', '\n🏁 语音输入功能测试完成！');
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `❌ 测试执行失败: ${error.message}`);
    process.exit(1);
  });
}