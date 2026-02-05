/**
 * 飘叔Agent - 错误检查和修复脚本
 * 检查常见问题并提供修复建议
 */

const fs = require('fs');
const path = require('path');

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

const issues = [];
const fixes = [];

log('\n╔═══════════════════════════════════════════════════════╗', 'cyan');
log('║     飘叔Agent - 错误检查和修复                        ║', 'cyan');
log('╚═══════════════════════════════════════════════════════╝\n', 'cyan');

// 1. 检查环境变量配置
log('🔍 检查环境变量配置...', 'blue');

const envFiles = ['.env.local', '.env.production'];
const requiredEnvVars = [
  'DATABASE_URL',
  'DEEPSEEK_API_KEY',
  'NVIDIA_API_KEY',
  'NEXTAUTH_SECRET'
];

envFiles.forEach(envFile => {
  if (fs.existsSync(envFile)) {
    log(`✅ ${envFile} 存在`, 'green');
    
    const content = fs.readFileSync(envFile, 'utf-8');
    const missingVars = requiredEnvVars.filter(varName => 
      !content.includes(`${varName}=`) || content.includes(`${varName}=""`));
    
    if (missingVars.length > 0) {
      issues.push(`${envFile} 缺少或未配置: ${missingVars.join(', ')}`);
      log(`⚠️  ${envFile} 缺少配置: ${missingVars.join(', ')}`, 'yellow');
    } else {
      log(`✅ ${envFile} 配置完整`, 'green');
    }
  } else {
    issues.push(`${envFile} 文件不存在`);
    log(`❌ ${envFile} 不存在`, 'red');
    
    if (envFile === '.env.local' && fs.existsSync('.env.example')) {
      fixes.push(`复制 .env.example 到 .env.local: copy .env.example .env.local`);
    }
  }
});

// 2. 检查数据库文件
log('\n🔍 检查数据库配置...', 'blue');

const dbPath = 'db/custom.db';
if (fs.existsSync(dbPath)) {
  log(`✅ 数据库文件存在: ${dbPath}`, 'green');
} else {
  issues.push('数据库文件不存在');
  log(`⚠️  数据库文件不存在: ${dbPath}`, 'yellow');
  fixes.push('运行数据库初始化: npx prisma db push');
}

// 3. 检查Prisma配置
log('\n🔍 检查Prisma配置...', 'blue');

if (fs.existsSync('prisma/schema.prisma')) {
  log('✅ Prisma schema 存在', 'green');
} else {
  issues.push('Prisma schema 不存在');
  log('❌ Prisma schema 不存在', 'red');
}

if (fs.existsSync('node_modules/@prisma/client')) {
  log('✅ Prisma Client 已安装', 'green');
} else {
  issues.push('Prisma Client 未安装');
  log('⚠️  Prisma Client 未安装', 'yellow');
  fixes.push('安装 Prisma Client: npx prisma generate');
}

// 4. 检查关键依赖
log('\n🔍 检查关键依赖...', 'blue');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const criticalDeps = [
  '@prisma/client',
  'next',
  'react',
  'openai',
  'mammoth'
];

criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    log(`✅ ${dep} 已配置`, 'green');
  } else {
    issues.push(`缺少依赖: ${dep}`);
    log(`⚠️  缺少依赖: ${dep}`, 'yellow');
  }
});

// 5. 检查API路由文件
log('\n🔍 检查API路由文件...', 'blue');

const apiRoutes = [
  'src/app/api/chat/route.ts',
  'src/app/api/chat-simple/route.ts',
  'src/app/api/chat-enhanced/route.ts',
  'src/app/api/nvidia/chat/route.ts',
  'src/app/api/analyze/image/route.ts',
  'src/app/api/skills/status/route.ts'
];

apiRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    log(`✅ ${route}`, 'green');
  } else {
    issues.push(`API路由缺失: ${route}`);
    log(`❌ ${route} 不存在`, 'red');
  }
});

// 6. 检查前端页面文件
log('\n🔍 检查前端页面文件...', 'blue');

const pages = [
  'src/app/page.tsx',
  'src/app/simple/page.tsx',
  'src/app/complete/page.tsx',
  'src/app/demo/page.tsx',
  'src/app/admin/page.tsx'
];

pages.forEach(page => {
  if (fs.existsSync(page)) {
    log(`✅ ${page}`, 'green');
  } else {
    issues.push(`页面文件缺失: ${page}`);
    log(`❌ ${page} 不存在`, 'red');
  }
});

// 7. 检查组件文件
log('\n🔍 检查关键组件文件...', 'blue');

const components = [
  'src/components/ChatInterface.tsx',
  'src/components/VoiceInput.tsx',
  'src/components/MediaUpload.tsx',
  'src/components/MultiFunctionMenu.tsx'
];

components.forEach(component => {
  if (fs.existsSync(component)) {
    log(`✅ ${component}`, 'green');
  } else {
    issues.push(`组件文件缺失: ${component}`);
    log(`❌ ${component} 不存在`, 'red');
  }
});

// 8. 检查lib文件
log('\n🔍 检查核心库文件...', 'blue');

const libs = [
  'src/lib/db.ts',
  'src/lib/agent/llm.ts',
  'src/lib/nvidia-models-simple.ts',
  'src/lib/nvidia-models-enhanced.ts',
  'src/lib/skills/PiaoshuSkillsIntegration.ts'
];

libs.forEach(lib => {
  if (fs.existsSync(lib)) {
    log(`✅ ${lib}`, 'green');
  } else {
    issues.push(`库文件缺失: ${lib}`);
    log(`❌ ${lib} 不存在`, 'red');
  }
});

// 9. 检查TypeScript配置
log('\n🔍 检查TypeScript配置...', 'blue');

if (fs.existsSync('tsconfig.json')) {
  log('✅ tsconfig.json 存在', 'green');
  
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf-8'));
  if (tsconfig.compilerOptions?.paths) {
    log('✅ 路径别名已配置', 'green');
  } else {
    issues.push('TypeScript路径别名未配置');
    log('⚠️  路径别名未配置', 'yellow');
  }
} else {
  issues.push('tsconfig.json 不存在');
  log('❌ tsconfig.json 不存在', 'red');
}

// 10. 检查Next.js配置
log('\n🔍 检查Next.js配置...', 'blue');

if (fs.existsSync('next.config.ts') || fs.existsSync('next.config.js')) {
  log('✅ Next.js配置文件存在', 'green');
} else {
  issues.push('Next.js配置文件不存在');
  log('❌ Next.js配置文件不存在', 'red');
}

// 生成报告
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('📊 检查报告', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

if (issues.length === 0) {
  log('🎉 没有发现问题！系统配置正常。', 'green');
} else {
  log(`发现 ${issues.length} 个问题:\n`, 'yellow');
  issues.forEach((issue, index) => {
    log(`${index + 1}. ${issue}`, 'red');
  });
}

if (fixes.length > 0) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🔧 建议的修复步骤:', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  fixes.forEach((fix, index) => {
    log(`${index + 1}. ${fix}`, 'yellow');
  });
}

// 常见问题修复建议
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('💡 常见问题修复建议:', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

log('1. 如果数据库问题:', 'blue');
log('   npx prisma generate', 'white');
log('   npx prisma db push', 'white');
log('');

log('2. 如果依赖问题:', 'blue');
log('   npm install', 'white');
log('   或 npm install --force', 'white');
log('');

log('3. 如果环境变量问题:', 'blue');
log('   copy .env.example .env.local', 'white');
log('   然后编辑 .env.local 填入正确的API密钥', 'white');
log('');

log('4. 如果端口被占用:', 'blue');
log('   netstat -ano | findstr :3000', 'white');
log('   taskkill /PID <进程ID> /F', 'white');
log('');

log('5. 如果构建失败:', 'blue');
log('   删除 .next 文件夹', 'white');
log('   npm run build', 'white');
log('');

log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('检查完成！', 'green');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

// 返回退出码
process.exit(issues.length > 0 ? 1 : 0);
