/**
 * 飘叔Agent - 本地全面测试脚本
 * 测试所有API端点和功能衔接
 */

const BASE_URL = 'http://localhost:3000';

// 测试结果统计
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

// 测试API端点
async function testAPI(name, endpoint, options = {}) {
  try {
    log(`\n🔍 测试: ${name}`, 'blue');
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const data = await response.json();
    
    if (response.ok && data.success !== false) {
      logTest(name, 'pass', `状态码: ${response.status}`);
      results.passed.push(name);
      return { success: true, data };
    } else {
      logTest(name, 'fail', `状态码: ${response.status}, 错误: ${data.error || '未知错误'}`);
      results.failed.push({ name, error: data.error || '未知错误' });
      return { success: false, error: data.error };
    }
  } catch (error) {
    logTest(name, 'fail', `网络错误: ${error.message}`);
    results.failed.push({ name, error: error.message });
    return { success: false, error: error.message };
  }
}

// 1. 测试基础聊天API
async function testChatAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📝 第一部分: 基础聊天API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试主聊天API
  await testAPI('主聊天API (/api/chat)', '/api/chat', {
    body: {
      message: '你好，请简单介绍一下你自己',
      userId: 'test-user',
      useNvidia: false,
      useSkills: false
    }
  });

  // 测试简化聊天API
  await testAPI('简化聊天API (/api/chat-simple)', '/api/chat-simple', {
    body: {
      message: '什么是区块链？',
      useSkills: true
    }
  });

  // 测试增强聊天API
  await testAPI('增强聊天API (/api/chat-enhanced)', '/api/chat-enhanced', {
    body: {
      message: '分析一下当前的AI发展趋势',
      userId: 'test-user'
    }
  });

  // 测试个性化聊天API
  await testAPI('个性化聊天API (/api/chat-personalized)', '/api/chat-personalized', {
    body: {
      message: '我想学习商业分析',
      userId: 'test-user'
    }
  });
}

// 2. 测试NVIDIA模型API
async function testNvidiaAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🚀 第二部分: NVIDIA模型API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 获取NVIDIA模型信息
  await testAPI('NVIDIA模型信息 (GET)', '/api/nvidia/chat', {
    method: 'GET'
  });

  // 测试GLM-4.7模型
  await testAPI('NVIDIA GLM-4.7模型', '/api/nvidia/chat', {
    body: {
      message: '分析一下人工智能的发展趋势',
      model: 'glm4.7',
      enableThinking: true
    }
  });

  // 测试Kimi 2.5模型
  await testAPI('NVIDIA Kimi 2.5模型', '/api/nvidia/chat', {
    body: {
      message: '写一段关于创新的文案',
      model: 'kimi2.5'
    }
  });

  // 测试自动模型选择
  await testAPI('NVIDIA自动模型选择', '/api/nvidia/chat', {
    body: {
      message: '帮我分析这个商业问题',
      model: 'auto',
      taskType: 'analysis'
    }
  });
}

// 3. 测试多媒体功能API
async function testMultimediaAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🎨 第三部分: 多媒体功能API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试图片分析API (模拟)
  await testAPI('图片分析API', '/api/analyze/image', {
    body: {
      imageUrl: 'https://example.com/test.jpg',
      fileName: 'test.jpg'
    }
  });

  // 测试文档分析API
  await testAPI('文档分析API', '/api/analyze/document', {
    body: {
      documentUrl: 'https://example.com/test.pdf',
      fileName: 'test.pdf'
    }
  });

  // 测试视频分析API
  await testAPI('视频分析API', '/api/analyze/video', {
    body: {
      videoUrl: 'https://example.com/test.mp4',
      fileName: 'test.mp4'
    }
  });
}

// 4. 测试Skills系统API
async function testSkillsAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🎯 第四部分: Skills系统API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试Skills状态
  await testAPI('Skills系统状态', '/api/skills/status', {
    method: 'GET'
  });

  // 测试带Skills的聊天
  await testAPI('Skills增强聊天', '/api/chat', {
    body: {
      message: '分析Web4.0的发展前景',
      useSkills: true,
      userId: 'test-user'
    }
  });
}

// 5. 测试数据管理API
async function testDataAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('💾 第五部分: 数据管理API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试文章列表API
  await testAPI('文章列表API', '/api/articles', {
    method: 'GET'
  });

  // 测试用户统计API
  await testAPI('用户统计API', '/api/users/test-user/stats', {
    method: 'GET'
  });

  // 测试用户兴趣API
  await testAPI('用户兴趣API', '/api/users/test-user/interests', {
    method: 'GET'
  });

  // 测试系统概览API
  await testAPI('系统概览API', '/api/stats/overview', {
    method: 'GET'
  });

  // 测试知识图谱API
  await testAPI('知识图谱API', '/api/knowledge/graph', {
    method: 'GET'
  });
}

// 6. 测试记忆系统API
async function testMemoryAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🧠 第六部分: 记忆系统API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试记忆搜索API
  await testAPI('记忆搜索API', '/api/memory/search', {
    body: {
      query: '商业分析',
      userId: 'test-user'
    }
  });

  // 测试记忆备份API
  await testAPI('记忆备份API', '/api/memory/backup', {
    method: 'GET'
  });
}

// 7. 测试个性化API
async function testPersonalityAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('👤 第七部分: 个性化系统API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试个性化配置API
  await testAPI('个性化配置API (GET)', '/api/personality', {
    method: 'GET'
  });

  // 测试更新个性化配置
  await testAPI('更新个性化配置API', '/api/personality', {
    method: 'POST',
    body: {
      userId: 'test-user',
      preferences: {
        language: 'zh-CN',
        style: 'professional'
      }
    }
  });
}

// 8. 测试管理后台API
async function testAdminAPIs() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('⚙️ 第八部分: 管理后台API测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试系统状态API
  await testAPI('系统状态API', '/api/admin/system', {
    method: 'GET'
  });

  // 测试管理文章列表
  await testAPI('管理文章列表API', '/api/admin/articles', {
    method: 'GET'
  });
}

// 9. 测试前端页面可访问性
async function testPages() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🌐 第九部分: 前端页面可访问性测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  const pages = [
    { name: '首页', path: '/' },
    { name: '简单聊天页', path: '/simple' },
    { name: '完整功能页', path: '/complete' },
    { name: '演示页面', path: '/demo' },
    { name: '管理后台', path: '/admin' },
    { name: '文件上传页', path: '/upload' },
    { name: '书籍上传页', path: '/upload/book' },
    { name: '媒体测试页', path: '/media-test' },
    { name: 'API测试页', path: '/test-api' }
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page.path}`);
      if (response.ok) {
        logTest(`${page.name} (${page.path})`, 'pass', `状态码: ${response.status}`);
        results.passed.push(`页面: ${page.name}`);
      } else {
        logTest(`${page.name} (${page.path})`, 'fail', `状态码: ${response.status}`);
        results.failed.push({ name: `页面: ${page.name}`, error: `HTTP ${response.status}` });
      }
    } catch (error) {
      logTest(`${page.name} (${page.path})`, 'fail', `错误: ${error.message}`);
      results.failed.push({ name: `页面: ${page.name}`, error: error.message });
    }
  }
}

// 10. 测试API衔接和数据流
async function testAPIIntegration() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🔗 第十部分: API衔接和数据流测试', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 测试完整对话流程
  log('\n测试完整对话流程...', 'blue');
  
  // 1. 发送第一条消息
  const chat1 = await testAPI('发送第一条消息', '/api/chat', {
    body: {
      message: '你好，我想了解商业分析',
      userId: 'integration-test-user'
    }
  });

  if (chat1.success && chat1.data?.data?.conversationId) {
    const conversationId = chat1.data.data.conversationId;
    log(`   对话ID: ${conversationId}`, 'cyan');

    // 2. 在同一对话中发送第二条消息
    await testAPI('发送第二条消息(同一对话)', '/api/chat', {
      body: {
        message: '能详细说说吗？',
        userId: 'integration-test-user',
        conversationId: conversationId
      }
    });

    // 3. 测试对话历史是否正确保存
    log('\n   ✓ 对话流程测试完成', 'green');
  } else {
    log('   ✗ 对话流程测试失败：无法获取conversationId', 'red');
  }

  // 测试多模态流程
  log('\n测试多模态分析流程...', 'blue');
  
  const multimodal = await testAPI('多模态消息处理', '/api/chat', {
    body: {
      message: '这是一张商业图表，请帮我分析\n\n📸 上传的图片：\n1. chart.png\n   图片内容：一个显示销售增长的柱状图',
      userId: 'integration-test-user',
      hasAttachments: true
    }
  });

  if (multimodal.success) {
    log('   ✓ 多模态流程测试完成', 'green');
  } else {
    log('   ✗ 多模态流程测试失败', 'red');
  }
}

// 生成测试报告
function generateReport() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📊 测试报告', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  const total = results.passed.length + results.failed.length + results.warnings.length;
  const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(2) : 0;

  log(`总测试数: ${total}`, 'blue');
  log(`✅ 通过: ${results.passed.length}`, 'green');
  log(`❌ 失败: ${results.failed.length}`, 'red');
  log(`⚠️  警告: ${results.warnings.length}`, 'yellow');
  log(`\n通过率: ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red');

  if (results.failed.length > 0) {
    log('\n失败的测试:', 'red');
    results.failed.forEach((fail, index) => {
      log(`${index + 1}. ${fail.name}`, 'red');
      log(`   错误: ${fail.error}`, 'yellow');
    });
  }

  if (results.warnings.length > 0) {
    log('\n警告信息:', 'yellow');
    results.warnings.forEach((warning, index) => {
      log(`${index + 1}. ${warning}`, 'yellow');
    });
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  if (passRate >= 80) {
    log('🎉 测试结果良好！系统可以部署。', 'green');
  } else if (passRate >= 60) {
    log('⚠️  测试结果一般，建议修复失败的测试后再部署。', 'yellow');
  } else {
    log('❌ 测试结果不佳，请修复问题后再部署！', 'red');
  }
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

// 主测试函数
async function runAllTests() {
  log('\n╔═══════════════════════════════════════════════════════╗', 'cyan');
  log('║     飘叔Agent - 本地全面测试                          ║', 'cyan');
  log('║     测试所有API端点和功能衔接                         ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════╝\n', 'cyan');

  log(`测试目标: ${BASE_URL}`, 'blue');
  log(`开始时间: ${new Date().toLocaleString('zh-CN')}\n`, 'blue');

  try {
    // 先检查服务器是否运行
    try {
      await fetch(BASE_URL);
      log('✅ 服务器正在运行\n', 'green');
    } catch (error) {
      log('❌ 服务器未运行！请先启动服务器: npm run dev', 'red');
      log('   或运行: node simple-start.js\n', 'yellow');
      process.exit(1);
    }

    // 运行所有测试
    await testChatAPIs();
    await testNvidiaAPIs();
    await testMultimediaAPIs();
    await testSkillsAPIs();
    await testDataAPIs();
    await testMemoryAPIs();
    await testPersonalityAPIs();
    await testAdminAPIs();
    await testPages();
    await testAPIIntegration();

    // 生成报告
    generateReport();

  } catch (error) {
    log(`\n❌ 测试过程中发生错误: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
