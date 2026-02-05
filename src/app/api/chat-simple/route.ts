import { NextRequest, NextResponse } from 'next/server';

// 简化版聊天API，用于测试Skills系统概念
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, useSkills = false } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`💬 收到消息: ${message}`);
    console.log(`🎯 Skills系统: ${useSkills ? '启用' : '禁用'}`);

    // 模拟Skills系统分析
    let response = '';
    let thinking = '';
    
    if (useSkills) {
      // 简单的关键词匹配来模拟Skills系统
      const messageLower = message.toLowerCase();
      
      if (messageLower.includes('区块链') || messageLower.includes('blockchain')) {
        response = `**区块链技术分析** (Skills系统增强)

基于专业技能模块分析，区块链技术具有以下特点：

• **去中心化**: 消除单点故障，提升系统可靠性
• **不可篡改**: 通过密码学保证数据完整性  
• **透明性**: 所有交易记录公开可查
• **智能合约**: 自动执行的合约条款

**商业应用前景**:
1. 金融服务 - DeFi协议和数字支付
2. 供应链管理 - 产品溯源和防伪
3. 数字身份 - 去中心化身份验证
4. 数据存储 - 分布式存储解决方案

**专业建议**: 关注监管合规，选择成熟的技术栈，重视安全审计。

*本分析基于blockchain/defi-analysis技能模块，置信度85%*`;
        thinking = '使用区块链分析技能模块，调用DeFi协议分析和智能合约评估功能';
        
      } else if (messageLower.includes('web4') || messageLower.includes('用户主权')) {
        response = `**Web4.0发展前景分析** (Skills系统增强)

基于web4/decentralized-identity技能模块分析：

• **核心理念**: 用户完全控制自己的数据和数字身份
• **技术基础**: 去中心化身份协议(DID)和隐私保护技术
• **价值主张**: 从平台经济向用户经济转变

**关键特征**:
1. **数据主权** - 用户拥有和控制个人数据
2. **隐私保护** - 零知识证明和同态加密
3. **互操作性** - 跨平台身份和数据流通
4. **经济激励** - 用户参与价值创造和分配

**发展趋势**:
- 隐私计算技术成熟
- 去中心化存储普及
- 数字身份标准化
- 监管框架完善

**投资建议**: 关注基础设施项目，重视用户体验，把握监管窗口期。

*本分析基于web4/user-sovereignty技能模块，置信度90%*`;
        thinking = '使用Web4.0分析技能模块，调用用户主权和隐私协议分析功能';
        
      } else if (messageLower.includes('商业') || messageLower.includes('business')) {
        response = `**商业模式分析** (Skills系统增强)

基于business/startup-analysis技能模块分析：

**成功商业模式的核心要素**:

• **价值创造** - 解决真实的用户痛点
• **价值传递** - 高效的渠道和用户体验
• **价值获取** - 可持续的盈利模式

**关键成功因素**:
1. **市场定位** - 精准的目标用户群体
2. **竞争优势** - 差异化的产品或服务
3. **运营效率** - 优化的成本结构
4. **增长策略** - 可扩展的商业模式

**现代商业趋势**:
- 数据驱动决策
- 平台化生态
- 订阅制服务
- 社区化运营

**实施建议**: 
- 从MVP开始验证假设
- 建立数据分析体系
- 重视用户反馈循环
- 保持敏捷迭代

*本分析基于business/market-research技能模块，置信度88%*`;
        thinking = '使用商业分析技能模块，调用市场研究和竞争情报分析功能';
        
      } else {
        response = `**综合分析** (Skills系统增强)

基于多个专业技能模块的综合分析：

您的问题涉及多个专业领域，我已调用相关技能模块进行分析：

• **数据分析模块** - 提供量化洞察
• **趋势预测模块** - 识别发展方向  
• **商业策略模块** - 给出实用建议

**核心观点**:
1. 技术发展需要商业化落地
2. 用户需求是创新的根本驱动力
3. 可持续发展需要平衡多方利益
4. 监管合规是长期成功的基础

**建议**:
- 保持对新技术的敏感度
- 重视用户体验和反馈
- 建立可持续的商业模式
- 关注监管政策变化

*本分析基于多个技能模块综合判断，置信度80%*`;
        thinking = '使用综合分析模式，调用多个技能模块进行跨领域分析';
      }
    } else {
      // 普通回复模式
      response = `感谢您的问题！作为飘叔AI助手，我很乐意为您分析。

关于"${message}"，从商业角度来看：

这是一个很有价值的问题。基于我的经验和知识，我建议从以下几个维度来思考：

1. **市场需求** - 了解用户的真实需求
2. **技术可行性** - 评估实现的技术难度
3. **商业价值** - 分析潜在的商业机会
4. **风险评估** - 识别可能的挑战和风险

如果您能提供更多具体信息，我可以给出更精准的分析和建议。`;
      thinking = '使用基础分析模式，提供通用的商业思维框架';
    }

    return NextResponse.json({
      success: true,
      data: {
        message: {
          id: Date.now().toString(),
          content: response,
          thinking: thinking,
          createdAt: new Date().toISOString(),
        },
        model: useSkills ? 'skills-enhanced' : 'basic',
        skillsUsed: useSkills,
        timestamp: new Date().toISOString()
      },
    });

  } catch (error) {
    console.error('❌ 聊天处理失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}