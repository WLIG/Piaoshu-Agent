// Skills系统聊天功能测试脚本
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// HTTP请求函数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: options.timeout || 30000
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: { text: data }
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
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

const BASE_URL = 'http://localhost:3000';

// 测试消息列表
const testMessages = [
  {
    category: '区块链分析',
    message: '请分析一下DeFi协议的风险和机会',
    expectedDomains: ['blockchain', 'business']
  },
  {
    category: 'Web4.0前瞻',
    message: '用户主权在Web4.0时代的重要性如何体现？',
    expectedDomains: ['web4', 'business']
  },
  {
    category: '商业策略',
    message: '如何构建可持续的商业模式？',
    expectedDomains: ['business']
  },
  {
    category: 'AI技术',
    message: 'Transformer架构在大语言模型中的优势是什么？',
    expectedDomains: ['ai']
  },
  {
    category: '系统架构',
    message: '分布式系统的设计原则有哪些？',
    expectedDomains: ['architecture']
  },
  {
    category: '数据分析',
    message: '如何进行有效的市场趋势预测？',
    expectedDomains: ['data', 'business']
  },
  {
    category: '综合分析',
    message: '区块链技术在商业应用中的AI驱动创新有哪些？',
    expectedDomains: ['blockchain', 'business', 'ai']
  }
];

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

// 测试Skills系统集成的聊天API
async function testSkillsChat() {
  colorLog('cyan', '\n🚀 开始测试Skills系统集成的聊天功能...\n');
  
  let successCount = 0;
  let totalTests = testMessages.length;
  
  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    
    colorLog('blue', `\n📝 测试 ${i + 1}/${totalTests}: ${test.category}`);
    colorLog('yellow', `消息: ${test.message}`);
    
    try {
      const startTime = Date.now();
      
      // 调用聊天API
      const response = await makeRequest(`${BASE_URL}/api/chat`, {
        method: 'POST',
        body: {
          message: test.message,
          useSkills: true, // 启用Skills系统
          userId: 'test-user-skills'
        },
        timeout: 30000
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.status === 200 && response.data) {
        colorLog('green', `✅ 响应成功 (${responseTime}ms)`);
        
        // 检查响应内容
        const responseText = response.data.data?.message?.content || response.data.response || response.data.message || '';
        
        // 验证Skills系统特征
        const hasSkillsFeatures = 
          responseText.includes('专业分析') ||
          responseText.includes('基于') ||
          responseText.includes('技能模块') ||
          responseText.includes('置信度') ||
          responseText.includes('专业总结');
        
        if (hasSkillsFeatures) {
          colorLog('green', '🎯 检测到Skills系统增强特征');
          successCount++;
        } else {
          colorLog('yellow', '⚠️  未检测到明显的Skills系统特征');
        }
        
        // 显示响应摘要
        const summary = responseText.substring(0, 150) + (responseText.length > 150 ? '...' : '');
        colorLog('magenta', `响应摘要: ${summary}`);
        
        // 显示响应长度和质量指标
        colorLog('cyan', `响应长度: ${responseText.length} 字符`);
        
      } else {
        colorLog('red', `❌ 响应异常: ${response.status}`);
      }
      
    } catch (error) {
      colorLog('red', `❌ 请求失败: ${error.message}`);
      
      if (error.response) {
        colorLog('red', `状态码: ${error.response.status}`);
        colorLog('red', `错误信息: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    // 添加延迟避免请求过快
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 输出测试总结
  colorLog('cyan', '\n📊 测试总结:');
  colorLog('green', `✅ 成功: ${successCount}/${totalTests}`);
  colorLog('red', `❌ 失败: ${totalTests - successCount}/${totalTests}`);
  colorLog('yellow', `📈 成功率: ${((successCount / totalTests) * 100).toFixed(1)}%`);
  
  if (successCount === totalTests) {
    colorLog('green', '\n🎉 所有测试通过！Skills系统聊天功能正常工作。');
  } else if (successCount > totalTests * 0.7) {
    colorLog('yellow', '\n⚠️  大部分测试通过，但有部分问题需要关注。');
  } else {
    colorLog('red', '\n❌ 测试失败较多，需要检查Skills系统集成。');
  }
}

// 测试Skills系统状态
async function testSkillsStatus() {
  colorLog('cyan', '\n🔍 检查Skills系统状态...');
  
  try {
    // 检查是否有Skills相关的API端点
    const response = await makeRequest(`${BASE_URL}/api/skills/status`, {
      timeout: 5000
    });
    
    if (response && response.status === 200) {
      colorLog('green', '✅ Skills系统API可用');
      console.log('Skills状态:', JSON.stringify(response.data, null, 2));
    } else {
      colorLog('yellow', '⚠️  Skills系统API不可用，将通过聊天API测试');
    }
  } catch (error) {
    colorLog('yellow', '⚠️  无法直接访问Skills状态，继续聊天测试');
  }
}

// 测试服务器连接
async function testServerConnection() {
  colorLog('cyan', '🔗 测试服务器连接...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/test-llm`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      colorLog('green', '✅ 服务器连接正常');
      return true;
    }
  } catch (error) {
    colorLog('red', `❌ 服务器连接失败: ${error.message}`);
    colorLog('yellow', '请确保服务器正在运行: npm run dev 或 npm start');
    return false;
  }
}

// 主测试函数
async function main() {
  colorLog('bright', '🧪 Skills系统聊天功能集成测试');
  colorLog('cyan', '=' .repeat(50));
  
  // 1. 测试服务器连接
  const serverOk = await testServerConnection();
  if (!serverOk) {
    process.exit(1);
  }
  
  // 2. 检查Skills系统状态
  await testSkillsStatus();
  
  // 3. 执行聊天功能测试
  await testSkillsChat();
  
  colorLog('cyan', '\n' + '='.repeat(50));
  colorLog('bright', '测试完成！');
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `\n❌ 测试执行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testSkillsChat,
  testSkillsStatus,
  testServerConnection
};