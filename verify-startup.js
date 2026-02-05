// 简单的启动验证脚本
const http = require('http');

function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function waitForServer() {
  console.log('🚀 等待服务器启动...');
  
  for (let i = 0; i < 12; i++) { // 最多等待60秒
    const isRunning = await checkServer();
    
    if (isRunning) {
      console.log('✅ 服务器启动成功！');
      console.log('🌐 访问地址: http://localhost:3000');
      console.log('');
      console.log('🎯 现在你可以：');
      console.log('1. 打开浏览器访问 http://localhost:3000');
      console.log('2. 体验对话功能 - 直接输入问题');
      console.log('3. 体验语音功能 - 点击Plus按钮 → 语音输入');
      console.log('4. 体验图片分析 - 点击Plus按钮 → 图片分析');
      console.log('5. 体验上传功能 - 点击Plus按钮 → 上传功能');
      console.log('');
      console.log('🎉 飘叔Agent已准备就绪！');
      return;
    }
    
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log('\n❌ 服务器启动超时');
  console.log('💡 请手动检查服务器状态');
}

waitForServer();