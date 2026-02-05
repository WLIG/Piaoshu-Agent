// 对话记忆和情感智能系统

interface EmotionalState {
  valence: number;      // 情感效价 (-1到1, 负面到正面)
  arousal: number;      // 情感唤醒度 (0到1, 平静到兴奋)
  dominance: number;    // 情感支配度 (0到1, 被动到主动)
  confidence: number;   // 情感识别置信度 (0到1)
}

interface ConversationTurn {
  id: string;
  timestamp: Date;
  userMessage: string;
  assistantResponse: string;
  userEmotion: EmotionalState;
  responseEmotion: EmotionalState;
  topics: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  importance: number; // 0-1, 对话重要性
}

interface ConversationSummary {
  userId: string;
  conversationId: string;
  startTime: Date;
  lastUpdate: Date;
  totalTurns: number;
  mainTopics: string[];
  overallSentiment: 'positive' | 'neutral' | 'negative';
  keyInsights: string[];
  userPreferences: { [key: string]: number };
  emotionalJourney: EmotionalState[];
}

interface MemoryNode {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'goal' | 'concern' | 'achievement';
  importance: number;
  lastAccessed: Date;
  accessCount: number;
  relatedNodes: string[];
  emotionalContext: EmotionalState;
}

export class ConversationMemory {
  private userId: string;
  private conversationId: string;
  private turns: ConversationTurn[] = [];
  private memoryNodes: Map<string, MemoryNode> = new Map();
  private conversationSummary: ConversationSummary;
  private maxTurns: number = 50; // 最大保存轮次
  private maxMemoryNodes: number = 200; // 最大记忆节点数

  constructor(userId: string, conversationId: string) {
    this.userId = userId;
    this.conversationId = conversationId;
    this.conversationSummary = this.initializeConversationSummary();
  }

  private initializeConversationSummary(): ConversationSummary {
    return {
      userId: this.userId,
      conversationId: this.conversationId,
      startTime: new Date(),
      lastUpdate: new Date(),
      totalTurns: 0,
      mainTopics: [],
      overallSentiment: 'neutral',
      keyInsights: [],
      userPreferences: {},
      emotionalJourney: []
    };
  }

  // 情感分析
  analyzeEmotion(text: string): EmotionalState {
    const textLower = text.toLowerCase();
    
    // 简化的情感词典
    const emotionWords = {
      positive: {
        high: ['太好了', '超棒', '完美', '惊喜', '兴奋', '激动', '开心', '满意'],
        medium: ['好的', '不错', '可以', '还行', '满意', '喜欢'],
        low: ['行', '嗯', '好吧']
      },
      negative: {
        high: ['糟糕', '失望', '愤怒', '讨厌', '烦躁', '沮丧'],
        medium: ['不好', '不满', '担心', '困惑', '疑虑'],
        low: ['一般', '还好', '无所谓']
      }
    };

    let valence = 0;
    let arousal = 0;
    let dominance = 0.5; // 默认中性
    let confidence = 0.3; // 基础置信度

    // 计算情感效价
    Object.entries(emotionWords.positive).forEach(([level, words]) => {
      const weight = level === 'high' ? 0.8 : level === 'medium' ? 0.5 : 0.2;
      words.forEach(word => {
        if (textLower.includes(word)) {
          valence += weight;
          confidence += 0.1;
        }
      });
    });

    Object.entries(emotionWords.negative).forEach(([level, words]) => {
      const weight = level === 'high' ? -0.8 : level === 'medium' ? -0.5 : -0.2;
      words.forEach(word => {
        if (textLower.includes(word)) {
          valence += weight;
          confidence += 0.1;
        }
      });
    });

    // 计算唤醒度（基于感叹号、大写字母等）
    const exclamationCount = (text.match(/[!！]/g) || []).length;
    const questionCount = (text.match(/[?？]/g) || []).length;
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    
    arousal = Math.min(1, (exclamationCount * 0.3 + questionCount * 0.2 + capsCount * 0.1) / text.length * 100);

    // 计算支配度（基于命令性语言、确定性表达）
    const commandWords = ['必须', '一定', '应该', '需要', '要求'];
    const uncertainWords = ['可能', '也许', '或许', '大概'];
    
    commandWords.forEach(word => {
      if (textLower.includes(word)) dominance += 0.2;
    });
    
    uncertainWords.forEach(word => {
      if (textLower.includes(word)) dominance -= 0.1;
    });

    return {
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, arousal)),
      dominance: Math.max(0, Math.min(1, dominance)),
      confidence: Math.max(0, Math.min(1, confidence))
    };
  }

  // 提取主题和实体
  extractTopicsAndEntities(text: string): { topics: string[], entities: string[] } {
    const textLower = text.toLowerCase();
    
    // 主题关键词
    const topicKeywords = {
      'business': ['商业', '生意', '盈利', '市场', '客户', '收入', '成本'],
      'technology': ['技术', '代码', '算法', '系统', '开发', '编程'],
      'marketing': ['营销', '推广', '品牌', '广告', '宣传'],
      'strategy': ['策略', '战略', '规划', '计划', '目标'],
      'finance': ['财务', '投资', '资金', '预算', '成本'],
      'product': ['产品', '功能', '设计', '用户体验'],
      'team': ['团队', '人员', '管理', '领导', '协作']
    };

    const topics: string[] = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        topics.push(topic);
      }
    });

    // 简单的实体提取（公司名、人名、产品名等）
    const entities: string[] = [];
    const entityPatterns = [
      /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g, // 英文实体
      /[\u4e00-\u9fa5]{2,}(?:公司|科技|集团|有限公司)/g, // 中文公司名
    ];

    entityPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return { topics, entities };
  }

  // 记录对话轮次
  recordTurn(
    userMessage: string, 
    assistantResponse: string, 
    responseEmotion?: EmotionalState
  ): void {
    const userEmotion = this.analyzeEmotion(userMessage);
    const { topics, entities } = this.extractTopicsAndEntities(userMessage + ' ' + assistantResponse);
    
    const turn: ConversationTurn = {
      id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userMessage,
      assistantResponse,
      userEmotion,
      responseEmotion: responseEmotion || this.generateResponseEmotion(userEmotion),
      topics,
      entities,
      sentiment: this.classifySentiment(userEmotion),
      importance: this.calculateImportance(userMessage, topics, entities)
    };

    this.turns.push(turn);
    this.updateConversationSummary(turn);
    this.extractMemoryNodes(turn);

    // 保持对话轮次在限制范围内
    if (this.turns.length > this.maxTurns) {
      this.turns = this.turns.slice(-this.maxTurns);
    }
  }

  // 生成响应情感
  private generateResponseEmotion(userEmotion: EmotionalState): EmotionalState {
    // 飘叔的情感响应策略：
    // 1. 对积极情感给予积极回应
    // 2. 对消极情感给予支持和理解
    // 3. 保持专业和自信
    
    let responseValence = 0.3; // 默认略微积极
    let responseArousal = 0.4; // 默认中等唤醒
    let responseDominance = 0.7; // 默认较高支配度（专业自信）

    if (userEmotion.valence > 0.3) {
      // 用户积极时，给予积极回应
      responseValence = Math.min(0.8, userEmotion.valence + 0.2);
      responseArousal = Math.min(0.7, userEmotion.arousal + 0.1);
    } else if (userEmotion.valence < -0.3) {
      // 用户消极时，给予支持
      responseValence = 0.2; // 保持轻微积极
      responseArousal = Math.max(0.3, userEmotion.arousal - 0.1); // 降低唤醒度
      responseDominance = 0.6; // 降低支配度，表现理解
    }

    return {
      valence: responseValence,
      arousal: responseArousal,
      dominance: responseDominance,
      confidence: 0.8 // 飘叔的情感表达置信度较高
    };
  }

  // 分类情感
  private classifySentiment(emotion: EmotionalState): 'positive' | 'neutral' | 'negative' {
    if (emotion.valence > 0.2) return 'positive';
    if (emotion.valence < -0.2) return 'negative';
    return 'neutral';
  }

  // 计算重要性
  private calculateImportance(message: string, topics: string[], entities: string[]): number {
    let importance = 0.3; // 基础重要性

    // 消息长度影响重要性
    importance += Math.min(0.3, message.length / 500);

    // 主题数量影响重要性
    importance += topics.length * 0.1;

    // 实体数量影响重要性
    importance += entities.length * 0.05;

    // 特殊关键词提升重要性
    const importantKeywords = ['目标', '计划', '问题', '需求', '决定', '重要'];
    importantKeywords.forEach(keyword => {
      if (message.includes(keyword)) importance += 0.1;
    });

    return Math.min(1, importance);
  }

  // 更新对话摘要
  private updateConversationSummary(turn: ConversationTurn): void {
    this.conversationSummary.totalTurns++;
    this.conversationSummary.lastUpdate = new Date();

    // 更新主要主题
    turn.topics.forEach(topic => {
      if (!this.conversationSummary.mainTopics.includes(topic)) {
        this.conversationSummary.mainTopics.push(topic);
      }
    });

    // 更新整体情感
    const recentTurns = this.turns.slice(-5);
    const avgValence = recentTurns.reduce((sum, t) => sum + t.userEmotion.valence, 0) / recentTurns.length;
    
    if (avgValence > 0.2) this.conversationSummary.overallSentiment = 'positive';
    else if (avgValence < -0.2) this.conversationSummary.overallSentiment = 'negative';
    else this.conversationSummary.overallSentiment = 'neutral';

    // 添加到情感旅程
    this.conversationSummary.emotionalJourney.push(turn.userEmotion);
    if (this.conversationSummary.emotionalJourney.length > 20) {
      this.conversationSummary.emotionalJourney = this.conversationSummary.emotionalJourney.slice(-20);
    }
  }

  // 提取记忆节点
  private extractMemoryNodes(turn: ConversationTurn): void {
    const message = turn.userMessage;
    
    // 提取偏好
    this.extractPreferences(message, turn);
    
    // 提取目标
    this.extractGoals(message, turn);
    
    // 提取关注点
    this.extractConcerns(message, turn);
    
    // 提取成就
    this.extractAchievements(message, turn);
  }

  private extractPreferences(message: string, turn: ConversationTurn): void {
    const preferencePatterns = [
      /我喜欢(.+)/g,
      /我偏好(.+)/g,
      /我倾向于(.+)/g,
      /我更愿意(.+)/g
    ];

    preferencePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addMemoryNode({
            content: match,
            type: 'preference',
            importance: 0.7,
            emotionalContext: turn.userEmotion
          });
        });
      }
    });
  }

  private extractGoals(message: string, turn: ConversationTurn): void {
    const goalPatterns = [
      /我想要(.+)/g,
      /我的目标是(.+)/g,
      /我希望(.+)/g,
      /我计划(.+)/g
    ];

    goalPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addMemoryNode({
            content: match,
            type: 'goal',
            importance: 0.8,
            emotionalContext: turn.userEmotion
          });
        });
      }
    });
  }

  private extractConcerns(message: string, turn: ConversationTurn): void {
    const concernPatterns = [
      /我担心(.+)/g,
      /我困惑(.+)/g,
      /我不确定(.+)/g,
      /问题是(.+)/g
    ];

    concernPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addMemoryNode({
            content: match,
            type: 'concern',
            importance: 0.9,
            emotionalContext: turn.userEmotion
          });
        });
      }
    });
  }

  private extractAchievements(message: string, turn: ConversationTurn): void {
    const achievementPatterns = [
      /我完成了(.+)/g,
      /我成功(.+)/g,
      /我实现了(.+)/g,
      /我达到了(.+)/g
    ];

    achievementPatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.addMemoryNode({
            content: match,
            type: 'achievement',
            importance: 0.8,
            emotionalContext: turn.userEmotion
          });
        });
      }
    });
  }

  // 添加记忆节点
  private addMemoryNode(nodeData: {
    content: string;
    type: 'fact' | 'preference' | 'goal' | 'concern' | 'achievement';
    importance: number;
    emotionalContext: EmotionalState;
  }): void {
    const nodeId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const memoryNode: MemoryNode = {
      id: nodeId,
      content: nodeData.content,
      type: nodeData.type,
      importance: nodeData.importance,
      lastAccessed: new Date(),
      accessCount: 1,
      relatedNodes: [],
      emotionalContext: nodeData.emotionalContext
    };

    this.memoryNodes.set(nodeId, memoryNode);

    // 保持记忆节点数量在限制范围内
    if (this.memoryNodes.size > this.maxMemoryNodes) {
      this.pruneMemoryNodes();
    }
  }

  // 修剪记忆节点
  private pruneMemoryNodes(): void {
    const nodes = Array.from(this.memoryNodes.values());
    
    // 按重要性和最后访问时间排序
    nodes.sort((a, b) => {
      const aScore = a.importance * 0.7 + (Date.now() - a.lastAccessed.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      const bScore = b.importance * 0.7 + (Date.now() - b.lastAccessed.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      return bScore - aScore;
    });

    // 保留前80%的节点
    const keepCount = Math.floor(this.maxMemoryNodes * 0.8);
    const nodesToKeep = nodes.slice(0, keepCount);
    
    this.memoryNodes.clear();
    nodesToKeep.forEach(node => {
      this.memoryNodes.set(node.id, node);
    });
  }

  // 检索相关记忆
  retrieveRelevantMemories(query: string, limit: number = 5): MemoryNode[] {
    const queryLower = query.toLowerCase();
    const relevantNodes: { node: MemoryNode; score: number }[] = [];

    this.memoryNodes.forEach(node => {
      let score = 0;
      
      // 内容相关性
      if (node.content.toLowerCase().includes(queryLower)) {
        score += 0.5;
      }
      
      // 重要性权重
      score += node.importance * 0.3;
      
      // 访问频率权重
      score += Math.min(node.accessCount / 10, 0.2);
      
      // 时间衰减
      const daysSinceAccess = (Date.now() - node.lastAccessed.getTime()) / (1000 * 60 * 60 * 24);
      score *= Math.exp(-daysSinceAccess / 30); // 30天衰减

      if (score > 0.1) {
        relevantNodes.push({ node, score });
      }
    });

    // 排序并返回前N个
    relevantNodes.sort((a, b) => b.score - a.score);
    
    // 更新访问记录
    relevantNodes.slice(0, limit).forEach(({ node }) => {
      node.lastAccessed = new Date();
      node.accessCount++;
    });

    return relevantNodes.slice(0, limit).map(({ node }) => node);
  }

  // 生成上下文感知的提示词
  generateContextAwarePrompt(currentMessage: string): string {
    const relevantMemories = this.retrieveRelevantMemories(currentMessage);
    const recentTurns = this.turns.slice(-3);
    const currentEmotion = this.analyzeEmotion(currentMessage);

    let prompt = "你是飘叔，请根据以下上下文信息调整回复：\n\n";

    // 添加情感上下文
    prompt += `当前用户情感状态：\n`;
    prompt += `- 情感倾向: ${currentEmotion.valence > 0.2 ? '积极' : currentEmotion.valence < -0.2 ? '消极' : '中性'}\n`;
    prompt += `- 兴奋程度: ${currentEmotion.arousal > 0.6 ? '高' : currentEmotion.arousal > 0.3 ? '中' : '低'}\n`;
    prompt += `- 主导性: ${currentEmotion.dominance > 0.6 ? '强' : currentEmotion.dominance > 0.3 ? '中' : '弱'}\n\n`;

    // 添加记忆上下文
    if (relevantMemories.length > 0) {
      prompt += `相关记忆信息：\n`;
      relevantMemories.forEach((memory, index) => {
        prompt += `${index + 1}. [${memory.type}] ${memory.content}\n`;
      });
      prompt += '\n';
    }

    // 添加对话历史上下文
    if (recentTurns.length > 0) {
      prompt += `最近对话内容：\n`;
      recentTurns.forEach((turn, index) => {
        prompt += `${index + 1}. 用户: ${turn.userMessage.slice(0, 100)}...\n`;
        prompt += `   飘叔: ${turn.assistantResponse.slice(0, 100)}...\n`;
      });
      prompt += '\n';
    }

    // 添加整体对话情感趋势
    prompt += `对话整体情感趋势: ${this.conversationSummary.overallSentiment}\n`;
    prompt += `主要讨论话题: ${this.conversationSummary.mainTopics.join(', ')}\n\n`;

    prompt += "请基于以上信息，以飘叔的身份给出个性化、情感智能的回复。";

    return prompt;
  }

  // 获取对话统计
  getConversationStats(): any {
    return {
      summary: this.conversationSummary,
      memoryNodeCount: this.memoryNodes.size,
      memoryByType: this.getMemoryDistribution(),
      emotionalJourney: this.getEmotionalJourney(),
      topicEvolution: this.getTopicEvolution(),
      engagementMetrics: this.getEngagementMetrics()
    };
  }

  private getMemoryDistribution(): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    this.memoryNodes.forEach(node => {
      distribution[node.type] = (distribution[node.type] || 0) + 1;
    });
    return distribution;
  }

  private getEmotionalJourney(): any[] {
    return this.conversationSummary.emotionalJourney.map((emotion, index) => ({
      turn: index + 1,
      valence: Math.round(emotion.valence * 100),
      arousal: Math.round(emotion.arousal * 100),
      dominance: Math.round(emotion.dominance * 100)
    }));
  }

  private getTopicEvolution(): any[] {
    const topicsByTurn: { [turn: number]: string[] } = {};
    this.turns.forEach((turn, index) => {
      topicsByTurn[index] = turn.topics;
    });
    return Object.entries(topicsByTurn).map(([turn, topics]) => ({
      turn: parseInt(turn),
      topics
    }));
  }

  private getEngagementMetrics(): any {
    const totalTurns = this.turns.length;
    if (totalTurns === 0) return {};

    const avgMessageLength = this.turns.reduce((sum, turn) => sum + turn.userMessage.length, 0) / totalTurns;
    const avgImportance = this.turns.reduce((sum, turn) => sum + turn.importance, 0) / totalTurns;
    const topicDiversity = new Set(this.turns.flatMap(turn => turn.topics)).size;

    return {
      totalTurns,
      avgMessageLength: Math.round(avgMessageLength),
      avgImportance: Math.round(avgImportance * 100),
      topicDiversity,
      conversationDuration: Date.now() - this.conversationSummary.startTime.getTime()
    };
  }
}