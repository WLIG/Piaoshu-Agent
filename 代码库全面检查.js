// 代码库全面检查脚本
const fs = require('fs');
const path = require('path');

console.log('🔍 开始全面检查代码库...\n');

// 检查项目结构
const checkProjectStructure = () => {
  console.log('📁 检查项目结构:');
  
  const requiredDirs = [
    'src/app',
    'src/components',
    'src/lib',
    'src/app/api',
    'prisma'
  ];
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir}`);
    } else {
      console.log(`❌ ${dir} - 缺失`);
    }
  });
  console.log('');
};

// 检查页面文件
const checkPages = () => {
  console.log('📄 检查页面文件:');
  
  const pages = [
    'src/app/page.tsx',
    'src/app/simple/page.tsx',
    'src/app/complete/page.tsx',
    'src/app/chat-test/page.tsx',
    'src/app/layout.tsx'
  ];
  
  pages.forEach(page => {
    if (fs.existsSync(page)) {
      const content = fs.readFileSync(page, 'utf8');
      const lines = content.split('\n').length;
      console.log(`✅ ${page} (${lines} 行)`);
    } else {
      console.log(`❌ ${page} - 缺失`);
    }
  });
  console.log('');
};

// 检查API路由
const checkAPIRoutes = () => {
  console.log('🔌 检查API路由:');
  
  const apiRoutes = [
    'src/app/api/chat/route.ts',
    'src/app/api/chat-simple/route.ts',
    'src/app/api/chat-enhanced/route.ts',
    'src/app/api/multimodal/asr/route.ts',
    'src/app/api/analyze/image/route.ts',
    'src/app/api/upload/media/route.ts'
  ];
  
  apiRoutes.forEach(route => {
    if (fs.existsSync(route)) {
      console.log(`✅ ${route}`);
    } else {
      console.log(`❌ ${route} - 缺失`);
    }
  });
  console.log('');
};

// 检查核心组件
const checkComponents = () => {
  console.log('🧩 检查核心组件:');
  
  const components = [
    'src/components/ChatInterface.tsx',
    'src/components/MultiFunctionMenu.tsx',
    'src/components/VoiceInput.tsx',
    'src/components/MediaUpload.tsx',
    'src/components/ImageAnalysis.tsx'
  ];
  
  components.forEach(component => {
    if (fs.existsSync(component)) {
      console.log(`✅ ${component}`);
    } else {
      console.log(`❌ ${component} - 缺失`);
    }
  });
  console.log('');
};

// 检查依赖问题
const checkDependencies = () => {
  console.log('📦 检查依赖配置:');
  
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // 检查是否移除了问题依赖
    if (pkg.dependencies['@mdxeditor/editor']) {
      console.log('⚠️  @mdxeditor/editor 仍然存在 - 建议移除');
    } else {
      console.log('✅ @mdxeditor/editor 已移除');
    }
    
    // 检查关键依赖
    const keyDeps = ['next', 'react', 'tailwindcss', 'prisma', 'lucide-react'];
    keyDeps.forEach(dep => {
      if (pkg.dependencies[dep] || pkg.devDependencies?.[dep]) {
        console.log(`✅ ${dep}`);
      } else {
        console.log(`❌ ${dep} - 缺失`);
      }
    });
  }
  console.log('');
};

// 检查配置文件
const checkConfigFiles = () => {
  console.log('⚙️ 检查配置文件:');
  
  const configs = [
    'next.config.ts',
    'tailwind.config.ts',
    'tsconfig.json',
    'prisma/schema.prisma',
    '.env.local'
  ];
  
  configs.forEach(config => {
    if (fs.existsSync(config)) {
      console.log(`✅ ${config}`);
    } else {
      console.log(`❌ ${config} - 缺失`);
    }
  });
  console.log('');
};

// 生成功能清单
const generateFeatureList = () => {
  console.log('🌟 功能实现状态:');
  
  const features = [
    { name: '主页导航', file: 'src/app/page.tsx', status: fs.existsSync('src/app/page.tsx') },
    { name: '简化版聊天', file: 'src/app/simple/page.tsx', status: fs.existsSync('src/app/simple/page.tsx') },
    { name: '完整版聊天', file: 'src/app/complete/page.tsx', status: fs.existsSync('src/app/complete/page.tsx') },
    { name: '语音输入', file: 'src/components/VoiceInput.tsx', status: fs.existsSync('src/components/VoiceInput.tsx') },
    { name: '图片分析', file: 'src/app/api/analyze/image/route.ts', status: fs.existsSync('src/app/api/analyze/image/route.ts') },
    { name: '文档上传', file: 'src/app/api/upload/media/route.ts', status: fs.existsSync('src/app/api/upload/media/route.ts') },
    { name: 'Skills系统', file: 'src/lib/skills/PiaoshuSkillsIntegration.ts', status: fs.existsSync('src/lib/skills/PiaoshuSkillsIntegration.ts') },
    { name: '记忆系统', file: 'src/lib/memory/PiaoshuMemory.ts', status: fs.existsSync('src/lib/memory/PiaoshuMemory.ts') }
  ];
  
  features.forEach(feature => {
    console.log(`${feature.status ? '✅' : '❌'} ${feature.name}`);
  });
  console.log('');
};

// 部署就绪检查
const checkDeploymentReadiness = () => {
  console.log('🚀 部署就绪检查:');
  
  const checks = [
    { name: '无vercel.json冲突', check: !fs.existsSync('vercel.json') },
    { name: '移除问题依赖', check: !JSON.parse(fs.readFileSync('package.json', 'utf8')).dependencies['@mdxeditor/editor'] },
    { name: '主要页面存在', check: fs.existsSync('src/app/page.tsx') && fs.existsSync('src/app/simple/page.tsx') },
    { name: '基础API路由', check: fs.existsSync('src/app/api/chat-simple/route.ts') },
    { name: '配置文件完整', check: fs.existsSync('next.config.ts') && fs.existsSync('package.json') }
  ];
  
  let readyCount = 0;
  checks.forEach(check => {
    if (check.check) {
      console.log(`✅ ${check.name}`);
      readyCount++;
    } else {
      console.log(`❌ ${check.name}`);
    }
  });
  
  console.log(`\n📊 部署就绪度: ${readyCount}/${checks.length} (${Math.round(readyCount/checks.length*100)}%)`);
  
  if (readyCount === checks.length) {
    console.log('🎉 项目已完全准备好部署！');
  } else {
    console.log('⚠️  还有一些问题需要解决');
  }
  console.log('');
};

// 执行所有检查
const runAllChecks = () => {
  checkProjectStructure();
  checkPages();
  checkAPIRoutes();
  checkComponents();
  checkDependencies();
  checkConfigFiles();
  generateFeatureList();
  checkDeploymentReadiness();
  
  console.log('🎯 检查完成！');
  console.log('\n📋 建议的部署步骤:');
  console.log('1. git add -A');
  console.log('2. git commit -m "feat: 完整版功能和依赖优化"');
  console.log('3. git push origin main');
  console.log('4. 在Vercel中重新部署');
  console.log('\n🌐 预期访问地址:');
  console.log('- 主页: https://piaoshu-agent.vercel.app/');
  console.log('- 简化版: https://piaoshu-agent.vercel.app/simple');
  console.log('- 完整版: https://piaoshu-agent.vercel.app/complete');
};

// 运行检查
runAllChecks();