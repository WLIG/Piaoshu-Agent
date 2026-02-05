const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 直接运行 Next.js 构建\n');

// 清理
const nextDir = path.join(__dirname, '.next');
if (fs.existsSync(nextDir)) {
  console.log('清理 .next 目录...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

console.log('开始构建...\n');
console.log('='.repeat(60));

try {
  const output = execSync('npx next build', {
    encoding: 'utf8',
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('='.repeat(60));
  console.log('\n✅ 构建成功！');
} catch (error) {
  console.log('='.repeat(60));
  console.log('\n❌ 构建失败！');
  console.log('退出代码:', error.status);
  process.exit(1);
}
