import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NvidiaModelClient } from '@/lib/nvidia-models-enhanced';
import { EnhancedPiaoshuPersonality } from '@/lib/personality/EnhancedPiaoshuPersonality';
import { PiaoshuSkillsIntegration } from '@/lib/skills/PiaoshuSkillsIntegration';

interface Message {
  role: string;
  content: string;
}

interface PersonalityTraits {
  formalityLevel: number;
  technicalDepth: number;
  humorLevel: number;
  directness: number;
  analyticalThinking: number;
  creativityLevel: number;
  practicalFocus: number;
  dataOriented: number;
  businessFocus: number;
  techFocus: number;
  marketingFocus: number;
  strategyFocus: number;
  exampleUsage: number;
  analogyUsage: number;
  questionAsking: number;
  encouragement: number;
}

// POST /api/chat-enhanced - 增强版聊天API（集成Skills系统）
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
      feedback = null,
      useSkills = true  // 新增：是否使用Skills系统
    } = body as {
      conversationId?: string;
      message: string;
      userId?: string;
      useNvidia?: boolean;
      model?: string;
      hasAttachments?: boolean;
      feedback?: 'positive' | 'negative' | 'neutral' | null;
      useSkills?: boolean;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`💬 增强版飘叔Agent收到消息: ${message.slice(0, 100)}...`);

    // 🚀 Skills系统增强
    let skillsEnhancedContent = '';
    let skillsMetadata = null;
    
    if (useSkills) {
      try {
        const skillsIntegration = new PiaoshuSkillsIntegration();
        
        // 自动安装核心技能（首次使用时）
        await skillsIntegration.installCoreSkills();
        
        // 使用Skills系统增强回复
        skillsEnhancedContent = await skillsIntegration.enhanceResponse(message, {
          userId,
          conversationId,
          hasAttachments
        });
        
        skillsMetadata = {
          skillsUsed: skillsIntegration.getInstalledSkills().map(s => s.name),
          domainAnalysis: skillsIntegration.analyzeRequiredDomains(message)
        };
        
        console.log(`🎯 Skills增强完成 - 使用技能: ${skillsMetadata.skillsUsed.join(', ')}`);
        
      } catch (skillsError) {
        console.log('⚠️ Skills系统调用失败，使用标准流程:', skillsError);
      }
    }

    try {
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
            title: message.slice(0, 50),
          } as any,
        })
      ]);

      const currentConversationId = conversationId || conversation?.id;

      // 获取历史消息
      const conversationHistory = conversationId ? await db.message.findMany({
        where: { conversationId: currentConversationId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          role: true,
          content: true,
        },
      }) : [];

      const historyMessages = conversationHistory.reverse().map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

      // 分析用户个性特征
      const personalityInsights = analyzeUserPersonality(message, historyMessages);
      
      // 生成个性化的系统提示词
      const personalizedSystemPrompt = generatePersonalizedPrompt(personalityInsights);
      
      // 准备消息历史
      const messages: Message[] = [
        { role: 'system', content: personalizedSystemPrompt },
        ...historyMessages.slice(-6),
        { role: 'user', content: message }
      ];

      // 生成AI响应
      let aiResponse: any;
      let modelUsed = 'enhanced';

      try {
        // 🎯 优先使用Skills增强的内容
        if (skillsEnhancedContent) {
          aiResponse = {
            answer: skillsEnhancedContent,
            thinking: `使用Skills系统分析: ${skillsMetadata?.domainAnalysis?.primaryDomain}领域`,
            relatedArticles: []
          };
          modelUsed = 'skills-enhanced';
        } else if (hasAttachments) {
          aiResponse = await handleMultimodalMessage(message);
          modelUsed = 'multimodal-enhanced';
        } else if (useNvidia) {
          aiResponse = await generateEnhancedNvidiaResponse(message, messages, model, personalityInsights);
          modelUsed = `nvidia-${model}-enhanced`;
        } else {
          aiResponse = await generateEnhancedResponse(message, historyMessages);
          modelUsed = 'enhanced-fallback';
        }
      } catch (error) {
        console.log('⚠️ 增强响应失败，使用简单回复:', error);
        aiResponse = generateSimpleResponse(message);
        modelUsed = 'simple-fallback';
      }

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

      console.log(`✅ 增强版飘叔Agent响应完成 - 模型: ${modelUsed}`);

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
          // 个性化信息
          personalization: {
            personalityInsights,
            modelRecommendation: getModelRecommendation(personalityInsights),
            learningProgress: calculateLearningProgress(historyMessages.length),
            adaptationLevel: calculateAdaptationLevel(personalityInsights)
          },
          // Skills系统信息
          skills: skillsMetadata ? {
            enabled: true,
            skillsUsed: skillsMetadata.skillsUsed,
            domainAnalysis: skillsMetadata.domainAnalysis,
            enhancementLevel: skillsEnhancedContent ? 'high' : 'none'
          } : {
            enabled: false,
            reason: 'Skills system disabled or failed'
          }
        },
      });

      // 异步完成数据库操作
      Promise.all([saveUserMessage, saveAiMessage, updateConversation]).catch((error: any) => {
        console.error('异步保存失败:', error);
      });

      return response;

    } catch (dbError) {
      console.error('❌ 数据库操作失败，使用简单模式:', dbError);
      
      // 数据库失败时的降级响应
      let fallbackContent = '';
      
      if (skillsEnhancedContent) {
        // 如果Skills系统工作正常，使用Skills增强的内容
        fallbackContent = skillsEnhancedContent;
      } else {
        // 否则使用简单响应
        const simpleResponse = generateSimpleResponse(message);
        fallbackContent = simpleResponse.answer;
      }
      
      return NextResponse.json({
        success: true,
        data: {
          conversationId: 'temp-' + Date.now(),
          message: {
            id: Date.now().toString(),
            content: fallbackContent,
            thinking: skillsEnhancedContent ? 'Skills系统增强响应' : '简单降级响应',
            relatedArticles: [],
            createdAt: new Date().toISOString(),
          },
          model: skillsEnhancedContent ? 'skills-fallback' : 'simple-fallback',
          timestamp: new Date().toISOString(),
          skills: skillsMetadata || { enabled: false, reason: 'Database error fallback' }
        },
      });
    }

  } catch (error) {
    console.error('❌ 增强版飘叔Agent处理失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process enhanced chat message' },
      { status: 500 }
    );
  }
}

// 分析用户个性特征
function analyzeUserPersonality(message: string, history: Message[]): PersonalityTraits {
  const messageLower = message.toLowerCase();
  const allMessages = [...history.map(h => h.content), message].join(' ').toLowerCase();
  
  return {
    // 语言风格分析
    formalityLevel: analyzeFormalityLevel(messageLower),
    technicalDepth: analyzeTechnicalDepth(messageLower),
    humorLevel: analyzeHumorLevel(messageLower),
    directness: analyzeDirectness(messageLower),
    
    // 思维模式分析
    analyticalThinking: analyzeAnalyticalThinking(messageLower),
    creativityLevel: analyzeCreativityLevel(messageLower),
    practicalFocus: analyzePracticalFocus(messageLower),
    dataOriented: analyzeDataOrientation(messageLower),
    
    // 专业领域分析
    businessFocus: analyzeBusinessFocus(messageLower),
    techFocus: analyzeTechFocus(messageLower),
    marketingFocus: analyzeMarketingFocus(messageLower),
    strategyFocus: analyzeStrategyFocus(messageLower),
    
    // 交流习惯分析
    exampleUsage: analyzeExampleUsage(messageLower),
    analogyUsage: analyzeAnalogyUsage(messageLower),
    questionAsking: analyzeQuestionAsking(messageLower),
    encouragement: analyzeEncouragement(messageLower)
  };
}

// 具体分析函数
function analyzeFormalityLevel(message: string): number {
  const formalWords = ['您好', '请问', '麻烦', '谢谢', '不好意思', '请'];
  const casualWords = ['嗨', '哈哈', '呗', '啊', '哦', '嘛'];
  
  const formalCount = formalWords.filter(word => message.includes(word)).length;
  const casualCount = casualWords.filter(word => message.includes(word)).length;
  
  if (formalCount > casualCount) return 0.8;
  if (casualCount > formalCount) return 0.3;
  return 0.6;
}

function analyzeHumorLevel(message: string): number {
  const humorWords = ['哈哈', '有趣', '好玩', '搞笑', '逗', '😄', '😂'];
  const humorCount = humorWords.filter(word => message.includes(word)).length;
  return Math.min(humorCount * 0.3, 1.0);
}

function analyzeDirectness(message: string): number {
  const directWords = ['直接', '简单', '别绕', '快点', '直说'];
  const indirectWords = ['可能', '也许', '或许', '大概', '应该'];
  
  const directCount = directWords.filter(word => message.includes(word)).length;
  const indirectCount = indirectWords.filter(word => message.includes(word)).length;
  
  if (directCount > 0) return 0.9;
  if (indirectCount > 0) return 0.4;
  return 0.6;
}

function analyzeAnalyticalThinking(message: string): number {
  const analyticalWords = ['分析', '数据', '统计', '趋势', '原因', '为什么', '如何'];
  const count = analyticalWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.25, 1.0);
}

function analyzeCreativityLevel(message: string): number {
  const creativeWords = ['创意', '想法', '灵感', '创新', '设计', '方案'];
  const count = creativeWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.3, 1.0);
}

function analyzePracticalFocus(message: string): number {
  const practicalWords = ['实用', '实际', '落地', '执行', '操作', '具体'];
  const count = practicalWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.25, 1.0);
}

function analyzeDataOrientation(message: string): number {
  const dataWords = ['数据', '统计', '报告', '指标', '测量', '量化'];
  const count = dataWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.3, 1.0);
}

function analyzeBusinessFocus(message: string): number {
  const businessWords = ['商业', '生意', '盈利', '市场', '客户', '收入', '成本'];
  const count = businessWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.2, 1.0);
}

function analyzeTechFocus(message: string): number {
  const techWords = ['技术', '代码', '算法', '系统', '开发', '编程'];
  const count = techWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.25, 1.0);
}

function analyzeMarketingFocus(message: string): number {
  const marketingWords = ['营销', '推广', '品牌', '广告', '宣传'];
  const count = marketingWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.3, 1.0);
}

function analyzeStrategyFocus(message: string): number {
  const strategyWords = ['策略', '战略', '规划', '计划', '目标'];
  const count = strategyWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.25, 1.0);
}

function analyzeExampleUsage(message: string): number {
  const exampleWords = ['比如', '例如', '举例', '就像'];
  const count = exampleWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.4, 1.0);
}

function analyzeAnalogyUsage(message: string): number {
  const analogyWords = ['就像', '好比', '类似', '如同'];
  const count = analogyWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.4, 1.0);
}

function analyzeQuestionAsking(message: string): number {
  const questionMarks = (message.match(/\?|？/g) || []).length;
  const questionWords = ['怎么', '如何', '为什么', '什么'];
  const questionWordCount = questionWords.filter(word => message.includes(word)).length;
  return Math.min((questionMarks + questionWordCount) * 0.2, 1.0);
}

function analyzeEncouragement(message: string): number {
  const encouragingWords = ['好的', '不错', '很好', '棒', '赞'];
  const count = encouragingWords.filter(word => message.includes(word)).length;
  return Math.min(count * 0.3, 1.0);
}

// 生成个性化提示词
function generatePersonalizedPrompt(traits: PersonalityTraits): string {
  // 使用增强版飘叔人格系统
  const piaoshuPersonality = new EnhancedPiaoshuPersonality();
  const basePrompt = piaoshuPersonality.generateEnhancedSystemPrompt();
  
  // 根据用户特征进行微调
  let personalizedAdjustments = "\n\n**根据用户特征的个性化调整：**\n";
  
  if (traits.formalityLevel > 0.7) {
    personalizedAdjustments += "• 用户偏好正式交流，请保持专业严谨的表达\n";
  } else if (traits.formalityLevel < 0.4) {
    personalizedAdjustments += "• 用户偏好轻松交流，可以更加亲近自然\n";
  }
  
  if (traits.humorLevel > 0.6) {
    personalizedAdjustments += "• 用户喜欢幽默，可以适当加入轻松元素\n";
  }
  
  if (traits.directness > 0.7) {
    personalizedAdjustments += "• 用户偏好直接表达，请简洁明了，直击要点\n";
  }
  
  if (traits.analyticalThinking > 0.7) {
    personalizedAdjustments += "• 用户重视深度分析，请提供详细的逻辑推理\n";
  }
  
  if (traits.businessFocus > 0.7) {
    personalizedAdjustments += "• 用户关注商业价值，请多从商业角度分析\n";
  }
  
  if (traits.exampleUsage > 0.6) {
    personalizedAdjustments += "• 用户喜欢具体例子，请多使用实际案例说明\n";
  }
  
  if (traits.analogyUsage > 0.6) {
    personalizedAdjustments += "• 用户喜欢类比，请多使用'就像蜂窝网络一样'等比喻\n";
  }
  
  return basePrompt + personalizedAdjustments;
}

// 增强版NVIDIA响应生成
async function generateEnhancedNvidiaResponse(
  message: string, 
  messages: Message[], 
  model: string,
  personalityInsights: PersonalityTraits
): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
}> {
  const nvidiaClient = new NvidiaModelClient();
  
  try {
    // 根据个性特征智能选择模型
    const selectedModel = selectOptimalModel(personalityInsights, model);
    
    let response;
    if (selectedModel.includes('nemotron')) {
      response = await nvidiaClient.callNemotron(messages, {
        temperature: 0.8,
        maxTokens: 2048,
        enableThinking: true,
        reasoningBudget: 1024
      });
    } else if (selectedModel.includes('kimi')) {
      response = await nvidiaClient.callKimi25(messages, {
        temperature: 0.9,
        maxTokens: 2048,
        thinking: true
      });
    } else {
      response = await nvidiaClient.callGLM47(messages, {
        temperature: 0.8,
        maxTokens: 2048,
        enableThinking: true
      });
    }

    const content = response.choices?.[0]?.message?.content || '';
    const reasoning = response.choices?.[0]?.message?.reasoning_content || '';

    return {
      answer: content || '抱歉，我现在无法生成回复，请稍后再试。',
      thinking: reasoning || `使用${selectedModel}进行个性化分析`,
      relatedArticles: []
    };

  } catch (error) {
    console.error('增强版NVIDIA模型调用失败:', error);
    return generateSimpleResponse(message);
  }
}

// 智能模型选择
function selectOptimalModel(traits: PersonalityTraits, requestedModel: string): string {
  if (requestedModel !== 'auto') {
    return requestedModel;
  }
  
  // 基于个性特征选择最适合的模型
  if (traits.analyticalThinking > 0.7 && traits.businessFocus > 0.6) {
    return 'nemotron'; // 深度分析
  } else if (traits.creativityLevel > 0.6) {
    return 'kimi2.5'; // 创意生成
  } else if (traits.technicalDepth > 0.7) {
    return 'glm4.7'; // 技术对话
  } else {
    return 'glm4.7'; // 默认选择
  }
}

// 其他辅助函数
function getModelRecommendation(traits: PersonalityTraits): string {
  const selectedModel = selectOptimalModel(traits, 'auto');
  const reasons = [];
  
  if (selectedModel === 'nemotron') {
    reasons.push('深度分析能力强');
  }
  if (selectedModel === 'kimi2.5') {
    reasons.push('创意生成优秀');
  }
  if (selectedModel === 'glm4.7') {
    reasons.push('对话体验佳');
  }
  
  return `推荐使用${selectedModel}模型，因为${reasons.join('、')}`;
}

function calculateLearningProgress(interactionCount: number): number {
  return Math.min(interactionCount * 5, 100);
}

function calculateAdaptationLevel(traits: PersonalityTraits): number {
  const traitValues = Object.values(traits);
  const avgTrait = traitValues.reduce((sum, val) => sum + val, 0) / traitValues.length;
  return Math.round(avgTrait * 100);
}

// 简化的辅助函数
async function generateEnhancedResponse(message: string, history: Message[]): Promise<any> {
  return generateSimpleResponse(message);
}

async function handleMultimodalMessage(message: string): Promise<any> {
  return {
    answer: `我看到您上传了多媒体内容。基于增强版分析，我会提供更精准的回复。`,
    thinking: '增强版多模态分析',
    relatedArticles: []
  };
}

function generateSimpleResponse(message: string): {
  answer: string;
  thinking: string;
  relatedArticles: string[];
} {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('你好') || messageLower.includes('hello')) {
    return {
      answer: '你好！我是增强版飘叔AI助手，现在具备了更强的个性化学习能力。我会根据您的交流风格调整回复方式。请告诉我您想了解什么？',
      thinking: '用户打招呼，介绍增强功能',
      relatedArticles: []
    };
  }
  
  return {
    answer: `感谢您的问题！作为增强版飘叔AI，我正在分析您的交流特点。关于"${message}"，我会根据您的个性特征提供最适合的分析和建议。`,
    thinking: `增强版个性化分析用户问题："${message}"`,
    relatedArticles: []
  };
}