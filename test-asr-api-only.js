// 仅测试ASR API的简化脚本
const http = require('http');

function makeRequest(path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: { text: body } });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testASR() {
  console.log('🧪 测试ASR API...\n');
  
  try {
    // 1. 测试服务状态
    console.log('1. 测试服务状态...');
    const statusResponse = await makeRequest('/api/multimodal/asr');
    
    if (statusResponse.status === 200) {
      console.log('✅ ASR服务可用');
      console.log('服务信息:', JSON.stringify(statusResponse.data, null, 2));
    } else {
      console.log('❌ ASR服务不可用:', statusResponse.status);
      return;
    }
    
    // 2. 测试语音识别
    console.log('\n2. 测试语音识别...');
    const mockAudio = 'dGVzdCBhdWRpbyBkYXRh'; // base64编码的"test audio data"
    
    const asrResponse = await makeRequest('/api/multimodal/asr', {
      audioData: mockAudio,
      provider: 'mock',
      language: 'zh-CN'
    });
    
    if (asrResponse.status === 200 && asrResponse.data.success) {
      console.log('✅ 语音识别成功');
      console.log('识别结果:', asrResponse.data.data.text);
      console.log('置信度:', (asrResponse.data.data.confidence * 100).toFixed(1) + '%');
    } else {
      console.log('❌ 语音识别失败:', asrResponse.data.error);
    }
    
    console.log('\n🎉 ASR API测试完成！');
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
  }
}

testASR();