// 测试语言风格修复

const testLanguageStyleFix = async () => {
  console.log('🗣️ 测试语言风格修复...\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // 测试专业严肃的语言风格
    const response = await fetch(`${baseUrl}/api/chat-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '请分析一下Transformer架构的技术特点和商业价值',
        model: 'z-ai/glm4.7'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.message?.content) {
        console.log('✅ 语言风格测试成功');
        console.log('\n📝 飘叔回复内容:');
        console.log('=' * 50);
        console.log(data.data.message.content);
        console.log('=' * 50);
        
        // 分析语言风格特征
        const content = data.data.message.content;
        const analysis = {
          professional: content.includes('从商业角度') || content.includes('技术架构') || content.includes('数据显示'),
          serious: !content.includes('（笑）') && !content.includes('推了推眼镜'),
          structured: content.includes('**') || content.includes('###') || content.includes('•'),
          practical: content.includes('实际') || content.includes('应用') || content.includes('落地')
        };
        
        console.log('\n🔍 语言风格分析:');
        console.log(`专业性: ${analysis.professional ? '✅' : '❌'}`);
        console.log(`严肃性: ${analysis.serious ? '✅' : '❌'}`);
        console.log(`结构化: ${analysis.structured ? '✅' : '❌'}`);
        console.log(`实用性: ${analysis.practical ? '✅' : '❌'}`);
        
        const score = Object.values(analysis).filter(Boolean).length;
        console.log(`\n总体评分: ${score}/4 ${score >= 3 ? '✅ 优秀' : score >= 2 ? '⚠️ 良好' : '❌ 需改进'}`);
        
      } else {
        console.log('❌ 未获取到回复内容');
      }
    } else {
      console.log('❌ API调用失败');
    }

  } catch (error) {
    console.error('❌ 测试异常:', error.message);
  }
};

testLanguageStyleFix().catch(console.error);