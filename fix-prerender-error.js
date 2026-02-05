const fs = require('fs');
const path = require('path');

console.log('🔧 修复预渲染错误...\n');

// 需要禁用静态生成的测试页面
const testPages = [
  'src/app/test-api/page.tsx',
  'src/app/media-test/page.tsx',
  'src/app/chat-test/page.tsx',
  'src/app/demo/page.tsx',
  'src/app/simple/page.tsx',
  'src/app/complete/page.tsx',
  'src/app/minimal/page.tsx',
];

console.log('添加 dynamic = "force-dynamic" 到测试页面...\n');

testPages.forEach(pagePath => {
  const fullPath = path.join(__dirname, pagePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 检查是否已经有 dynamic export
    if (!content.includes('export const dynamic')) {
      // 在 'use client' 后添加
      if (content.includes("'use client'")) {
        content = content.replace(
          /'use client';/,
          "'use client';\n\n// 禁用静态生成\nexport const dynamic = 'force-dynamic';"
        );
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ 已修复: ${pagePath}`);
      } else {
        console.log(`⚠️  跳过: ${pagePath} (不是客户端组件)`);
      }
    } else {
      console.log(`✓ 已存在: ${pagePath}`);
    }
  } else {
    console.log(`⚠️  不存在: ${pagePath}`);
  }
});

console.log('\n✅ 预渲染错误修复完成！');
console.log('\n现在可以运行构建了');
