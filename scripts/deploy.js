const { execSync } = require('child_process');

console.log('🚀 开始部署准备...');

try {
  // 生成Prisma客户端
  console.log('📦 生成Prisma客户端...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 运行数据库推送
  console.log('🗄️ 推送数据库架构...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  console.log('✅ 部署准备完成！');
} catch (error) {
  console.error('❌ 部署准备失败:', error.message);
  process.exit(1);
}