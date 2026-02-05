const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 开始诊断构建问题...\n');

// 检查基本环境
console.log('📋 环境检查:');
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log('✅ Node.js版本:', nodeVersion);
} catch (error) {
  console.log('❌ Node.js未安装');
}

try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log('✅ npm版本:', npmVersion);
} catch (error) {
  console.log('❌ npm未安装');
}

// 检查关键文件
console.log('\n📁 文件检查:');
const criticalFiles = [
  'package.json',
  'next.config.ts',
  'tsconfig.json',
  'src/app/layout.tsx',
  'src/app/page.tsx'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log('✅', file);
  } else {
    console.log('❌', file, '缺失');
  }
});

// 检查node_modules
console.log('\n📦 依赖检查:');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules存在');
  
  const criticalDeps = ['next', 'react', 'react-dom', 'typescript'];
  criticalDeps.forEach(dep => {
    if (fs.existsSync(path.join('node_modules', dep))) {
      console.log('✅', dep);
    } else {
      console.log('❌', dep, '缺失');
    }
  });
} else {
  console.log('❌ node_modules不存在，需要运行 npm install');
}

// 尝试TypeScript检查
console.log('\n🔧 TypeScript检查:');
try {
  execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ TypeScript检查通过');
} catch (error) {
  console.log('❌ TypeScript错误:');
  console.log(error.stdout || error.stderr);
}

console.log('\n🏗️ 尝试构建...');
try {
  const output = execSync('npx next build', { 
    encoding: 'utf8', 
    stdio: 'pipe',
    timeout: 60000
  });
  console.log('✅ 构建成功！');
  console.log(output);
} catch (error) {
  console.log('❌ 构建失败:');
  console.log('stdout:', error.stdout);
  console.log('stderr:', error.stderr);
}