// 高级个性化学习系统 - 更精准的算法

interface UserMessage {
  content: string;
  timestamp: Date;
  context?: string;
}

interface PersonalityVector {
  // 语言风格维度 (0-1)
  formality: number;        // 正式程度
  humor: number;           // 幽默程度  
  directness: number;      // 直接程度
  politeness: number;      // 礼貌程度
  
  // 认知风格维度 (0-1)
  analytical: number;      // 分析性思维
  creative: number;        // 创造性思维
  practical: number;       // 实用性导向
  theoretical: number;     // 理论性导向
  
  // 专业偏好维度 (0-1)
  business: number;        // 商业导向
  technology: number;      // 技术导向
  marketing: number;       // 营销导向
  strategy: number;        // 战略导向
  
  // 交流习惯维度 (0-1)
  examples: number;        // 使用例子频率
  analogies: number;       // 使用类比频率
  questions: number;       // 提问频率
  encouragement: number;   // 鼓励性语言
  
  // 情感表达维度 (0-1)
  enthusiasm: number;      // 热情程度
  confidence: number;      // 自信程度
  empathy: number;         // 共情能力
  patience: number;        // 耐心程度
}

interface LearningPattern {
  pattern: RegExp;
  weight: number;
  dimension: keyof PersonalityVector;
  direction: 'increase' | 'decrease';
  context?: string[];
}

interface ConversationContext {
  topic: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high';
}

export class AdvancedPersonalityLearning {
  private userId: string;
  private personalityVector: PersonalityVector;
  private messageHistory: UserMessage[] = [];
  private learningPatterns: LearningPattern[] = [];
  private conversationContexts: ConversationContext[] = [];
  private learningRate: number = 0.1;
  private decayRate: number = 0.95; // 历史消息权重衰减

  constructor(userId: string) {
    this.userId = userId;
    this.personalityVector = this.initializePersonalityVector();
    this.initializeLearningPatterns();
  }

  // 初始化个性向量（飘叔的基础特征）
  private initializePersonalityVector(): PersonalityVector {
    return {
      // 语言风格 - 飘叔的基础特征
      formality: 0.6,      // 专业但不过分正式
      humor: 0.4,          // 适度幽默
      directness: 0.8,     // 比较直接
      politeness: 0.7,     // 有礼貌但不客套
      
      // 认知风格 - 飘叔的思维特点
      analytical: 0.9,     // 强分析性
      creative: 0.6,       // 中等创意
      practical: 0.8,      // 高实用性
      theoretical: 0.5,    // 中等理论性
      
      // 专业偏好 - 飘叔的专业领域
      business: 0.9,       // 强商业导向
      technology: 0.8,     // 强技术导向
      marketing: 0.6,      // 中等营销导向
      strategy: 0.8,       // 强战略导向
      
      // 交流习惯 - 飘叔的表达方式
      examples: 0.7,       // 经常使用例子
      analogies: 0.8,      // 经常使用类比
      questions: 0.5,      // 适度反问
      encouragement: 0.6,  // 适度鼓励
      
      // 情感表达 - 飘叔的情感特征
      enthusiasm: 0.7,     // 较高热情
      confidence: 0.8,     // 高自信
      empathy: 0.6,        // 中等共情
      patience: 0.7        // 较高耐心
    };
  }

  // 初始化学习模式
  private initializeLearningPatterns(): void {
    this.learningPatterns = [
      // 语言风格模式
      {
        pattern: /您好|请问|麻烦|谢谢|不好意思|请/g,
        weight: 0.3,
        dimension: 'formality',
        direction: 'increase'
      },
      {
        pattern: /嗨|哈哈|呗|啊|哦|嘛|😄|😂/g,
        weight: 0.4,
        dimension: 'formality',
        direction: 'decrease'
      },
      {
        pattern: /哈哈|有趣|好玩|搞笑|逗|😄|😂|有意思/g,
        weight: 0.5,
        dimension: 'humor',
        direction: 'increase'
      },
      {
        pattern: /直接说|简单点|别绕弯|快点|直说|别废话/g,
        weight: 0.6,
        dimension: 'directness',
        direction: 'increase'
      },
      {
        pattern: /可能|也许|或许|大概|应该|估计/g,
        weight: 0.3,
        dimension: 'directness',
        direction: 'decrease'
      },

      // 认知风格模式
      {
        pattern: /分析|数据|统计|趋势|原因|为什么|如何|逻辑/g,
        weight: 0.4,
        dimension: 'analytical',
        direction: 'increase'
      },
      {
        pattern: /创意|想法|灵感|创新|设计|方案|脑洞/g,
        weight: 0.4,
        dimension: 'creative',
        direction: 'increase'
      },
      {
        pattern: /实用|实际|落地|执行|操作|具体|实操/g,
        weight: 0.4,
        dimension: 'practical',
        direction: 'increase'
      },
      {
        pattern: /理论|概念|原理|框架|模型|体系/g,
        weight: 0.3,
        dimension: 'theoretical',
        direction: 'increase'
      },

      // 专业偏好模式
      {
        pattern: /商业|生意|盈利|市场|客户|收入|成本|ROI|商务/g,
        weight: 0.5,
        dimension: 'business',
        direction: 'increase'
      },
      {
        pattern: /技术|代码|算法|系统|开发|编程|架构|API/g,
        weight: 0.4,
        dimension: 'technology',
        direction: 'increase'
      },
      {
        pattern: /营销|推广|品牌|广告|宣传|传播|用户增长/g,
        weight: 0.4,
        dimension: 'marketing',
        direction: 'increase'
      },
      {
        pattern: /策略|战略|规划|计划|目标|布局|方向/g,
        weight: 0.4,
        dimension: 'strategy',
        direction: 'increase'
      },

      // 交流习惯模式
      {
        pattern: /比如|例如|举例|就像|比方说|拿.*来说/g,
        weight: 0.5,
        dimension: 'examples',
        direction: 'increase'
      },
      {
        pattern: /就像|好比|类似|如同|仿佛|犹如/g,
        weight: 0.5,
        dimension: 'analogies',
        direction: 'increase'
      },
      {
        pattern: /\?|？|怎么|如何|为什么|什么|哪个/g,
        weight: 0.3,
        dimension: 'questions',
        direction: 'increase'
      },
      {
        pattern: /好的|不错|很好|棒|赞|优秀|厉害/g,
        weight: 0.4,
        dimension: 'encouragement',
        direction: 'increase'
      },

      // 情感表达模式
      {
        pattern: /太好了|太棒了|超级|非常|特别|极其|！{2,}/g,
        weight: 0.4,
        dimension: 'enthusiasm',
        direction: 'increase'
      },
      {
        pattern: /肯定|确定|绝对|必须|一定|当然/g,
        weight: 0.3,
        dimension: 'confidence',
        direction: 'increase'
      },
      {
        pattern: /理解|感受|体会|同感|共鸣|感同身受/g,
        weight: 0.4,
        dimension: 'empathy',
        direction: 'increase'
      },
      {
        pattern: /慢慢|仔细|详细|耐心|不急|慢点/g,
        weight: 0.3,
        dimension: 'patience',
        direction: 'increase'
      }
    ];
  }

  // 分析单条消息
  analyzeMessage(message: string): Partial<PersonalityVector> {
    const insights: Partial<PersonalityVector> = {};
    
    this.learningPatterns.forEach(pattern => {
      const matches = message.match(pattern.pattern);
      if (matches) {
        const influence = matches.length * pattern.weight * 0.1;
        const currentValue = insights[pattern.dimension] || 0;
        
        if (pattern.direction === 'increase') {
          insights[pattern.dimension] = Math.min(currentValue + influence, 1.0);
        } else {
          insights[pattern.dimension] = Math.max(currentValue - influence, 0.0);
        }
      }
    });

    return insights;
  }

  // 分析对话上下文
  analyzeConversationContext(message: string): ConversationContext {
    const messageLower = message.toLowerCase();
    
    // 主题识别
    let topic = 'general';
    if (messageLower.includes('商业') || messageLower.includes('生意')) topic = 'business';
    else if (messageLower.includes('技术') || messageLower.includes('代码')) topic = 'technology';
    else if (messageLower.includes('营销') || messageLower.includes('推广')) topic = 'marketing';
    else if (messageLower.includes('策略') || messageLower.includes('规划')) topic = 'strategy';

    // 情感分析
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    const positiveWords = ['好', '棒', '赞', '优秀', '喜欢', '满意'];
    const negativeWords = ['不好', '差', '糟糕', '失望', '问题', '困难'];
    
    const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    // 复杂度分析
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    if (message.length > 200) complexity = 'complex';
    else if (message.length > 50) complexity = 'medium';

    // 紧急程度分析
    let urgency: 'low' | 'medium' | 'high' = 'low';
    const urgentWords = ['急', '快', '马上', '立即', '紧急'];
    if (urgentWords.some(word => messageLower.includes(word))) urgency = 'high';
    else if (messageLower.includes('尽快') || messageLower.includes('及时')) urgency = 'medium';

    return { topic, sentiment, complexity, urgency };
  }

  // 学习用户消息
  learnFromMessage(message: string, context?: string): void {
    const userMessage: UserMessage = {
      content: message,
      timestamp: new Date(),
      context
    };

    this.messageHistory.push(userMessage);
    
    // 分析消息特征
    const messageInsights = this.analyzeMessage(message);
    const conversationContext = this.analyzeConversationContext(message);
    this.conversationContexts.push(conversationContext);

    // 更新个性向量
    this.updatePersonalityVector(messageInsights, conversationContext);

    // 保持历史记录在合理范围内
    if (this.messageHistory.length > 100) {
      this.messageHistory = this.messageHistory.slice(-50);
      this.conversationContexts = this.conversationContexts.slice(-50);
    }
  }

  // 更新个性向量
  private updatePersonalityVector(
    insights: Partial<PersonalityVector>, 
    context: ConversationContext
  ): void {
    // 根据上下文调整学习率
    let contextualLearningRate = this.learningRate;
    
    // 积极情感时学习更快
    if (context.sentiment === 'positive') {
      contextualLearningRate *= 1.2;
    } else if (context.sentiment === 'negative') {
      contextualLearningRate *= 0.8;
    }

    // 复杂消息权重更高
    if (context.complexity === 'complex') {
      contextualLearningRate *= 1.3;
    }

    // 更新个性向量
    Object.entries(insights).forEach(([dimension, value]) => {
      if (value !== undefined) {
        const currentValue = this.personalityVector[dimension as keyof PersonalityVector];
        const newValue = currentValue * (1 - contextualLearningRate) + value * contextualLearningRate;
        
        // 确保值在0-1范围内
        this.personalityVector[dimension as keyof PersonalityVector] = Math.max(0, Math.min(1, newValue));
      }
    });
  }

  // 生成个性化提示词
  generatePersonalizedPrompt(): string {
    const pv = this.personalityVector;
    let prompt = "你是飘叔，请根据用户的个性特征调整回复风格：\n\n";

    // 语言风格调整
    if (pv.formality > 0.7) {
      prompt += "• 使用正式专业的语言，多用敬语和礼貌用词\n";
    } else if (pv.formality < 0.4) {
      prompt += "• 使用轻松随意的语言，更加亲近自然\n";
    }

    if (pv.humor > 0.6) {
      prompt += "• 适当加入幽默元素和轻松的表达\n";
    }

    if (pv.directness > 0.7) {
      prompt += "• 直接表达观点，简洁明了，避免冗长铺垫\n";
    }

    // 认知风格调整
    if (pv.analytical > 0.7) {
      prompt += "• 提供深入的分析和逻辑推理\n";
    }

    if (pv.creative > 0.7) {
      prompt += "• 展现创意思维，提供新颖的观点和解决方案\n";
    }

    if (pv.practical > 0.7) {
      prompt += "• 重点关注实用性和可操作性\n";
    }

    // 专业偏好调整
    if (pv.business > 0.7) {
      prompt += "• 从商业角度分析问题，关注商业价值和ROI\n";
    }

    if (pv.technology > 0.7) {
      prompt += "• 提供技术深度，但保持通俗易懂\n";
    }

    // 交流习惯调整
    if (pv.examples > 0.6) {
      prompt += "• 经常使用具体例子来说明观点\n";
    }

    if (pv.analogies > 0.6) {
      prompt += "• 善用类比和比喻来解释复杂概念\n";
    }

    if (pv.questions > 0.6) {
      prompt += "• 适当反问，引导用户深入思考\n";
    }

    // 情感表达调整
    if (pv.enthusiasm > 0.7) {
      prompt += "• 表现出热情和积极的态度\n";
    }

    if (pv.encouragement > 0.6) {
      prompt += "• 多使用鼓励性语言，给予正面反馈\n";
    }

    prompt += "\n保持飘叔的核心特色：商业思维、数据驱动、实用导向。";
    
    return prompt;
  }

  // 获取个性化统计
  getPersonalityStats(): any {
    const pv = this.personalityVector;
    const messageCount = this.messageHistory.length;
    
    // 计算学习进度
    const learningProgress = Math.min(messageCount * 2, 100);
    
    // 识别主要特征
    const traits = Object.entries(pv)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([trait, value]) => ({
        trait,
        value: Math.round(value * 100),
        level: value > 0.7 ? 'high' : value > 0.4 ? 'medium' : 'low'
      }));

    // 分析对话模式
    const topicDistribution = this.conversationContexts.reduce((acc, context) => {
      acc[context.topic] = (acc[context.topic] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const sentimentDistribution = this.conversationContexts.reduce((acc, context) => {
      acc[context.sentiment] = (acc[context.sentiment] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      learningProgress,
      messageCount,
      topTraits: traits,
      topicDistribution,
      sentimentDistribution,
      personalityVector: Object.fromEntries(
        Object.entries(pv).map(([key, value]) => [key, Math.round(value * 100)])
      )
    };
  }

  // 推荐最适合的模型
  recommendModel(): string {
    const pv = this.personalityVector;
    
    // 基于个性特征推荐模型
    if (pv.analytical > 0.8 && pv.business > 0.7) {
      return 'nvidia/nemotron-3-nano-30b-a3b'; // 深度商业分析
    } else if (pv.creative > 0.7 && pv.marketing > 0.6) {
      return 'moonshotai/kimi-k2.5'; // 创意营销
    } else if (pv.technology > 0.7 && pv.practical > 0.7) {
      return 'z-ai/glm4.7'; // 技术实用
    } else if (pv.formality > 0.7 && pv.business > 0.6) {
      return 'nvidia/llama3-chatqa-1.5-70b'; // 正式商务
    } else {
      return 'z-ai/glm4.7'; // 默认选择
    }
  }

  // 重置学习状态
  reset(): void {
    this.personalityVector = this.initializePersonalityVector();
    this.messageHistory = [];
    this.conversationContexts = [];
  }

  // 导出学习数据
  exportLearningData(): any {
    return {
      userId: this.userId,
      personalityVector: this.personalityVector,
      messageHistory: this.messageHistory.slice(-20), // 只导出最近20条
      conversationContexts: this.conversationContexts.slice(-20),
      stats: this.getPersonalityStats(),
      lastUpdated: new Date().toISOString()
    };
  }

  // 导入学习数据
  importLearningData(data: any): void {
    if (data.personalityVector) {
      this.personalityVector = { ...this.personalityVector, ...data.personalityVector };
    }
    if (data.messageHistory) {
      this.messageHistory = data.messageHistory;
    }
    if (data.conversationContexts) {
      this.conversationContexts = data.conversationContexts;
    }
  }
}