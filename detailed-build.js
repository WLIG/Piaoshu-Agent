const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 详细构建诊断\n');

// 1. 检查环境
console.log('1. 检查 Node 版本:');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`   Node: ${nodeVersion.trim()}`);
} catch (e) {
  console.log('   ❌ 无法获取 Node 版本');
}

console.log('\n2. 检查 npm 版本:');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`   npm: ${npmVersion.trim()}`);
} catch (e) {
  console.log('   ❌ 无法获取 npm 版本');
}

// 2. 检查关键文件
console.log('\n3. 检查关键文件:');
const files = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✓' : '✗'} ${file}`);
});

// 3. 检查 node_modules
console.log('\n4. 检查依赖:');
const nmExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log(`   node_modules: ${nmExists ? '存在' : '不存在'}`);

if (nmExists) {
  const nextExists = fs.existsSync(path.join(__dirname, 'node_modules', 'next'));
  console.log(`   next 包: ${nextExists ? '已安装' : '未安装'}`);
}

// 4. 清理并尝试构建
console.log('\n5. 清理旧构建:');
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('   ✓ .next 目录已清理');
} else {
  console.log('   ✓ .next 目录不存在');
}

// 5. 运行构建并捕获输出
console.log('\n6. 开始构建:');
console.log('=' .repeat(60));

try {
  const output = execSync('npm run build', {
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 10 * 1024 * 1024
  });
  console.log(output);
  console.log('=' .repeat(60));
  console.log('\n✅ 构建成功！');
} catch (error) {
  console.log('=' .repeat(60));
  console.log('\n❌ 构建失败！\n');
  console.log('错误输出:');
  console.log(error.stdout || '');
  console.log(error.stderr || '');
  console.log('\n错误信息:', error.message);
  process.exit(1);
}
