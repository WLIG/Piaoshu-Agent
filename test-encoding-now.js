// 快速测试编码修复
const fs = require('fs');

// 测试当前的编码修复
async function testEncodingFix() {
  try {
    const testContent = `第一章 飘叔web4.0革命

这是测试内容，包含中文字符。

第二章 技术发展

更多中文内容测试。`;

    // 创建测试文件
    fs.writeFileSync('./test-encoding.txt', testContent, 'utf8');
    
    console.log('✅ 测试文件已创建: test-encoding.txt');
    console.log('📝 内容预览:');
    console.log(testContent);
    console.log('\n🚀 请使用此文件测试书籍上传功能！');
    
  } catch (error) {
    console.error('❌ 创建测试文件失败:', error);
  }
}

testEncodingFix();