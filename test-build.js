const { spawn } = require('child_process');

console.log('开始构建测试...');

const build = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true
});

build.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 构建成功！');
  } else {
    console.log('❌ 构建失败，退出码:', code);
  }
});

build.on('error', (error) => {
  console.error('构建错误:', error);
});