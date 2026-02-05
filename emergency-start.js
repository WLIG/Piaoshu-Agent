// 紧急启动脚本 - 绕过编译问题
const { spawn } = require('child_process');
const path = require('path');

console.log('🚨 紧急启动模式 - 绕过编译问题\n');

// 尝试多种启动方式
const startupMethods = [
  { name: 'Next.js Dev (Turbo)', cmd: 'npx', args: ['next', 'dev', '-p', '3000', '--turbo'] },
  { name: 'Next.js Dev (Standard)', cmd: 'npx', args: ['next', 'dev', '-p', '3000'] },
  { name: 'NPM Dev Script', cmd: 'npm', args: ['run', 'dev'] }
];

async function tryStartup(method) {
  return new Promise((resolve) => {
    console.log(`🔄 尝试启动方式: ${method.name}`);
    
    const server = spawn(method.cmd, method.args, {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    let hasOutput = false;
    let startupSuccess = false;

    // 监听输出
    server.stdout.on('data', (data) => {
      hasOutput = true;
      const output = data.toString();
      console.log(output);
      
      // 检查启动成功标志
      if (output.includes('Ready') || 
          output.includes('started server') || 
          output.includes('Local:') ||
          output.includes('localhost:3000')) {
        startupSuccess = true;
        console.log('\n✅ 服务器启动成功！');
        console.log('🌐 访问地址: http://localhost:3000');
        resolve({ success: true, process: server });
      }
    });

    server.stderr.on('data', (data) => {
      const error = data.toString();
      console.log('输出:', error);
      
      // 如果是警告而不是错误，继续等待
      if (!error.includes('Error:') && !error.includes('Failed')) {
        hasOutput = true;
      }
    });

    server.on('close', (code) => {
      if (!startupSuccess) {
        console.log(`❌ 启动失败 (退出码: ${code})`);
        resolve({ success: false, code });
      }
    });

    server.on('error', (error) => {
      console.log(`❌ 启动错误: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    // 超时检查
    setTimeout(() => {
      if (!startupSuccess && hasOutput) {
        console.log('⏰ 启动中，请继续等待...');
      } else if (!hasOutput) {
        console.log('❌ 无输出，启动失败');
        server.kill();
        resolve({ success: false, error: 'No output' });
      }
    }, 15000);

    // 最终超时
    setTimeout(() => {
      if (!startupSuccess) {
        console.log('❌ 启动超时');
        server.kill();
        resolve({ success: false, error: 'Timeout' });
      }
    }, 45000);
  });
}

async function emergencyStart() {
  for (const method of startupMethods) {
    const result = await tryStartup(method);
    
    if (result.success) {
      console.log('\n🎉 启动成功！');
      console.log('🎯 现在你可以：');
      console.log('1. 打开浏览器访问 http://localhost:3000');
      console.log('2. 体验对话功能');
      console.log('3. 点击Plus按钮体验其他功能');
      console.log('\n按Ctrl+C停止服务器');
      
      // 保持进程运行
      process.on('SIGINT', () => {
        console.log('\n🛑 停止服务器...');
        result.process.kill();
        process.exit(0);
      });
      
      return;
    }
    
    console.log(`❌ ${method.name} 启动失败，尝试下一种方式...\n`);
  }
  
  console.log('❌ 所有启动方式都失败了');
  console.log('\n💡 手动启动建议:');
  console.log('1. 打开新的命令行窗口');
  console.log('2. 运行: npx next dev -p 3000');
  console.log('3. 等待启动完成');
  console.log('4. 访问: http://localhost:3000');
}

emergencyStart();