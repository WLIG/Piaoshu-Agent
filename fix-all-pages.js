const fs = require('fs');
const path = require('path');

console.log('🔧 检查并修复所有页面...\n');

// 需要检查的页面目录
const pagesDir = path.join(__dirname, 'src', 'app');

// 递归查找所有 page.tsx 文件
function findPageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过 api 目录
      if (!file.startsWith('api')) {
        findPageFiles(filePath, fileList);
      }
    } else if (file === 'page.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 检查并修复页面
function fixPage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(__dirname, filePath);
  
  // 检查是否已经有 'use client'
  const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
  
  // 检查是否已经有 dynamic export
  const hasDynamic = content.includes('export const dynamic');
  
  // 检查是否使用了客户端特性
  const hasClientFeatures = 
    content.includes('useState') ||
    content.includes('useEffect') ||
    content.includes('onClick') ||
    content.includes('onChange') ||
    content.includes('onSubmit') ||
    content.includes('onFocus') ||
    content.includes('onBlur') ||
    content.includes('onMouseOver') ||
    content.includes('onMouseOut') ||
    content.includes('onKeyPress');
  
  if (hasClientFeatures && !hasUseClient) {
    console.log(`⚠️  ${relativePath} - 缺少 'use client'`);
    
    // 添加 'use client' 和 dynamic export
    let newContent = content;
    
    // 在文件开头添加
    if (!hasUseClient) {
      newContent = "'use client';\n\n" + newContent;
    }
    
    // 在 'use client' 后添加 dynamic export
    if (!hasDynamic && hasUseClient) {
      newContent = newContent.replace(
        /'use client';/,
        "'use client';\n\n// 禁用静态生成\nexport const dynamic = 'force-dynamic';"
      );
    } else if (!hasDynamic) {
      newContent = newContent.replace(
        /'use client';\n\n/,
        "'use client';\n\n// 禁用静态生成\nexport const dynamic = 'force-dynamic';\n\n"
      );
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ 已修复: ${relativePath}\n`);
    return true;
  } else if (hasClientFeatures && hasUseClient && !hasDynamic) {
    console.log(`⚠️  ${relativePath} - 有 'use client' 但缺少 dynamic export`);
    
    // 添加 dynamic export
    let newContent = content.replace(
      /'use client';/,
      "'use client';\n\n// 禁用静态生成\nexport const dynamic = 'force-dynamic';"
    );
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ 已修复: ${relativePath}\n`);
    return true;
  } else if (hasClientFeatures) {
    console.log(`✓ ${relativePath} - 配置正确`);
    return false;
  } else {
    console.log(`ℹ️  ${relativePath} - 服务器组件（无需修复）`);
    return false;
  }
}

// 主函数
function main() {
  const pageFiles = findPageFiles(pagesDir);
  console.log(`找到 ${pageFiles.length} 个页面文件\n`);
  
  let fixedCount = 0;
  
  pageFiles.forEach(filePath => {
    if (fixPage(filePath)) {
      fixedCount++;
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ 检查完成！修复了 ${fixedCount} 个页面`);
  console.log('='.repeat(60));
}

main();
