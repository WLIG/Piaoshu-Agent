import { db } from '@/lib/db';
import { getPiaoshuMemory } from '@/lib/memory/PiaoshuMemory';
import { generatePiaoshuResponse, PIAOSHU_PERSONALITY } from '@/lib/personality/PiaoshuPersonality';
import { generateResponse } from './llm';

// RAG（检索增强生成）核心逻辑

interface RAGResult {
  context: string;
  relatedArticles: Array<{
    id: string;
    title: string;
    summary: string;
    relevanceScore: number;
  }>;
}

interface EnhancedRAGResult extends RAGResult {
  memories: any[];
  personalityContext: string;
  responseType: 'analysis' | 'explanation' | 'comparison' | 'prediction';
}

// 从文章库中检索相关内容
export async function retrieveRelevantContent(
  query: string,
  topK: number = 3
): Promise<RAGResult> {
  try {
    // 简单的关键词匹配（生产环境应使用向量搜索）
    const keywords = query
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .slice(0, 5);

    // 搜索相关文章
    const articles = await db.article.findMany({
      where: {
        OR: keywords.map((keyword) => ({
          OR: [
            { title: { contains: keyword } },
            { content: { contains: keyword } },
            { summary: { contains: keyword } },
            { tags: { contains: keyword } },
          ],
        })),
      },
      take: topK * 2, // 获取更多候选，然后排序
      orderBy: { viewCount: 'desc' },
    });

    // 简单的相关性评分
    const scoredArticles = articles.map((article) => {
      let score = 0;
      const content = `${article.title} ${article.summary} ${article.tags} ${article.content}`.toLowerCase();
      const queryLower = query.toLowerCase();

      // 关键词匹配得分
      keywords.forEach((keyword) => {
        const matches = (content.match(new RegExp(keyword, 'gi')) || []).length;
        score += matches * 10;
      });

      // 标题匹配加分
      if (article.title.toLowerCase().includes(queryLower)) {
        score += 50;
      }

      // 摘要匹配加分
      if (article.summary?.toLowerCase().includes(queryLower)) {
        score += 30;
      }

      // 标签匹配加分
      if (article.tags.toLowerCase().includes(queryLower)) {
        score += 20;
      }

      // 浏览量作为热度权重
      score += Math.log10(article.viewCount + 1) * 5;

      return {
        ...article,
        relevanceScore: score,
      };
    });

    // 按相关性排序并取前topK
    const topArticles = scoredArticles
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK);

    // 构建上下文
    const context = topArticles
      .map((article, index) => {
        return `[文章${index + 1}] ${article.title}\n${article.summary}\n内容：${article.content.slice(0, 500)}...`;
      })
      .join('\n\n');

    return {
      context,
      relatedArticles: topArticles.map((article) => ({
        id: article.id,
        title: article.title,
        summary: article.summary || '',
        relevanceScore: article.relevanceScore,
      })),
    };
  } catch (error) {
    console.error('Error in retrieveRelevantContent:', error);
    return {
      context: '',
      relatedArticles: [],
    };
  }
}

// 增强的RAG检索（集成记忆和人格）
export async function enhancedRetrieveContent(
  query: string,
  userId: string = 'anonymous',
  topK: number = 3
): Promise<EnhancedRAGResult> {
  try {
    // 1. 基础文章检索
    const basicRAG = await retrieveRelevantContent(query, topK);
    
    // 2. 检索用户记忆
    const memory = await getPiaoshuMemory();
    const memories = await memory.retrieveRelevantMemories(query, userId, {
      type: 'all',
      limit: 5,
      minSimilarity: 0.6
    });

    // 3. 分析查询类型，确定回复类型
    const responseType = analyzeQueryType(query);

    // 4. 构建人格化上下文
    const personalityContext = buildPersonalityContext(query, memories);

    return {
      ...basicRAG,
      memories,
      personalityContext,
      responseType
    };
  } catch (error) {
    console.error('Error in enhancedRetrieveContent:', error);
    const basicRAG = await retrieveRelevantContent(query, topK);
    return {
      ...basicRAG,
      memories: [],
      personalityContext: '',
      responseType: 'analysis'
    };
  }
}

// 分析查询类型
function analyzeQueryType(query: string): 'analysis' | 'explanation' | 'comparison' | 'prediction' {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('什么是') || queryLower.includes('如何理解') || queryLower.includes('解释')) {
    return 'explanation';
  }
  
  if (queryLower.includes('对比') || queryLower.includes('比较') || queryLower.includes('区别')) {
    return 'comparison';
  }
  
  if (queryLower.includes('未来') || queryLower.includes('趋势') || queryLower.includes('预测')) {
    return 'prediction';
  }
  
  return 'analysis';
}

// 构建人格化上下文
function buildPersonalityContext(query: string, memories: any[]): string {
  const expertise = PIAOSHU_PERSONALITY.expertise;
  const relevantExpertise = expertise.filter(exp => 
    query.toLowerCase().includes(exp.toLowerCase())
  );
  
  let context = '';
  
  if (relevantExpertise.length > 0) {
    context += `专业领域: ${relevantExpertise.join(', ')}\n`;
  }
  
  if (memories.length > 0) {
    const recentMemories = memories.slice(0, 2);
    context += `相关记忆: ${recentMemories.map(m => m.content.slice(0, 100)).join('; ')}\n`;
  }
  
  return context;
}

// 构建系统提示词
export function buildSystemPrompt(context: string): string {
  return `你是飘叔Agent，一个基于文章内容的智能知识助手。你的任务是：

1. 基于以下文章内容回答用户问题
2. 如果文章中没有相关信息，诚实地告诉用户
3. 回答要准确、简洁、有条理
4. 适当引用文章内容来支持你的回答
5. 保持友好、专业的语气

参考文章内容：
${context || '（暂无相关文章内容）'}

请基于以上内容回答用户的问题。`;
}

// 构建飘叔风格的系统提示词
export function buildPiaoshuSystemPrompt(
  context: string, 
  personalityContext: string,
  memories: any[] = []
): string {
  const memoryContext = memories.length > 0 
    ? `\n相关记忆:\n${memories.map(m => `- ${m.content.slice(0, 200)}`).join('\n')}`
    : '';

  return `你是飘叔，一个在商业和技术领域有深度见解的专家。你的特点是：

**人格特征:**
- 商业思维敏锐，善于从商业角度分析问题
- 数据驱动，喜欢用数据和事实说话
- 关注趋势，对行业发展有敏锐洞察
- 实践导向，重视可操作性和落地执行
- 善于类比，用生动的比喻解释复杂概念

**专业领域:**
${PIAOSHU_PERSONALITY.expertise.join(', ')}

**语言风格:**
- 专业而亲和，逻辑清晰
- 经常使用"从商业角度看"、"数据显示"、"趋势表明"等表达
- 喜欢用"就像...一样"的类比方式
- 注重实际应用和可操作性

**知识背景:**
${context || '（暂无相关文章内容）'}

${personalityContext}${memoryContext}

请以飘叔的身份和风格回答用户问题，体现出专业性、实用性和个人特色。`;
}

// 生成RAG增强回答
export async function generateRAGResponse(
  query: string, 
  userId: string = 'anonymous'
): Promise<{
  answer: string;
  thinking: string;
  relatedArticles: string[];
  memories?: any[];
}> {
  try {
    // 1. 增强检索
    const ragResult = await enhancedRetrieveContent(query, userId);
    
    // 2. 构建飘叔风格的系统提示词
    const systemPrompt = buildPiaoshuSystemPrompt(
      ragResult.context,
      ragResult.personalityContext,
      ragResult.memories
    );
    
    // 3. 生成回答
    const response = await generateResponse(systemPrompt, query);
    
    // 4. 应用飘叔人格化处理
    const personalizedAnswer = generatePiaoshuResponse(response.content, {
      topic: extractTopic(query),
      responseType: ragResult.responseType,
      userQuery: query,
      memories: ragResult.memories
    });
    
    // 5. 存储对话记忆
    const memory = await getPiaoshuMemory();
    await memory.storeConversation(userId, {
      id: `conv_${Date.now()}`,
      userMessage: query,
      assistantMessage: personalizedAnswer,
      context: ragResult.context,
      timestamp: new Date(),
      topics: [extractTopic(query)]
    });
    
    return {
      answer: personalizedAnswer,
      thinking: response.thinking,
      relatedArticles: ragResult.relatedArticles.map(a => a.id),
      memories: ragResult.memories
    };
  } catch (error) {
    console.error('Error in generateRAGResponse:', error);
    return {
      answer: '抱歉，我现在无法处理您的问题。请稍后再试。',
      thinking: '系统出现错误',
      relatedArticles: []
    };
  }
}

// 提取话题
function extractTopic(query: string): string {
  const expertise = PIAOSHU_PERSONALITY.expertise;
  const foundTopic = expertise.find(topic => 
    query.toLowerCase().includes(topic.toLowerCase())
  );
  return foundTopic || '通用话题';
}
