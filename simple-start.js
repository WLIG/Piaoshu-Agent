// 简化启动脚本
const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 启动飘叔Agent服务器...\n');

// 启动Next.js开发服务器
const server = spawn('npx', ['next', 'dev', '-p', '3000'], {
  stdio: 'pipe',
  shell: true
});

let startupComplete = false;

// 监听服务器输出
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // 检查是否启动完成
  if (output.includes('Ready') || output.includes('started server') || output.includes('Local:')) {
    if (!startupComplete) {
      startupComplete = true;
      console.log('\n✅ 服务器启动成功！');
      console.log('🌐 访问地址: http://localhost:3000');
      console.log('\n🎯 功能体验指南:');
      console.log('1. 💬 对话功能 - 直接输入问题体验Skills系统');
      console.log('2. 🎤 语音输入 - 点击Plus按钮 → 语音输入');
      console.log('3. 🖼️ 图片分析 - 点击Plus按钮 → 图片分析');
      console.log('4. 📁 上传功能 - 点击Plus按钮 → 上传功能');
      console.log('\n🎉 飘叔Agent已准备就绪！按Ctrl+C停止服务器');
    }
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('warn') && !error.includes('Warning')) {
    console.error('❌ 错误:', error);
  }
});

server.on('close', (code) => {
  console.log(`\n服务器已停止 (退出码: ${code})`);
});

// 处理Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止服务器...');
  server.kill();
  process.exit(0);
});

// 超时检查
setTimeout(() => {
  if (!startupComplete) {
    console.log('\n⏰ 启动时间较长，请耐心等待...');
    console.log('💡 如果长时间无响应，请按Ctrl+C停止并检查错误');
  }
}, 30000);