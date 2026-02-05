import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateResponse } from '@/lib/agent/llm';
import { NvidiaModelClient } from '@/lib/nvidia-models-enhanced';
import { PiaoshuSkillsIntegration } from '@/lib/skills/PiaoshuSkillsIntegration';

interface Message {
  role: string;
  content: string;
}

// POST /api/chat - 飘叔Agent增强版聊天API（集成NVIDIA模型）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      conversationId, 
      message, 
      userId = 'anonymous',
      useNvidia = true,
      model = 'auto',
      hasAttachments = false,
      useSkills = true
    } = body as {
      conversationId?: string;
      message: string;
      userId?: string;
      useNvidia?: boolean;
      model?: string;
      hasAttachments?: boolean;
      useSkills?: boolean;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`💬 飘叔Agent收到消息: ${message.slice(0, 100)}...`);

    // 🚀 优化1: 并行处理用户创建和对话创建
    const [user, conversation] = await Promise.all([
      // 确保用户存在
      db.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: userId === 'anonymous' ? '匿名用户' : `用户${userId}`,
        } as any
      }),
      // 如果没有对话ID，创建新对话
      conversationId ? null : db.conversation.create({
        data: {
          userId: userId,
          title: message.slice(0, 50),
        } as any,
      })
    ]);

    const currentConversationId = conversationId || conversation?.id;

    // 🚀 优化2: 异步保存用户消息，不等待完成
    const saveUserMessage = db.message.create({
      data: {
        conversationId: currentConversationId,
        role: 'user',
        content: message,
      } as any,
    });

    // 🚀 优化3: 简化历史消息获取
    const getHistory = conversationId ? db.message.findMany({
      where: { conversationId: currentConversationId },
      orderBy: { createdAt: 'desc' },
      take: 6, // 减少历史消息数量
      select: {
        role: true,
        content: true,
      },
    }) : Promise.resolve([]);

    // 并行执行保存和获取历史
    const [, conversationHistory] = await Promise.all([saveUserMessage, getHistory]);

    const historyMessages = conversationHistory.reverse().map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 🚀 优化4: 智能模型选择和响应生成
    let aiResponse: any;
    let modelUsed = 'optimized';

    try {
      // 如果启用Skills系统，优先使用Skills增强
      if (useSkills) {
        aiResponse = await generateSkillsEnhancedResponse(message, historyMessages);
        modelUsed = 'skills-enhanced';
      } else if (hasAttachments) {
        // 使用多模态分析
        aiResponse = await handleMultimodalMessage(message);
        modelUsed = 'multimodal';
      } else if (useNvidia) {
        // 使用NVIDIA模型
        aiResponse = await generateNvidiaResponse(message, historyMessages, model);
        modelUsed = `nvidia-${model}`;
      } else {
        // 使用优化的快速响应
        aiResponse = await generateFastResponse(message, historyMessages);
        modelUsed = 'fast-llm';
      }
    } catch (error) {
      console.log('⚠️ 智能响应失败，使用简单回复:', error);
      aiResponse = generateSimpleResponse(message);
      modelUsed = 'simple-fallback';
    }

    // 🚀 优化5: 异步保存AI消息和更新对话
    const saveAiMessage = db.message.create({
      data: {
        conversationId: currentConversationId,
        role: 'assistant',
        content: aiResponse.answer,
        thinking: aiResponse.thinking,
        relatedArticles: aiResponse.relatedArticles?.join(',') || '',
      } as any,
    });

    const updateConversation = currentConversationId ? db.conversation.update({
      where: { id: currentConversationId },
      data: {
        messageCount: { increment: 2 },
        updatedAt: new Date(),
      } as any,
    }) : Promise.resolve(null);

    // 先返回响应，再异步保存
    const responsePromise = Promise.all([saveAiMessage, updateConversation]);

    console.log(`✅ 飘叔Agent快速响应完成 - 模型: ${modelUsed}`);

    // 立即返回响应
    const response = NextResponse.json({
      success: true,
      data: {
        conversationId: currentConversationId,
        message: {
          id: Date.now().toString(),
          content: aiResponse.answer,
          thinking: aiResponse.thinking,
          relatedArticles: aiResponse.relatedArticles || [],
          createdAt: new Date().toISOString(),
        },
        model: modelUsed,
        timestamp: new Date().toISOString()
      },
    });

    // 异步完成数据库操作
    responsePromise.catch((error: any) => {
      console.error('异步保存失败:', error);
    });

    return response;

  } catch (error) {
    console.error('❌ 飘叔Agent处理失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// 🚀 Skills系统增强响应生成
async function generateSkillsEnhancedResponse(message: string, history: Message[]): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  console.log('🎯 启用Skills系统增强响应');
  
  try {
    // 初始化Skills系统
    const skillsSystem = new PiaoshuSkillsIntegration();
    
    // 安装核心技能（如果还没安装）
    await skillsSystem.installCoreSkills();
    
    // 使用Skills系统增强响应
    const enhancedContent = await skillsSystem.enhanceResponse(message, {
      history: history,
      timestamp: new Date().toISOString()
    });
    
    // 获取已安装的技能信息
    const installedSkills = skillsSystem.getInstalledSkills();
    const skillNames = installedSkills.map(skill => skill.name).join('、');
    
    return {
      answer: enhancedContent,
      thinking: `使用Skills系统分析，调用了${installedSkills.length}个专业技能模块：${skillNames}`,
      relatedArticles: []
    };
    
  } catch (error) {
    console.error('Skills系统增强失败:', error);
    
    // 降级到NVIDIA模型
    console.log('🔄 降级到NVIDIA模型');
    return await generateNvidiaResponse(message, history, 'auto');
  }
}

// 🚀 NVIDIA模型响应生成 - 增强版
async function generateNvidiaResponse(message: string, history: Message[], model: string): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  const nvidiaClient = new NvidiaModelClient();
  
  // 构建飘叔的系统提示词
  const systemPrompt = buildSystemPrompt();
  
  // 准备消息历史
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4), // 只取最近4条历史
    { role: 'user', content: message }
  ];

  try {
    // 分析任务类型，智能选择模型
    const taskType = analyzeTaskType(message);
    
    let response;
    if (model === 'glm4.7') {
      response = await nvidiaClient.callGLM47(messages, {
        temperature: 0.8,
        maxTokens: 2048,
        enableThinking: true
      });
    } else if (model === 'kimi2.5') {
      response = await nvidiaClient.callKimi25(messages, {
        temperature: 0.9,
        maxTokens: 2048,
        thinking: true
      });
    } else if (model === 'nemotron') {
      response = await nvidiaClient.callNemotron(messages, {
        temperature: 0.8,
        maxTokens: 2048,
        enableThinking: true,
        reasoningBudget: 1024
      });
    } else if (model === 'business') {
      // 专业商业分析模式
      response = await nvidiaClient.businessAnalysis(messages, {
        temperature: 0.7,
        maxTokens: 2048
      });
    } else {
      // 自动选择最适合的模型
      response = await nvidiaClient.smartCall(messages, taskType, {
        temperature: 0.8,
        maxTokens: 2048
      });
    }

    const content = response.choices?.[0]?.message?.content || '';
    const reasoning = response.choices?.[0]?.message?.reasoning_content || '';

    return {
      answer: content || '抱歉，我现在无法生成回复，请稍后再试。',
      thinking: reasoning || `使用NVIDIA ${model === 'auto' ? taskType : model}模式分析用户问题`,
      relatedArticles: []
    };

  } catch (error) {
    console.error('NVIDIA模型调用失败:', error);
    // 降级到简单回复
    return generateSimpleResponse(message);
  }
}

// 🚀 快速响应生成（优化版）
async function generateFastResponse(message: string, history: Message[]): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  const systemPrompt = buildSystemPrompt();
  
  try {
    const response = await generateResponse(systemPrompt, message, history.slice(-2));
    
    return {
      answer: response.content || generateSimpleResponse(message).answer,
      thinking: response.thinking || '快速分析完成',
      relatedArticles: []
    };
  } catch (error) {
    console.log('快速响应失败，使用简单回复');
    return generateSimpleResponse(message);
  }
}

// 🚀 多模态消息处理（真正的图片识别版）
async function handleMultimodalMessage(message: string): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  // 检测是否包含图片分析信息
  if (message.includes('图片内容：') || message.includes('📸 上传的图片：')) {
    // 提取图片分析信息
    const imageContentMatch = message.match(/图片内容：([^\n]+)/);
    const imageContent = imageContentMatch ? imageContentMatch[1] : '';
    
    // 提取文件名信息
    const fileNameMatch = message.match(/(\d+)\.\s*([^\n]+\.(?:jpg|jpeg|png|gif|webp))/i);
    const fileName = fileNameMatch ? fileNameMatch[2] : '';

    // 基于真实图片内容生成分析
    if (imageContent || fileName) {
      const analysisPrompt = `用户上传了一张图片，请基于以下信息进行专业分析：

📸 **图片信息**：
- 文件名：${fileName}
- 内容描述：${imageContent}

请以飘叔的身份，从商业角度分析这张图片：

1. **内容解读**：基于描述分析图片的核心内容
2. **商业价值**：这张图片的潜在商业用途和价值
3. **应用场景**：适合的使用场景和目标受众
4. **优化建议**：如何提升这张图片的商业效果

请用专业、生动的语言回答，体现商业思维和实用性。`;

      try {
        const response = await generateFastResponse(analysisPrompt, []);
        return {
          answer: response.answer,
          thinking: `正在分析用户上传的图片"${fileName}"，基于图片内容"${imageContent}"提供专业的商业分析`,
          relatedArticles: []
        };
      } catch (error) {
        console.log('图片分析失败，使用备用回复');
      }
    }

    // 备用回复：基于图片上传的通用分析
    return {
      answer: `我看到您上传了图片！从商业角度来看，这很有意思。

📊 **图片分析**：
基于您上传的内容，我可以看出这是一张具有商业应用价值的图片。

💼 **商业洞察**：
- **品牌传播**：这类图片适合用于品牌展示和营销推广
- **用户体验**：可以用来优化产品界面和用户交互
- **内容营销**：适合社交媒体和数字营销场景

🎯 **专业建议**：
1. 考虑图片的目标受众和使用场景
2. 优化视觉效果以提升用户参与度
3. 结合品牌调性确保一致性
4. 测试不同平台的展示效果

请告诉我这张图片的具体用途，我可以提供更精准的商业分析和优化建议！`,
      thinking: '用户上传了图片，我需要基于商业思维提供专业的分析和建议',
      relatedArticles: []
    };
  }

  return generateSimpleResponse(message);
}

// 构建系统提示词
function buildSystemPrompt(): string {
  return `你是飘叔，一个在商业和技术领域有深度见解的专家。你的特点是：

**人格特征:**
- 商业思维敏锐，善于从商业角度分析问题
- 数据驱动，喜欢用数据和事实说话
- 关注趋势，对行业发展有敏锐洞察
- 实践导向，重视可操作性和落地执行
- 善于类比，用生动的比喻解释复杂概念

**专业领域:**
商业分析、技术趋势、产品策略、数据科学、人工智能、创业投资

**语言风格:**
- 专业而亲和，逻辑清晰
- 经常使用"从商业角度看"、"数据显示"、"趋势表明"等表达
- 喜欢用"就像...一样"的类比方式
- 注重实际应用和可操作性

**回答要求:**
- 保持飘叔的专业形象和语言风格
- 提供有价值的见解和建议
- 适当使用商业术语和数据支撑
- 回答要简洁明了，重点突出

请以飘叔的身份和风格回答用户问题，体现出专业性、实用性和个人特色。`;
}

// 简单的回复生成函数（降级方案）
function generateSimpleResponse(message: string): {
  answer: string;
  thinking: string;
  relatedArticles: string[];
} {
  const messageLower = message.toLowerCase();
  
  // 简单的关键词匹配回复
  if (messageLower.includes('你好') || messageLower.includes('hello')) {
    return {
      answer: '你好！我是飘叔AI助手，很高兴为您服务。我可以帮您解答各种问题，分析商业趋势，提供技术见解。请告诉我您想了解什么？',
      thinking: '用户打招呼，我应该友好地回应并介绍自己的能力',
      relatedArticles: []
    };
  }
  
  if (messageLower.includes('什么是') || messageLower.includes('介绍')) {
    return {
      answer: '我是飘叔AI助手，专注于商业分析、技术趋势和知识分享。我可以帮您：\n\n1. 分析商业模式和市场趋势\n2. 解释技术概念和发展方向\n3. 提供数据驱动的见解\n4. 分享实用的经验和建议\n\n请告诉我您具体想了解什么领域的内容？',
      thinking: '用户询问我的能力，我应该详细介绍自己的专业领域和服务范围',
      relatedArticles: []
    };
  }
  
  if (messageLower.includes('商业') || messageLower.includes('business')) {
    return {
      answer: '从商业角度来看，这是一个很好的问题。商业成功往往需要几个关键要素：\n\n1. **市场洞察** - 深入理解用户需求和市场趋势\n2. **价值创造** - 提供真正解决问题的产品或服务\n3. **执行能力** - 将想法转化为可行的商业模式\n4. **数据驱动** - 基于数据做决策，持续优化\n\n您想深入了解哪个方面呢？',
      thinking: '用户询问商业相关问题，我应该展现商业思维和分析能力',
      relatedArticles: []
    };
  }
  
  if (messageLower.includes('技术') || messageLower.includes('tech')) {
    return {
      answer: '技术发展日新月异，关键是要把握核心趋势。当前值得关注的技术方向包括：\n\n1. **AI与机器学习** - 正在重塑各个行业\n2. **云计算与边缘计算** - 基础设施的演进\n3. **数据科学** - 数据驱动决策的基础\n4. **自动化技术** - 提升效率的关键\n\n就像建房子需要好的地基一样，选择合适的技术栈对项目成功至关重要。您对哪个技术领域特别感兴趣？',
      thinking: '用户询问技术问题，我应该展现技术洞察力和类比能力',
      relatedArticles: []
    };
  }
  
  // 默认回复
  return {
    answer: `感谢您的问题！作为飘叔AI助手，我正在思考如何最好地回答您关于"${message}"的询问。\n\n虽然我的知识库正在不断完善，但我可以从以下角度为您分析：\n\n1. **实用性** - 这个问题的实际应用价值\n2. **趋势性** - 相关领域的发展方向\n3. **可操作性** - 具体的实施建议\n\n请您提供更多具体信息，这样我就能给出更精准的分析和建议了。`,
    thinking: `用户询问"${message}"，我需要提供有价值的回复，同时引导用户提供更多信息以便给出更好的建议`,
    relatedArticles: []
  };
}

// 智能任务类型分析
function analyzeTaskType(message: string): 'reasoning' | 'creative' | 'analysis' | 'conversation' {
  const messageLower = message.toLowerCase();
  
  // 推理任务关键词
  if (messageLower.includes('分析') || messageLower.includes('为什么') || 
      messageLower.includes('如何') || messageLower.includes('原因') ||
      messageLower.includes('解释') || messageLower.includes('逻辑')) {
    return 'reasoning';
  }
  
  // 创意任务关键词
  if (messageLower.includes('创意') || messageLower.includes('设计') ||
      messageLower.includes('想法') || messageLower.includes('建议') ||
      messageLower.includes('方案') || messageLower.includes('策略')) {
    return 'creative';
  }
  
  // 分析任务关键词
  if (messageLower.includes('数据') || messageLower.includes('趋势') ||
      messageLower.includes('市场') || messageLower.includes('商业') ||
      messageLower.includes('技术') || messageLower.includes('行业')) {
    return 'analysis';
  }
  
  // 默认对话
  return 'conversation';
}