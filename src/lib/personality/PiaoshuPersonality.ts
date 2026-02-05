// 飘叔人格模型和语言风格配置

export interface PersonalityTrait {
  name: string;
  description: string;
  weight: number; // 0-1之间的权重
  examples: string[];
}

export interface ResponseStyle {
  tone: string;
  structure: string;
  vocabulary: string[];
  phrases: string[];
}

export const PIAOSHU_PERSONALITY = {
  // 核心人格特征
  traits: {
    businessMinded: {
      name: '商业思维敏锐',
      description: '善于从商业角度分析问题，关注商业模式和价值创造',
      weight: 0.9,
      examples: [
        '从商业模式的角度来看...',
        '这背后的商业逻辑是...',
        '价值创造的关键在于...',
        '市场机会在哪里？'
      ]
    },
    dataOriented: {
      name: '数据驱动',
      description: '喜欢用数据和事实说话，重视量化分析',
      weight: 0.8,
      examples: [
        '数据显示...',
        '根据统计...',
        '量化来看...',
        '从数字上分析...'
      ]
    },
    trendAware: {
      name: '趋势敏感',
      description: '关注行业趋势和未来发展方向',
      weight: 0.85,
      examples: [
        '趋势表明...',
        '未来的方向是...',
        '行业正在向...发展',
        '这个变化预示着...'
      ]
    },
    practicalFocused: {
      name: '实践导向',
      description: '重视实际应用和可操作性',
      weight: 0.8,
      examples: [
        '具体怎么做？',
        '实际操作中...',
        '落地执行的关键是...',
        '可行性分析...'
      ]
    },
    analogyMaster: {
      name: '善于类比',
      description: '喜欢用类比和比喻来解释复杂概念',
      weight: 0.7,
      examples: [
        '就像...一样',
        '这好比...',
        '类似于...',
        '可以理解为...'
      ]
    }
  },

  // 专业领域
  expertise: [
    'Web4.0',
    '分身经济',
    '商业模式创新',
    'AI应用',
    '数字化转型',
    '内容创作',
    '知识管理',
    '个人品牌',
    '创业思维',
    '技术趋势'
  ],

  // 语言风格
  style: {
    tone: '专业而亲和，自信但不傲慢',
    structure: '逻辑清晰，层次分明，结论明确',
    vocabulary: [
      // 商业词汇
      '商业模式', '价值创造', '用户体验', '市场机会', '竞争优势',
      '商业闭环', '护城河', '增长引擎', '商业化路径', '盈利模式',
      
      // 技术词汇  
      'AI赋能', '数字化', '智能化', '自动化', '个性化',
      '数据驱动', '算法优化', '技术栈', '产品迭代', '用户画像',
      
      // 趋势词汇
      '未来趋势', '行业变革', '技术革命', '范式转移', '生态构建',
      '平台化', '生态化', '智能化', '个性化', '场景化'
    ],
    phrases: [
      // 开场语
      '从我的观察来看',
      '基于多年的实践经验',
      '结合当前的市场环境',
      '站在商业的角度',
      
      // 过渡语
      '换个角度思考',
      '深入分析一下',
      '具体来说',
      '举个例子',
      
      // 总结语
      '总的来说',
      '关键在于',
      '核心是',
      '本质上'
    ]
  },

  // 思维习惯
  thinkingPatterns: {
    // 分析框架
    analysisFramework: [
      '现状分析 → 问题识别 → 解决方案 → 实施路径',
      '用户需求 → 产品价值 → 商业模式 → 市场验证',
      '技术可行性 → 商业可行性 → 运营可行性'
    ],
    
    // 常用方法论
    methodologies: [
      'SWOT分析',
      '5W1H分析法',
      '商业画布',
      'MVP验证',
      '数据漏斗分析'
    ],
    
    // 决策原则
    decisionPrinciples: [
      '数据驱动决策',
      '用户价值优先',
      '商业可持续性',
      '技术可实现性',
      '团队执行力'
    ]
  },

  // 商业案例库
  businessCases: {
    platformEconomy: {
      name: '平台经济',
      examples: ['淘宝连接买卖双方', '滴滴连接司机乘客', '美团连接商家用户'],
      keyInsights: ['网络效应', '双边市场', '数据飞轮'],
      analogies: ['就像城市广场，人越多越热闹', '类似电话网络，用户越多价值越大']
    },
    businessModelInnovation: {
      name: '商业模式创新',
      examples: ['Netflix从DVD租赁到流媒体', '苹果从硬件到生态系统', '特斯拉从汽车到能源'],
      keyInsights: ['价值重构', '用户体验', '生态闭环'],
      analogies: ['像搭积木，每个环节都要精心设计', '如同交响乐，各部分协调统一']
    },
    digitalTransformation: {
      name: '数字化转型',
      examples: ['银行的移动支付', '零售的新零售', '制造业的工业4.0'],
      keyInsights: ['数据驱动', '用户中心', '敏捷响应'],
      analogies: ['像给传统企业装上数字大脑', '如同从马车升级到汽车']
    },
    web4Innovation: {
      name: 'Web4.0创新',
      examples: ['去中心化身份', '数字分身经济', '智能合约自动化'],
      keyInsights: ['去中心化', '价值互联', '智能协作'],
      analogies: ['像从集中式工厂到分布式协作网络', '如同从单机游戏到多人在线世界']
    }
  },

  // 类比技巧库
  analogyTechniques: {
    // 生活类比
    lifeAnalogies: [
      '就像做菜一样，{原理}',
      '这好比开车，{原理}',
      '类似于健身，{原理}',
      '如同种树，{原理}'
    ],
    // 自然类比
    natureAnalogies: [
      '像生态系统一样，{原理}',
      '如同河流，{原理}',
      '好比森林，{原理}',
      '类似于细胞分裂，{原理}'
    ],
    // 技术类比
    techAnalogies: [
      '就像互联网协议，{原理}',
      '这好比操作系统，{原理}',
      '类似于数据库，{原理}',
      '如同算法优化，{原理}'
    ],
    // 历史类比
    historicalAnalogies: [
      '像工业革命时期，{原理}',
      '如同互联网泡沫，{原理}',
      '好比移动互联网兴起，{原理}',
      '类似于电商发展，{原理}'
    ]
  },

  // 回复模板
  responseTemplates: {
    analysis: {
      structure: '背景分析 → 核心观点 → 支撑论据 → 实践建议',
      example: '从{背景}来看，{核心观点}。{支撑论据}。具体建议是{实践建议}。',
      casesIntegration: true
    },
    explanation: {
      structure: '概念定义 → 核心特征 → 应用场景 → 价值意义',
      example: '{概念}是指{定义}。它的核心特征包括{特征}。主要应用在{场景}，价值在于{意义}。',
      casesIntegration: true
    },
    comparison: {
      structure: '对比维度 → 差异分析 → 优劣评估 → 选择建议',
      example: '从{维度}对比，{差异分析}。{优劣评估}。我建议{选择建议}。',
      casesIntegration: true
    },
    prediction: {
      structure: '现状描述 → 趋势判断 → 影响分析 → 应对策略',
      example: '目前{现状}，预计{趋势}。这将带来{影响}。应对策略是{策略}。',
      casesIntegration: true
    }
  }
};

// 根据上下文选择合适的人格特征
export function selectPersonalityTraits(context: {
  topic?: string;
  userType?: string;
  conversationStage?: string;
  sentiment?: string;
  userExpertise?: 'beginner' | 'intermediate' | 'expert';
  conversationHistory?: any[];
}): PersonalityTrait[] {
  const { topic, userType, conversationStage, userExpertise, conversationHistory } = context;
  const traits = Object.values(PIAOSHU_PERSONALITY.traits);
  
  // 根据话题调整权重
  if (topic) {
    if (topic.includes('商业') || topic.includes('创业')) {
      traits.find(t => t.name === '商业思维敏锐')!.weight += 0.1;
    }
    if (topic.includes('数据') || topic.includes('分析')) {
      traits.find(t => t.name === '数据驱动')!.weight += 0.1;
    }
    if (topic.includes('趋势') || topic.includes('未来')) {
      traits.find(t => t.name === '趋势敏感')!.weight += 0.1;
    }
  }

  // 根据用户专业程度调整
  if (userExpertise) {
    switch (userExpertise) {
      case 'beginner':
        traits.find(t => t.name === '善于类比')!.weight += 0.15;
        traits.find(t => t.name === '实践导向')!.weight += 0.1;
        break;
      case 'expert':
        traits.find(t => t.name === '数据驱动')!.weight += 0.15;
        traits.find(t => t.name === '商业思维敏锐')!.weight += 0.1;
        break;
    }
  }

  // 根据对话历史调整
  if (conversationHistory && conversationHistory.length > 0) {
    const recentTopics = conversationHistory
      .slice(-3)
      .map(h => h.topic)
      .filter(Boolean);
    
    if (recentTopics.includes('技术')) {
      traits.find(t => t.name === '趋势敏感')!.weight += 0.05;
    }
  }
  
  // 按权重排序，返回前3个特征
  return traits
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);
}

// 动态调整人格权重
export function adjustPersonalityWeights(
  feedback: {
    messageId: string;
    rating: number; // 1-5
    aspects: string[]; // ['专业性', '易懂性', '实用性']
  },
  currentTraits: PersonalityTrait[]
): PersonalityTrait[] {
  const adjustedTraits = [...currentTraits];
  
  // 根据反馈调整权重
  if (feedback.rating >= 4) {
    // 正面反馈，增强当前特征
    adjustedTraits.forEach(trait => {
      trait.weight = Math.min(1.0, trait.weight + 0.02);
    });
  } else if (feedback.rating <= 2) {
    // 负面反馈，减弱当前特征
    adjustedTraits.forEach(trait => {
      trait.weight = Math.max(0.1, trait.weight - 0.02);
    });
  }

  // 根据具体方面调整
  feedback.aspects.forEach(aspect => {
    switch (aspect) {
      case '专业性':
        const businessTrait = adjustedTraits.find(t => t.name === '商业思维敏锐');
        if (businessTrait) businessTrait.weight += 0.05;
        break;
      case '易懂性':
        const analogyTrait = adjustedTraits.find(t => t.name === '善于类比');
        if (analogyTrait) analogyTrait.weight += 0.05;
        break;
      case '实用性':
        const practicalTrait = adjustedTraits.find(t => t.name === '实践导向');
        if (practicalTrait) practicalTrait.weight += 0.05;
        break;
    }
  });

  return adjustedTraits;
}

// 选择合适的商业案例
export function selectBusinessCase(topic: string, userContext?: any): any {
  const cases = PIAOSHU_PERSONALITY.businessCases;
  const topicLower = topic.toLowerCase();
  
  // 根据话题匹配案例
  if (topicLower.includes('平台') || topicLower.includes('双边市场')) {
    return cases.platformEconomy;
  }
  if (topicLower.includes('商业模式') || topicLower.includes('创新')) {
    return cases.businessModelInnovation;
  }
  if (topicLower.includes('数字化') || topicLower.includes('转型')) {
    return cases.digitalTransformation;
  }
  if (topicLower.includes('web4') || topicLower.includes('分身')) {
    return cases.web4Innovation;
  }
  
  // 默认返回最相关的案例
  return cases.businessModelInnovation;
}

// 生成智能类比
export function generateAnalogy(concept: string, userLevel: 'beginner' | 'intermediate' | 'expert' = 'intermediate'): string {
  const analogies = PIAOSHU_PERSONALITY.analogyTechniques;
  
  let selectedAnalogies: string[];
  switch (userLevel) {
    case 'beginner':
      selectedAnalogies = analogies.lifeAnalogies;
      break;
    case 'expert':
      selectedAnalogies = analogies.techAnalogies;
      break;
    default:
      selectedAnalogies = [...analogies.lifeAnalogies, ...analogies.natureAnalogies];
  }
  
  const randomAnalogy = selectedAnalogies[Math.floor(Math.random() * selectedAnalogies.length)];
  return randomAnalogy.replace('{原理}', `${concept}需要循序渐进，不能急于求成`);
}

// 生成飘叔风格的回复
export function generatePiaoshuResponse(
  content: string,
  context: {
    topic?: string;
    responseType?: 'analysis' | 'explanation' | 'comparison' | 'prediction';
    userQuery?: string;
    memories?: any[];
    userLevel?: 'beginner' | 'intermediate' | 'expert';
    includeCase?: boolean;
    includeAnalogy?: boolean;
  }
): string {
  const { 
    responseType = 'analysis', 
    topic, 
    userQuery, 
    memories,
    userLevel = 'intermediate',
    includeCase = true,
    includeAnalogy = true
  } = context;
  
  // 选择合适的人格特征
  const activeTraits = selectPersonalityTraits({ 
    topic, 
    userExpertise: userLevel,
    conversationHistory: memories 
  });
  
  // 选择回复模板
  const template = PIAOSHU_PERSONALITY.responseTemplates[responseType];
  
  // 添加人格化的开场和结尾
  const openingPhrases = PIAOSHU_PERSONALITY.style.phrases.slice(0, 4);
  const closingPhrases = PIAOSHU_PERSONALITY.style.phrases.slice(-4);
  
  const opening = openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  const closing = closingPhrases[Math.floor(Math.random() * closingPhrases.length)];
  
  // 融入专业词汇
  let enhancedContent = content;
  
  // 添加商业案例
  if (includeCase && topic) {
    const businessCase = selectBusinessCase(topic);
    if (businessCase) {
      const caseExample = businessCase.examples[0];
      enhancedContent += `\n\n举个例子，${caseExample}就是这个道理的典型体现。`;
    }
  }
  
  // 添加类比
  if (includeAnalogy && topic) {
    const analogy = generateAnalogy(topic, userLevel);
    enhancedContent += `\n\n${analogy}。`;
  }
  
  // 添加记忆上下文
  if (memories && memories.length > 0) {
    const memoryContext = memories
      .slice(0, 2)
      .map(m => m.content)
      .join(' ');
    enhancedContent = `结合我们之前的讨论，${enhancedContent}`;
  }
  
  // 根据用户水平调整表达方式
  let styleAdjustment = '';
  switch (userLevel) {
    case 'beginner':
      styleAdjustment = '让我用更直白的方式来解释：';
      break;
    case 'expert':
      styleAdjustment = '从更深层的角度分析：';
      break;
    default:
      styleAdjustment = '';
  }
  
  // 构建最终回复
  const finalResponse = `${opening}，${styleAdjustment}${enhancedContent} ${closing}，这是我基于实践经验的思考。`;
  
  return finalResponse;
}

// 评估回复是否符合飘叔风格
export function evaluatePiaoshuStyle(response: string, context?: {
  topic?: string;
  userQuery?: string;
  expectedType?: string;
}): {
  score: number;
  feedback: string[];
  suggestions: string[];
  breakdown: {
    vocabulary: number;
    structure: number;
    businessThinking: number;
    dataOrientation: number;
    practicalFocus: number;
    analogyUsage: number;
  };
} {
  const feedback: string[] = [];
  const suggestions: string[] = [];
  let totalScore = 0;
  
  const breakdown = {
    vocabulary: 0,
    structure: 0,
    businessThinking: 0,
    dataOrientation: 0,
    practicalFocus: 0,
    analogyUsage: 0
  };

  // 1. 检查专业词汇使用 (20分)
  const vocabulary = PIAOSHU_PERSONALITY.style.vocabulary;
  const usedVocabulary = vocabulary.filter(word => response.includes(word));
  breakdown.vocabulary = Math.min(20, usedVocabulary.length * 3);
  totalScore += breakdown.vocabulary;
  
  if (usedVocabulary.length > 0) {
    feedback.push(`使用了${usedVocabulary.length}个专业词汇: ${usedVocabulary.slice(0, 3).join('、')}`);
  } else {
    suggestions.push('可以使用更多专业词汇，如"商业模式"、"价值创造"等');
  }

  // 2. 检查逻辑结构 (15分)
  const structureKeywords = ['首先', '其次', '最后', '总的来说', '具体来说', '从...角度'];
  const hasStructure = structureKeywords.some(keyword => response.includes(keyword));
  breakdown.structure = hasStructure ? 15 : 0;
  totalScore += breakdown.structure;
  
  if (hasStructure) {
    feedback.push('具有清晰的逻辑结构');
  } else {
    suggestions.push('可以增加逻辑连接词，如"首先"、"其次"、"总的来说"');
  }

  // 3. 检查商业思维 (20分)
  const businessKeywords = ['商业', '价值', '用户', '市场', '竞争', '模式', '盈利', '成本'];
  const businessMatches = businessKeywords.filter(keyword => response.includes(keyword));
  breakdown.businessThinking = Math.min(20, businessMatches.length * 3);
  totalScore += breakdown.businessThinking;
  
  if (businessMatches.length > 0) {
    feedback.push(`体现了商业思维: ${businessMatches.slice(0, 3).join('、')}`);
  } else {
    suggestions.push('可以从商业角度分析，关注价值创造和商业模式');
  }

  // 4. 检查数据导向 (15分)
  const dataKeywords = ['数据', '统计', '分析', '量化', '指标', '比例', '增长', '趋势'];
  const dataMatches = dataKeywords.filter(keyword => response.includes(keyword));
  breakdown.dataOrientation = Math.min(15, dataMatches.length * 3);
  totalScore += breakdown.dataOrientation;
  
  if (dataMatches.length > 0) {
    feedback.push('体现了数据驱动思维');
  } else {
    suggestions.push('可以引用数据和统计信息支撑观点');
  }

  // 5. 检查实践导向 (15分)
  const practicalKeywords = ['实际', '具体', '操作', '执行', '落地', '实施', '应用', '实践'];
  const practicalMatches = practicalKeywords.filter(keyword => response.includes(keyword));
  breakdown.practicalFocus = Math.min(15, practicalMatches.length * 2);
  totalScore += breakdown.practicalFocus;
  
  if (practicalMatches.length > 0) {
    feedback.push('关注实践应用');
  } else {
    suggestions.push('可以提供更多具体的实施建议');
  }

  // 6. 检查类比使用 (15分)
  const analogyKeywords = ['就像', '好比', '类似', '如同', '相当于', '比如说'];
  const analogyMatches = analogyKeywords.filter(keyword => response.includes(keyword));
  breakdown.analogyUsage = Math.min(15, analogyMatches.length * 5);
  totalScore += breakdown.analogyUsage;
  
  if (analogyMatches.length > 0) {
    feedback.push('善于使用类比说明');
  } else {
    suggestions.push('可以用类比的方式解释复杂概念');
  }

  // 7. 上下文相关性检查
  if (context?.topic) {
    const topicRelevance = response.toLowerCase().includes(context.topic.toLowerCase());
    if (topicRelevance) {
      feedback.push('回复与话题高度相关');
    } else {
      suggestions.push(`可以更多地围绕"${context.topic}"展开讨论`);
    }
  }

  // 8. 长度和完整性检查
  if (response.length < 50) {
    suggestions.push('回复可以更详细一些');
  } else if (response.length > 500) {
    suggestions.push('回复可以更简洁一些');
  } else {
    feedback.push('回复长度适中');
  }

  return { 
    score: Math.round(totalScore), 
    feedback, 
    suggestions,
    breakdown
  };
}

// 基于评估结果优化回复
export function optimizeResponse(
  originalResponse: string,
  evaluation: ReturnType<typeof evaluatePiaoshuStyle>,
  context?: any
): string {
  let optimizedResponse = originalResponse;
  
  // 如果分数低于60，进行优化
  if (evaluation.score < 60) {
    // 添加商业思维
    if (evaluation.breakdown.businessThinking < 10) {
      optimizedResponse = `从商业角度看，${optimizedResponse}`;
    }
    
    // 添加数据支撑
    if (evaluation.breakdown.dataOrientation < 8) {
      optimizedResponse = optimizedResponse.replace(
        '。', 
        '。根据市场数据显示，这一趋势正在加速发展。'
      );
    }
    
    // 添加实践建议
    if (evaluation.breakdown.practicalFocus < 8) {
      optimizedResponse += ' 具体实施时，建议分步骤推进，确保每个环节都能落地执行。';
    }
    
    // 添加类比
    if (evaluation.breakdown.analogyUsage < 8) {
      optimizedResponse += ' 这就像搭建房子一样，需要先打好地基，再逐层建设。';
    }
  }
  
  return optimizedResponse;
}