import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NvidiaModelClient } from '@/lib/nvidia-models-enhanced';
import { PersonalityLearning } from '@/lib/personality/PersonalityLearning';

interface Message {
  role: string;
  content: string;
}

// POST /api/chat-personalized - 个性化学习版聊天API
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
      feedback = null // 用户反馈：'positive', 'negative', 'neutral'
    } = body as {
      conversationId?: string;
      message: string;
      userId?: string;
      useNvidia?: boolean;
      model?: string;
      hasAttachments?: boolean;
      feedback?: 'positive' | 'negative' | 'neutral' | null;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`💬 个性化飘叔Agent收到消息: ${message.substring(0, 100)}...`);

    // 初始化个性化学习系统
    const personalityLearner = new PersonalityLearning(userId);

    // 并行处理用户创建和对话创建
    const [user, conversation] = await Promise.all([
      db.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: userId === 'anonymous' ? '匿名用户' : `用户${userId}`,
        } as any
      }),
      conversationId ? null : db.conversation.create({
        data: {
          userId: userId,
          title: message.substring(0, 50),
        } as any,
      })
    ]);

    const currentConversationId = conversationId || conversation?.id;

    // 获取历史消息
    const conversationHistory = conversationId ? await db.message.findMany({
      where: { conversationId: currentConversationId },
      orderBy: { createdAt: 'desc' },
      take: 10, // 增加历史消息数量用于个性化学习
      select: {
        role: true,
        content: true,
      },
    }) : [];

    const historyMessages = conversationHistory.reverse().map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 生成个性化的系统提示词
    const personalizedSystemPrompt = personalityLearner.getPersonalizedSystemPrompt();
    
    // 准备消息历史（包含个性化系统提示）
    const messages: Message[] = [
      { role: 'system', content: personalizedSystemPrompt },
      ...historyMessages.slice(-6), // 最近6条历史
      { role: 'user', content: message }
    ];

    // 生成AI响应
    let aiResponse: any;
    let modelUsed = 'personalized';

    try {
      if (hasAttachments) {
        aiResponse = await handleMultimodalMessage(message);
        modelUsed = 'multimodal-personalized';
      } else if (useNvidia) {
        aiResponse = await generatePersonalizedNvidiaResponse(message, messages, model, personalityLearner);
        modelUsed = `nvidia-${model}-personalized`;
      } else {
        aiResponse = await generatePersonalizedResponse(message, historyMessages, personalityLearner);
        modelUsed = 'personalized-fallback';
      }
    } catch (error) {
      console.log('⚠️ 个性化响应失败，使用简单回复:', error);
      aiResponse = generateSimpleResponse(message);
      modelUsed = 'simple-fallback';
    }

    // 记录交互用于学习
    await personalityLearner.recordInteraction({
      userId,
      message,
      response: aiResponse.answer,
      timestamp: new Date(),
      feedback: feedback || 'neutral',
      context: model
    });

    // 异步保存消息
    const saveUserMessage = db.message.create({
      data: {
        conversationId: currentConversationId,
        role: 'user',
        content: message,
      } as any,
    });

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

    // 获取学习分析
    const learningAnalysis = personalityLearner.analyzeConversationPatterns();
    const personalityProfile = personalityLearner.getPersonalityProfile();

    console.log(`✅ 个性化飘叔Agent响应完成 - 模型: ${modelUsed}`);

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
        timestamp: new Date().toISOString(),
        // 个性化学习信息
        personalization: {
          learningProgress: learningAnalysis.learningProgress || 0,
          preferredStyle: learningAnalysis.preferredStyle || '平衡适中',
          interactionCount: learningAnalysis.totalInteractions || 0,
          personalityTraits: {
            businessFocus: Math.round(personalityProfile.businessFocus * 100),
            technicalDepth: Math.round(personalityProfile.technicalDepth * 100),
            directness: Math.round(personalityProfile.directness * 100),
            analyticalThinking: Math.round(personalityProfile.analyticalThinking * 100)
          }
        }
      },
    });

    // 异步完成数据库操作
    Promise.all([saveUserMessage, saveAiMessage, updateConversation]).catch((error: any) => {
      console.error('异步保存失败:', error);
    });

    return response;

  } catch (error) {
    console.error('❌ 个性化飘叔Agent处理失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process personalized chat message' },
      { status: 500 }
    );
  }
}

// 个性化NVIDIA响应生成
async function generatePersonalizedNvidiaResponse(
  message: string, 
  messages: Message[], 
  model: string,
  personalityLearner: PersonalityLearning
): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  const nvidiaClient = new NvidiaModelClient();
  
  try {
    // 分析任务类型
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
      response = await nvidiaClient.businessAnalysis(messages, {
        temperature: 0.7,
        maxTokens: 2048
      });
    } else {
      // 根据个性化特征选择模型
      const personalityProfile = personalityLearner.getPersonalityProfile();
      
      if (personalityProfile.analyticalThinking > 0.8 && personalityProfile.businessFocus > 0.8) {
        // 高分析性 + 高商业导向 → Nemotron
        response = await nvidiaClient.callNemotron(messages, {
          temperature: 0.7,
          maxTokens: 2048,
          enableThinking: true
        });
      } else if (personalityProfile.creativityLevel > 0.7) {
        // 高创意性 → Kimi2.5
        response = await nvidiaClient.callKimi25(messages, {
          temperature: 0.9,
          maxTokens: 2048,
          thinking: true
        });
      } else {
        // 默认 → GLM4.7
        response = await nvidiaClient.callGLM47(messages, {
          temperature: 0.8,
          maxTokens: 2048,
          enableThinking: true
        });
      }
    }

    const content = response.choices?.[0]?.message?.content || '';
    const reasoning = response.choices?.[0]?.message?.reasoning_content || '';

    return {
      answer: content || '抱歉，我现在无法生成回复，请稍后再试。',
      thinking: reasoning || `使用个性化${model}模式分析用户问题`,
      relatedArticles: []
    };

  } catch (error) {
    console.error('个性化NVIDIA模型调用失败:', error);
    return generateSimpleResponse(message);
  }
}

// 个性化响应生成（降级方案）
async function generatePersonalizedResponse(
  message: string, 
  history: Message[], 
  personalityLearner: PersonalityLearning
): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  const personalityProfile = personalityLearner.getPersonalityProfile();
  
  // 根据个性化特征调整回复
  let response = generateSimpleResponse(message);
  
  // 根据用户偏好调整语言风格
  if (personalityProfile.humorLevel > 0.6) {
    response.answer = addHumorToResponse(response.answer);
  }
  
  if (personalityProfile.directness > 0.7) {
    response.answer = makeResponseMoreDirect(response.answer);
  }
  
  if (personalityProfile.exampleUsage > 0.6) {
    response.answer = addExamplesToResponse(response.answer);
  }
  
  response.thinking = `基于个性化学习调整回复风格：幽默度${Math.round(personalityProfile.humorLevel*100)}%，直接度${Math.round(personalityProfile.directness*100)}%`;
  
  return response;
}

// 辅助函数：添加幽默元素
function addHumorToResponse(response: string): string {
  const humorPhrases = [
    '哈哈，这个问题有意思',
    '说得好，我也这么想',
    '这就像是商业世界的小秘密',
    '有趣的角度'
  ];
  
  const randomPhrase = humorPhrases[Math.floor(Math.random() * humorPhrases.length)];
  return `${randomPhrase}！${response}`;
}

// 辅助函数：让回复更直接
function makeResponseMoreDirect(response: string): string {
  return response
    .replace(/可能|也许|或许/g, '')
    .replace(/我觉得|我认为/g, '')
    .replace(/建议您可以考虑/g, '建议');
}

// 辅助函数：添加例子
function addExamplesToResponse(response: string): string {
  if (!response.includes('例如') && !response.includes('比如')) {
    const examples = [
      '比如说，就像苹果公司的产品策略一样',
      '举个例子，亚马逊的云服务就是这个思路',
      '例如，特斯拉的创新模式就体现了这一点'
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    return `${response}\n\n${randomExample}。`;
  }
  
  return response;
}

// 多模态消息处理
async function handleMultimodalMessage(message: string): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  // 这里可以集成图片分析等多模态功能
  return {
    answer: `我看到您上传了多媒体内容。基于个性化学习，我会用您偏好的风格来分析这些内容。`,
    thinking: '个性化多模态分析',
    relatedArticles: []
  };
}

// 简单回复生成
function generateSimpleResponse(message: string): {
  answer: string;
  thinking: string;
  relatedArticles: string[];
} {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('你好') || messageLower.includes('hello')) {
    return {
      answer: '你好！我是个性化版的飘叔AI助手。我会根据我们的对话逐渐了解您的偏好，调整我的回复风格。请告诉我您想了解什么？',
      thinking: '用户打招呼，介绍个性化功能',
      relatedArticles: []
    };
  }
  
  return {
    answer: `感谢您的问题！作为个性化飘叔AI，我正在学习您的交流风格和偏好。关于"${message}"，我会根据您的特点来提供最适合的分析和建议。`,
    thinking: `个性化分析用户问题："${message}"`,
    relatedArticles: []
  };
}

// 任务类型分析
function analyzeTaskType(message: string): 'reasoning' | 'creative' | 'analysis' | 'conversation' {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('分析') || messageLower.includes('为什么') || 
      messageLower.includes('如何') || messageLower.includes('原因')) {
    return 'reasoning';
  }
  
  if (messageLower.includes('创意') || messageLower.includes('设计') ||
      messageLower.includes('想法') || messageLower.includes('方案')) {
    return 'creative';
  }
  
  if (messageLower.includes('数据') || messageLower.includes('趋势') ||
      messageLower.includes('市场') || messageLower.includes('商业')) {
    return 'analysis';
  }
  
  return 'conversation';
}