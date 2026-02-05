// 快速测试脚本 - 测试关键API
const BASE_URL = 'http://localhost:3000';

async function quickTest() {
  console.log('\n🧪 开始快速测试...\n');
  
  let passed = 0;
  let failed = 0;
  
  // 测试1: 首页
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) {
      console.log('✅ 首页访问正常');
      passed++;
    } else {
      console.log('❌ 首页访问失败:', res.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ 首页访问错误:', e.message);
    failed++;
  }
  
  // 测试2: 聊天API
  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '你好', userId: 'test' })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log('✅ 聊天API正常');
      passed++;
    } else {
      console.log('❌ 聊天API失败:', data.error || res.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ 聊天API错误:', e.message);
    failed++;
  }
  
  // 测试3: NVIDIA API
  try {
    const res = await fetch(`${BASE_URL}/api/nvidia/chat`, {
      method: 'GET'
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ NVIDIA API正常');
      passed++;
    } else {
      console.log('❌ NVIDIA API失败');
      failed++;
    }
  } catch (e) {
    console.log('❌ NVIDIA API错误:', e.message);
    failed++;
  }
  
  // 测试4: 简单聊天页面
  try {
    const res = await fetch(`${BASE_URL}/simple`);
    if (res.ok) {
      console.log('✅ 简单聊天页面正常');
      passed++;
    } else {
      console.log('❌ 简单聊天页面失败');
      failed++;
    }
  } catch (e) {
    console.log('❌ 简单聊天页面错误:', e.message);
    failed++;
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 测试结果:`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed/(passed+failed))*100).toFixed(1)}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  if (passed >= 3) {
    console.log('🎉 核心功能正常，可以继续测试！\n');
    process.exit(0);
  } else {
    console.log('⚠️  部分功能异常，请检查服务器日志\n');
    process.exit(1);
  }
}

// 先检查服务器
fetch(BASE_URL)
  .then(() => {
    console.log('✅ 服务器已就绪\n');
    quickTest();
  })
  .catch(() => {
    console.log('❌ 服务器未运行！请先启动: npm run dev\n');
    process.exit(1);
  });
