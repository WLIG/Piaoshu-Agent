// 简化的Skills系统测试
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

// 简单的HTTP请求函数
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

// 测试消息
const testMessages = [
  '你好，我想了解区块链技术',
  '请分析一下Web4.0的发展前景',
  '如何构建可持续的商业模式？'
];

async function testBasicChat() {
  colorLog('cyan', '🚀 开始测试基础聊天功能...\n');
  
  let successCount = 0;
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    
    colorLog('yellow', `测试 ${i + 1}: ${message}`);
    
    try {
      const startTime = Date.now();
      
      const response = await makeRequest('/api/chat-simple', {
        message: message,
        useSkills: true,
        userId: 'test-user'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.status === 200) {
        colorLog('green', `✅ 响应成功 (${responseTime}ms)`);
        
        // 检查响应内容
        const responseData = response.data;
        if (responseData.success && responseData.data && responseData.data.message) {
          const content = responseData.data.message.content;
          colorLog('magenta', `响应: ${content.substring(0, 100)}...`);
          successCount++;
        } else {
          colorLog('red', '❌ 响应格式异常');
          console.log('响应数据:', JSON.stringify(responseData, null, 2));
        }
      } else {
        colorLog('red', `❌ HTTP错误: ${response.status}`);
      }
      
    } catch (error) {
      colorLog('red', `❌ 请求失败: ${error.message}`);
    }
    
    // 添加延迟
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 输出结果
  colorLog('cyan', `\n📊 测试结果: ${successCount}/${testMessages.length} 成功`);
  
  if (successCount === testMessages.length) {
    colorLog('green', '🎉 所有测试通过！');
  } else {
    colorLog('yellow', '⚠️  部分测试失败，需要检查服务器状态');
  }
}

async function testServerStatus() {
  colorLog('cyan', '🔍 检查服务器状态...');
  
  try {
    const response = await makeRequest('/api/test-llm');
    
    if (response.status === 200) {
      colorLog('green', '✅ 服务器运行正常');
      return true;
    } else {
      colorLog('red', `❌ 服务器状态异常: ${response.status}`);
      return false;
    }
  } catch (error) {
    colorLog('red', `❌ 无法连接服务器: ${error.message}`);
    colorLog('yellow', '请确保服务器正在运行在端口3000');
    return false;
  }
}

async function main() {
  colorLog('cyan', '🧪 Skills系统简化测试\n');
  
  // 1. 检查服务器状态
  const serverOk = await testServerStatus();
  if (!serverOk) {
    colorLog('red', '❌ 服务器未运行，请先启动服务器');
    process.exit(1);
  }
  
  // 2. 测试聊天功能
  await testBasicChat();
  
  colorLog('cyan', '\n✅ 测试完成！');
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `❌ 测试失败: ${error.message}`);
    process.exit(1);
  });
}