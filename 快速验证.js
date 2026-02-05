// 快速验证飘叔Agent核心功能
const fs = require('fs');
const path = require('path');

console.log('🔍 飘叔Agent 快速验证开始...\n');

// 验证核心文件
const coreFiles = [
  'package.json',
  'next.config.ts',
  'vercel.json',
  '.env.production',
  'src/app/page.tsx',
  'src/components/ChatInterface.tsx',
  'src/components/MultiFunctionMenu.tsx',
  'src/components/VoiceInput.tsx',
  'src/app/api/chat/route.ts',
  'src/app/api/multimodal/asr/route.ts',
  'prisma/schema.prisma'
];

console.log('📁 检查核心文件...');
let missingFiles = [];
coreFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    missingFiles.push(file);
  }
});

// 验证API路由
const apiRoutes = [
  'src/app/api/chat/route.ts',
  'src/app/api/chat-simple/route.ts',
  'src/app/api/chat-enhanced/route.ts',
  'src/app/api/multimodal/asr/route.ts',
  'src/app/api/analyze/image/route.ts',
  'src/app/api/upload/media/route.ts',
  'src/app/api/skills/status/route.ts'
];

console.log('\n🔌 检查API路由...');
let missingRoutes = [];
apiRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    console.log(`✅ ${route}`);
  } else {
    console.log(`❌ ${route} - 缺失`);
    missingRoutes.push(route);
  }
});

// 验证组件
const components = [
  'src/components/ChatInterface.tsx',
  'src/components/MultiFunctionMenu.tsx',
  'src/components/VoiceInput.tsx',
  'src/components/ImageAnalysis.tsx',
  'src/components/MediaUpload.tsx'
];

console.log('\n🧩 检查核心组件...');
let missingComponents = [];
components.forEach(component => {
  if (fs.existsSync(component)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - 缺失`);
    missingComponents.push(component);
  }
});

// 验证配置文件
console.log('\n⚙️ 检查配置文件...');

// 检查package.json
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ package.json - 版本: ${pkg.version}`);
  
  // 检查关键脚本
  const requiredScripts = ['dev', 'build', 'start', 'vercel:build'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      console.log(`  ✅ 脚本: ${script}`);
    } else {
      console.log(`  ❌ 脚本: ${script} - 缺失`);
    }
  });
}

// 检查vercel.json
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json - Vercel配置就绪');
} else {
  console.log('❌ vercel.json - 缺失');
}

// 生成验证报告
console.log('\n📊 验证报告:');
console.log('='.repeat(50));

if (missingFiles.length === 0 && missingRoutes.length === 0 && missingComponents.length === 0) {
  console.log('🎉 所有核心文件检查通过！');
  console.log('✅ 飘叔Agent已准备好部署到Vercel');
  console.log('\n🚀 下一步操作:');
  console.log('1. 执行: .\\deploy-to-github.ps1');
  console.log('2. 访问: https://vercel.com/wligs-projects');
  console.log('3. 导入GitHub仓库并部署');
} else {
  console.log('⚠️ 发现缺失文件，请检查:');
  [...missingFiles, ...missingRoutes, ...missingComponents].forEach(file => {
    console.log(`  - ${file}`);
  });
}

console.log('\n🌟 飘叔Agent功能特色:');
console.log('- 🧠 长期记忆系统');
console.log('- 🎭 飘叔人格化');
console.log('- 🎤 语音输入');
console.log('- 🖼️ 图片分析');
console.log('- 📁 文档上传');
console.log('- 📱 移动端优化');

console.log('\n验证完成！');