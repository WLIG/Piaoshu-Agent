// 飘叔Agent个性化学习系统
// 通过对话分析用户特点，逐渐调整回复风格

interface UserInteraction {
  userId: string;
  message: string;
  response: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | 'neutral';
  context?: string;
}

interface PersonalityTraits {
  // 语言风格
  formalityLevel: number; // 0-1, 0=非常随意, 1=非常正式
  technicalDepth: number; // 0-1, 0=简单易懂, 1=技术深度
  humorLevel: number; // 0-1, 0=严肃, 1=幽默
  directness: number; // 0-1, 0=委婉, 1=直接
  
  // 思维模式
  analyticalThinking: number; // 0-1, 分析性思维
  creativityLevel: number; // 0-1, 创意水平
  practicalFocus: number; // 0-1, 实用性导向
  dataOriented: number; // 0-1, 数据驱动程度
  
  // 专业领域偏好
  businessFocus: number; // 0-1, 商业导向
  techFocus: number; // 0-1, 技术导向
  marketingFocus: number; // 0-1, 营销导向
  strategyFocus: number; // 0-1, 战略导向
  
  // 交流习惯
  exampleUsage: number; // 0-1, 使用例子的频率
  analogyUsage: number; // 0-1, 使用类比的频率
  questionAsking: number; // 0-1, 反问的频率
  encouragement: number; // 0-1, 鼓励性语言的使用
}

interface LearningPattern {
  pattern: string;
  weight: number;
  category: keyof PersonalityTraits;
  examples: string[];
}

export class PersonalityLearning {
  private userId: string;
  private interactions: UserInteraction[] = [];
  private personalityProfile: PersonalityTraits;
  private learningPatterns: LearningPattern[] = [];

  constructor(userId: string) {
    this.userId = userId;
    this.personalityProfile = this.getDefaultPersonality();
    this.initializeLearningPatterns();
  }

  // 默认飘叔人格
  private getDefaultPersonality(): PersonalityTraits {
    return {
      formalityLevel: 0.6, // 专业但不过分正式
      technicalDepth: 0.7, // 有技术深度
      humorLevel: 0.4, // 适度幽默
      directness: 0.8, // 比较直接
      
      analyticalThinking: 0.9, // 强分析性
      creativityLevel: 0.6, // 中等创意
      practicalFocus: 0.8, // 高实用性
      dataOriented: 0.9, // 高度数据驱动
      
      businessFocus: 0.9, // 强商业导向
      techFocus: 0.8, // 强技术导向
      marketingFocus: 0.6, // 中等营销导向
      strategyFocus: 0.8, // 强战略导向
      
      exampleUsage: 0.7, // 经常使用例子
      analogyUsage: 0.8, // 经常使用类比
      questionAsking: 0.5, // 适度反问
      encouragement: 0.6 // 适度鼓励
    };
  }

  // 初始化学习模式
  private initializeLearningPatterns(): void {
    this.learningPatterns = [
      // 语言风格模式
      {
        pattern: '你好|您好|请问',
        weight: 0.1,
        category: 'formalityLevel',
        examples: ['您好', '请问', '麻烦您']
      },
      {
        pattern: '哈哈|😄|有趣|好玩',
        weight: 0.2,
        category: 'humorLevel',
        examples: ['哈哈', '有意思', '挺好玩的']
      },
      {
        pattern: '直接说|简单点|别绕弯',
        weight: 0.3,
        category: 'directness',
        examples: ['直接说', '简单点', '不用客套']
      },
      
      // 思维模式
      {
        pattern: '分析|数据|统计|趋势',
        weight: 0.4,
        category: 'analyticalThinking',
        examples: ['分析一下', '数据显示', '从趋势看']
      },
      {
        pattern: '创意|想法|灵感|创新',
        weight: 0.3,
        category: 'creativityLevel',
        examples: ['有个想法', '创新思路', '灵感来了']
      },
      {
        pattern: '实用|实际|落地|执行',
        weight: 0.4,
        category: 'practicalFocus',
        examples: ['实际操作', '如何落地', '具体执行']
      },
      
      // 专业领域
      {
        pattern: '商业|生意|盈利|市场',
        weight: 0.5,
        category: 'businessFocus',
        examples: ['商业模式', '市场分析', '盈利点']
      },
      {
        pattern: '技术|代码|算法|架构',
        weight: 0.4,
        category: 'techFocus',
        examples: ['技术方案', '代码实现', '系统架构']
      },
      {
        pattern: '营销|推广|品牌|用户',
        weight: 0.3,
        category: 'marketingFocus',
        examples: ['营销策略', '品牌建设', '用户增长']
      },
      
      // 交流习惯
      {
        pattern: '比如|例如|举个例子',
        weight: 0.3,
        category: 'exampleUsage',
        examples: ['比如说', '举个例子', '就像']
      },
      {
        pattern: '就像|好比|类似于',
        weight: 0.4,
        category: 'analogyUsage',
        examples: ['就像', '好比', '类似于']
      },
      {
        pattern: '你觉得呢|怎么看|你的想法',
        weight: 0.2,
        category: 'questionAsking',
        examples: ['你觉得呢', '你怎么看', '你的想法是']
      }
    ];
  }

  // 分析用户消息，提取个性特征
  analyzeUserMessage(message: string): Partial<PersonalityTraits> {
    const traits: Partial<PersonalityTraits> = {};
    
    this.learningPatterns.forEach(pattern => {
      const regex = new RegExp(pattern.pattern, 'gi');
      const matches = message.match(regex);
      
      if (matches) {
        const influence = matches.length * pattern.weight * 0.1; // 调整影响程度
        traits[pattern.category] = influence;
      }
    });

    return traits;
  }

  // 记录交互并学习
  async recordInteraction(interaction: UserInteraction): Promise<void> {
    this.interactions.push(interaction);
    
    // 分析用户消息特征
    const userTraits = this.analyzeUserMessage(interaction.message);
    
    // 更新个性档案
    this.updatePersonalityProfile(userTraits);
    
    // 保存到数据库（如果需要持久化）
    await this.savePersonalityProfile();
  }

  // 更新个性档案
  private updatePersonalityProfile(newTraits: Partial<PersonalityTraits>): void {
    const learningRate = 0.05; // 学习速度，避免过度调整
    
    Object.entries(newTraits).forEach(([key, value]) => {
      if (value !== undefined) {
        const currentValue = this.personalityProfile[key as keyof PersonalityTraits];
        // 使用加权平均更新
        this.personalityProfile[key as keyof PersonalityTraits] = 
          currentValue * (1 - learningRate) + value * learningRate;
      }
    });
  }

  // 根据学习到的个性生成回复风格提示
  generatePersonalityPrompt(): string {
    const traits = this.personalityProfile;
    
    let prompt = "你是飘叔，请根据以下个性特征调整回复风格：\n\n";
    
    // 语言风格
    if (traits.formalityLevel > 0.7) {
      prompt += "• 使用较为正式的语言，多用敬语\n";
    } else if (traits.formalityLevel < 0.4) {
      prompt += "• 使用轻松随意的语言，更加亲近\n";
    }
    
    if (traits.humorLevel > 0.6) {
      prompt += "• 适当加入幽默元素，让对话更轻松\n";
    }
    
    if (traits.directness > 0.7) {
      prompt += "• 直接表达观点，不要过度铺垫\n";
    }
    
    // 思维模式
    if (traits.analyticalThinking > 0.8) {
      prompt += "• 提供深入的分析和逻辑推理\n";
    }
    
    if (traits.dataOriented > 0.8) {
      prompt += "• 多引用数据和事实支撑观点\n";
    }
    
    if (traits.practicalFocus > 0.7) {
      prompt += "• 重点关注实用性和可操作性\n";
    }
    
    // 专业领域
    if (traits.businessFocus > 0.8) {
      prompt += "• 从商业角度分析问题，关注商业价值\n";
    }
    
    if (traits.techFocus > 0.7) {
      prompt += "• 提供技术深度，但保持易懂\n";
    }
    
    // 交流习惯
    if (traits.exampleUsage > 0.6) {
      prompt += "• 经常使用具体例子来说明观点\n";
    }
    
    if (traits.analogyUsage > 0.7) {
      prompt += "• 善用类比和比喻来解释复杂概念\n";
    }
    
    if (traits.questionAsking > 0.6) {
      prompt += "• 适当反问，引导用户思考\n";
    }
    
    prompt += "\n保持飘叔的核心特色：商业思维、数据驱动、实用导向。";
    
    return prompt;
  }

  // 获取个性化的系统提示词
  getPersonalizedSystemPrompt(): string {
    const basePrompt = `你是飘叔，一个在商业和技术领域有深度见解的专家。`;
    const personalityPrompt = this.generatePersonalityPrompt();
    
    return `${basePrompt}\n\n${personalityPrompt}`;
  }

  // 分析对话历史，识别用户偏好
  analyzeConversationPatterns(): any {
    if (this.interactions.length < 5) {
      return { status: 'insufficient_data', message: '需要更多对话数据' };
    }

    const analysis = {
      totalInteractions: this.interactions.length,
      averageMessageLength: 0,
      commonTopics: [] as string[],
      preferredStyle: '',
      learningProgress: this.calculateLearningProgress()
    };

    // 计算平均消息长度
    const totalLength = this.interactions.reduce((sum, interaction) => 
      sum + interaction.message.length, 0);
    analysis.averageMessageLength = Math.round(totalLength / this.interactions.length);

    // 识别常见话题
    const topicKeywords = ['商业', '技术', '营销', '策略', '数据', '分析', '创意', '产品'];
    const topicCounts: { [key: string]: number } = {};
    
    this.interactions.forEach(interaction => {
      topicKeywords.forEach(keyword => {
        if (interaction.message.includes(keyword)) {
          topicCounts[keyword] = (topicCounts[keyword] || 0) + 1;
        }
      });
    });

    analysis.commonTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    // 判断偏好风格
    if (this.personalityProfile.formalityLevel > 0.7) {
      analysis.preferredStyle = '正式专业';
    } else if (this.personalityProfile.humorLevel > 0.6) {
      analysis.preferredStyle = '轻松幽默';
    } else if (this.personalityProfile.directness > 0.7) {
      analysis.preferredStyle = '直接务实';
    } else {
      analysis.preferredStyle = '平衡适中';
    }

    return analysis;
  }

  // 计算学习进度
  private calculateLearningProgress(): number {
    // 基于交互次数和个性特征变化程度
    const interactionScore = Math.min(this.interactions.length / 50, 1); // 50次交互为满分
    
    // 计算个性特征与默认值的差异
    const defaultTraits = this.getDefaultPersonality();
    let totalDifference = 0;
    let traitCount = 0;
    
    Object.keys(this.personalityProfile).forEach(key => {
      const currentValue = this.personalityProfile[key as keyof PersonalityTraits];
      const defaultValue = defaultTraits[key as keyof PersonalityTraits];
      totalDifference += Math.abs(currentValue - defaultValue);
      traitCount++;
    });
    
    const adaptationScore = Math.min(totalDifference / traitCount / 0.5, 1); // 0.5为最大预期差异
    
    return Math.round((interactionScore * 0.6 + adaptationScore * 0.4) * 100);
  }

  // 保存个性档案到数据库
  private async savePersonalityProfile(): Promise<void> {
    // 这里可以实现数据库保存逻辑
    // 暂时使用localStorage或文件存储
    try {
      const profileData = {
        userId: this.userId,
        personalityProfile: this.personalityProfile,
        lastUpdated: new Date(),
        interactionCount: this.interactions.length
      };
      
      // 可以保存到数据库或文件
      console.log('个性档案已更新:', profileData);
    } catch (error) {
      console.error('保存个性档案失败:', error);
    }
  }

  // 获取当前个性档案
  getPersonalityProfile(): PersonalityTraits {
    return { ...this.personalityProfile };
  }

  // 重置个性档案
  resetPersonality(): void {
    this.personalityProfile = this.getDefaultPersonality();
    this.interactions = [];
  }
}