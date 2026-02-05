const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 飘叔Agent 快速部署开始...\n');

try {
  // 1. 检查关键文件
  console.log('📋 检查项目文件...');
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'src/app/page.tsx',
    'src/app/layout.tsx'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      console.log(`❌ 缺少文件: ${file}`);
      process.exit(1);
    }
  }
  console.log('✅ 关键文件检查通过');

  // 2. 创建vercel.json
  console.log('📝 创建Vercel配置...');
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/next"
      }
    ],
    "functions": {
      "src/app/api/**/*.ts": {
        "maxDuration": 30
      }
    }
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ vercel.json 已创建');

  // 3. 创建.env.production
  console.log('🔧 创建生产环境配置...');
  const prodEnv = `DATABASE_URL="file:./db/production.db"
Z_AI_API_KEY="demo_key"
Z_AI_BASE_URL="https://api.z.ai/v1"
OPENAI_API_KEY="demo_key"
NEXTAUTH_SECRET="production_secret_key_change_this"
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://piaoshu-agent.vercel.app"`;
  
  fs.writeFileSync('.env.production', prodEnv);
  console.log('✅ .env.production 已创建');

  // 4. 更新package.json构建脚本
  console.log('📦 更新构建脚本...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  packageJson.scripts['vercel:build'] = 'prisma generate && next build';
  packageJson.scripts['postinstall'] = 'prisma generate';
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json 已更新');

  // 5. Git操作
  console.log('📤 准备Git推送...');
  
  try {
    execSync('git init', { stdio: 'inherit' });
  } catch (e) {
    // Git已初始化
  }
  
  try {
    execSync('git remote remove origin', { stdio: 'pipe' });
  } catch (e) {
    // 远程仓库不存在
  }
  
  execSync('git remote add origin https://github.com/WLIG/Piaoshu-Agent.git', { stdio: 'inherit' });
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "feat: 飘叔Agent部署版本 - 修复构建问题"', { stdio: 'inherit' });
  execSync('git push -u origin main --force', { stdio: 'inherit' });
  
  console.log('\n🎉 部署准备完成!');
  console.log('🔗 GitHub仓库: https://github.com/WLIG/Piaoshu-Agent.git');
  console.log('🚀 Vercel部署: https://vercel.com/wligs-projects');
  console.log('\n📋 Vercel部署步骤:');
  console.log('1. 访问 https://vercel.com/wligs-projects');
  console.log('2. 点击 "New Project"');
  console.log('3. 选择 "WLIG/Piaoshu-Agent" 仓库');
  console.log('4. 点击 "Deploy"');
  console.log('\n🌟 飘叔Agent即将在云端服务!');

} catch (error) {
  console.error('❌ 部署过程中出现错误:', error.message);
  console.log('\n🔧 手动部署步骤:');
  console.log('1. 确保所有文件都在项目中');
  console.log('2. 手动推送到GitHub');
  console.log('3. 在Vercel中导入项目');
  process.exit(1);
}