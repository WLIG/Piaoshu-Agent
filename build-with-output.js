const { spawn } = require('child_process');

console.log('🚀 开始构建...\n');

const build = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

build.on('error', (error) => {
  console.error('❌ 构建进程错误:', error);
  process.exit(1);
});

build.on('close', (code) => {
  console.log(`\n构建进程退出，代码: ${code}`);
  if (code === 0) {
    console.log('✅ 构建成功！');
  } else {
    console.log('❌ 构建失败！');
  }
  process.exit(code);
});
