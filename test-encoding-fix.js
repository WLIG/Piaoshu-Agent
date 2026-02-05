// 测试编码修复功能
const fs = require('fs');
const path = require('path');

// 创建测试文件
function createTestFiles() {
  const testDir = './test-files';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // 创建UTF-8测试文件
  const utf8Content = `第一章 飘叔web4.0革命的开始

这是一个关于技术革命的故事。在这个数字化时代，我们见证了无数的变革。

第二章 技术架构的演进

从传统的架构到现代化的微服务架构，技术的发展日新月异。

第三章 未来的展望

人工智能、区块链、物联网等新兴技术将如何改变我们的世界？`;

  fs.writeFileSync(path.join(testDir, 'utf8-test.txt'), utf8Content, 'utf8');
  
  // 创建GBK测试文件
  fs.writeFileSync(path.join(testDir, 'gbk-test.txt'), utf8Content, 'gbk');
  
  console.log('测试文件创建完成！');
  console.log('- UTF-8文件: test-files/utf8-test.txt');
  console.log('- GBK文件: test-files/gbk-test.txt');
  console.log('\n请使用这些文件测试书籍上传功能。');
}

createTestFiles();