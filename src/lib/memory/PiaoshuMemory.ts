import { db } from '@/lib/db';

// 飘叔专用长期记忆系统（简化版，使用内存存储）
export class PiaoshuMemory {
  private conversationMemories: Map<string, any[]> = new Map();
  private userPreferences: Map<string, any[]> = new Map();
  private knowledgeAssociations: Map<string, any[]> = new Map();

  constructor() {
    console.log('飘叔记忆系统初始化（内存模式）');
  }

  // 初始化记忆集合
  async initialize() {
    try {
      // 从数据库加载现有记忆
      await this.loadExistingMemories();
      console.log('飘叔记忆系统初始化成功');
    } catch (error) {
      console.error('记忆系统初始化失败:', error);
    }
  }

  // 从数据库加载现有记忆
  private async loadExistingMemories() {
    try {
      // 加载最近的对话记忆
      const recentConversations = await db.conversation.findMany({
        take: 100,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // 转换为记忆格式
      for (const conv of recentConversations) {
        const userId = conv.userId;
        const memories = this.conversationMemories.get(userId) || [];
        
        for (const msg of conv.messages) {
          memories.push({
            id: `conv_${msg.id}`,
            content: msg.content,
            role: msg.role,
            timestamp: msg.createdAt,
            conversationId: conv.id,
            type: 'conversation'
          });
        }
        
        this.conversationMemories.set(userId, memories);
      }

      // 加载用户兴趣作为偏好记忆
      const userInterests = await db.userInterest.findMany({
        take: 200,
        orderBy: { score: 'desc' }
      });

      for (const interest of userInterests) {
        const userId = interest.userId;
        const preferences = this.userPreferences.get(userId) || [];
        
        preferences.push({
          id: `pref_${interest.id}`,
          content: `用户对"${interest.category}"感兴趣`,
          category: interest.category,
          score: interest.score,
          timestamp: interest.lastUpdated,
          type: 'preference'
        });
        
        this.userPreferences.set(userId, preferences);
      }

    } catch (error) {
      console.error('加载现有记忆失败:', error);
    }
  }

  // 存储对话记忆
  async storeConversation(userId: string, conversation: {
    id: string;
    userMessage: string;
    assistantMessage: string;
    context?: string;
    timestamp: Date;
    sentiment?: string;
    topics?: string[];
  }) {
    try {
      const memories = this.conversationMemories.get(userId) || [];
      
      // 添加用户消息记忆
      memories.push({
        id: `conv_user_${conversation.id}`,
        content: conversation.userMessage,
        role: 'user',
        timestamp: conversation.timestamp,
        conversationId: conversation.id,
        type: 'conversation',
        sentiment: conversation.sentiment,
        topics: conversation.topics
      });

      // 添加助手回复记忆
      memories.push({
        id: `conv_assistant_${conversation.id}`,
        content: conversation.assistantMessage,
        role: 'assistant',
        timestamp: conversation.timestamp,
        conversationId: conversation.id,
        type: 'conversation',
        context: conversation.context
      });

      // 保持最近1000条记忆
      if (memories.length > 1000) {
        memories.splice(0, memories.length - 1000);
      }

      this.conversationMemories.set(userId, memories);
      
      console.log(`对话记忆已存储: ${conversation.id}`);
    } catch (error) {
      console.error('存储对话记忆失败:', error);
    }
  }

  // 存储用户偏好记忆
  async storeUserPreference(userId: string, preference: {
    category: string;
    value: string;
    strength: number;
    context?: string;
    timestamp: Date;
  }) {
    try {
      const preferences = this.userPreferences.get(userId) || [];
      
      preferences.push({
        id: `pref_${Date.now()}`,
        content: `用户偏好: ${preference.category} - ${preference.value}`,
        category: preference.category,
        value: preference.value,
        strength: preference.strength,
        context: preference.context,
        timestamp: preference.timestamp,
        type: 'preference'
      });

      // 保持最近500条偏好记忆
      if (preferences.length > 500) {
        preferences.splice(0, preferences.length - 500);
      }

      this.userPreferences.set(userId, preferences);
      
      console.log(`用户偏好已存储: ${preference.category}`);
    } catch (error) {
      console.error('存储用户偏好失败:', error);
    }
  }

  // 存储知识点关联记忆
  async storeKnowledgeAssociation(userId: string, knowledge: {
    concept: string;
    description: string;
    relatedConcepts: string[];
    userContext?: string;
    importance: number;
    timestamp: Date;
  }) {
    try {
      const knowledgeList = this.knowledgeAssociations.get(userId) || [];
      
      knowledgeList.push({
        id: `know_${Date.now()}`,
        content: `知识概念: ${knowledge.concept} - ${knowledge.description}`,
        concept: knowledge.concept,
        description: knowledge.description,
        relatedConcepts: knowledge.relatedConcepts,
        userContext: knowledge.userContext,
        importance: knowledge.importance,
        timestamp: knowledge.timestamp,
        type: 'knowledge'
      });

      // 保持最近300条知识记忆
      if (knowledgeList.length > 300) {
        knowledgeList.splice(0, knowledgeList.length - 300);
      }

      this.knowledgeAssociations.set(userId, knowledgeList);
      
      console.log(`知识关联已存储: ${knowledge.concept}`);
    } catch (error) {
      console.error('存储知识关联失败:', error);
    }
  }

  // 检索相关记忆（简化版文本匹配）
  async retrieveRelevantMemories(query: string, userId: string, options: {
    type?: 'conversation' | 'preference' | 'knowledge' | 'all';
    limit?: number;
    minSimilarity?: number;
    timeRange?: { start: Date; end: Date };
  } = {}) {
    const { type = 'all', limit = 10 } = options;
    
    try {
      const results: any[] = [];
      const queryLower = query.toLowerCase();
      const keywords = queryLower.split(/\s+/).filter(word => word.length > 1);

      // 检索对话记忆
      if (type === 'conversation' || type === 'all') {
        const conversations = this.conversationMemories.get(userId) || [];
        const relevantConversations = conversations
          .filter(memory => {
            const contentLower = memory.content.toLowerCase();
            return keywords.some(keyword => contentLower.includes(keyword));
          })
          .map(memory => ({
            ...memory,
            similarity: this.calculateTextSimilarity(memory.content, query)
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, Math.ceil(limit / (type === 'all' ? 3 : 1)));
        
        results.push(...relevantConversations);
      }

      // 检索偏好记忆
      if (type === 'preference' || type === 'all') {
        const preferences = this.userPreferences.get(userId) || [];
        const relevantPreferences = preferences
          .filter(memory => {
            const contentLower = memory.content.toLowerCase();
            return keywords.some(keyword => contentLower.includes(keyword));
          })
          .map(memory => ({
            ...memory,
            similarity: this.calculateTextSimilarity(memory.content, query)
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, Math.ceil(limit / (type === 'all' ? 3 : 1)));
        
        results.push(...relevantPreferences);
      }

      // 检索知识记忆
      if (type === 'knowledge' || type === 'all') {
        const knowledge = this.knowledgeAssociations.get(userId) || [];
        const relevantKnowledge = knowledge
          .filter(memory => {
            const contentLower = memory.content.toLowerCase();
            return keywords.some(keyword => contentLower.includes(keyword));
          })
          .map(memory => ({
            ...memory,
            similarity: this.calculateTextSimilarity(memory.content, query)
          }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, Math.ceil(limit / (type === 'all' ? 3 : 1)));
        
        results.push(...relevantKnowledge);
      }

      // 按相似度排序并限制数量
      const finalResults = results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.log(`检索到 ${finalResults.length} 条相关记忆`);
      return finalResults;
    } catch (error) {
      console.error('检索记忆失败:', error);
      return [];
    }
  }

  // 简单的文本相似度计算
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  // 清理过期记忆
  async cleanupExpiredMemories(userId: string, daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // 清理对话记忆
      const conversations = this.conversationMemories.get(userId) || [];
      const filteredConversations = conversations.filter(memory => 
        new Date(memory.timestamp) > cutoffDate
      );
      this.conversationMemories.set(userId, filteredConversations);

      // 清理偏好记忆
      const preferences = this.userPreferences.get(userId) || [];
      const filteredPreferences = preferences.filter(memory => 
        new Date(memory.timestamp) > cutoffDate
      );
      this.userPreferences.set(userId, filteredPreferences);

      // 清理知识记忆
      const knowledge = this.knowledgeAssociations.get(userId) || [];
      const filteredKnowledge = knowledge.filter(memory => 
        new Date(memory.timestamp) > cutoffDate
      );
      this.knowledgeAssociations.set(userId, filteredKnowledge);
      
      console.log(`清理 ${userId} 超过 ${daysToKeep} 天的记忆`);
    } catch (error) {
      console.error('清理记忆失败:', error);
    }
  }

  // 获取用户记忆统计
  async getMemoryStats(userId: string) {
    try {
      const conversations = this.conversationMemories.get(userId) || [];
      const preferences = this.userPreferences.get(userId) || [];
      const knowledge = this.knowledgeAssociations.get(userId) || [];

      return {
        totalConversations: conversations.length,
        totalPreferences: preferences.length,
        totalKnowledge: knowledge.length,
        lastActivity: new Date()
      };
    } catch (error) {
      console.error('获取记忆统计失败:', error);
      return {
        totalConversations: 0,
        totalPreferences: 0,
        totalKnowledge: 0,
        lastActivity: new Date()
      };
    }
  }

  // 备份记忆数据到数据库
  async backupMemoriesToDatabase(userId: string) {
    try {
      const conversations = this.conversationMemories.get(userId) || [];
      const preferences = this.userPreferences.get(userId) || [];
      const knowledge = this.knowledgeAssociations.get(userId) || [];

      // 备份对话记忆
      for (const memory of conversations.slice(-50)) { // 只备份最近50条
        await db.userBehavior.create({
          data: {
            userId,
            articleId: 'memory_backup',
            interactionType: 'memory_conversation',
            metadata: JSON.stringify({
              memoryId: memory.id,
              content: memory.content,
              role: memory.role,
              timestamp: memory.timestamp,
              type: 'conversation'
            }),
          },
        });
      }

      // 备份偏好记忆
      for (const memory of preferences.slice(-20)) { // 只备份最近20条
        await db.userBehavior.create({
          data: {
            userId,
            articleId: 'memory_backup',
            interactionType: 'memory_preference',
            metadata: JSON.stringify({
              memoryId: memory.id,
              content: memory.content,
              category: memory.category,
              strength: memory.strength,
              timestamp: memory.timestamp,
              type: 'preference'
            }),
          },
        });
      }

      // 备份知识记忆
      for (const memory of knowledge.slice(-30)) { // 只备份最近30条
        await db.userBehavior.create({
          data: {
            userId,
            articleId: 'memory_backup',
            interactionType: 'memory_knowledge',
            metadata: JSON.stringify({
              memoryId: memory.id,
              content: memory.content,
              concept: memory.concept,
              importance: memory.importance,
              timestamp: memory.timestamp,
              type: 'knowledge'
            }),
          },
        });
      }

      console.log(`用户 ${userId} 的记忆数据已备份到数据库`);
    } catch (error) {
      console.error('备份记忆数据失败:', error);
    }
  }

  // 从数据库恢复记忆数据
  async restoreMemoriesFromDatabase(userId: string) {
    try {
      // 恢复对话记忆
      const conversationBackups = await db.userBehavior.findMany({
        where: {
          userId,
          interactionType: 'memory_conversation'
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      const conversations = conversationBackups.map(backup => {
        const metadata = JSON.parse(backup.metadata || '{}');
        return {
          id: metadata.memoryId,
          content: metadata.content,
          role: metadata.role,
          timestamp: metadata.timestamp,
          type: 'conversation'
        };
      });

      if (conversations.length > 0) {
        this.conversationMemories.set(userId, conversations);
      }

      // 恢复偏好记忆
      const preferenceBackups = await db.userBehavior.findMany({
        where: {
          userId,
          interactionType: 'memory_preference'
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      const preferences = preferenceBackups.map(backup => {
        const metadata = JSON.parse(backup.metadata || '{}');
        return {
          id: metadata.memoryId,
          content: metadata.content,
          category: metadata.category,
          strength: metadata.strength,
          timestamp: metadata.timestamp,
          type: 'preference'
        };
      });

      if (preferences.length > 0) {
        this.userPreferences.set(userId, preferences);
      }

      // 恢复知识记忆
      const knowledgeBackups = await db.userBehavior.findMany({
        where: {
          userId,
          interactionType: 'memory_knowledge'
        },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      const knowledge = knowledgeBackups.map(backup => {
        const metadata = JSON.parse(backup.metadata || '{}');
        return {
          id: metadata.memoryId,
          content: metadata.content,
          concept: metadata.concept,
          importance: metadata.importance,
          timestamp: metadata.timestamp,
          type: 'knowledge'
        };
      });

      if (knowledge.length > 0) {
        this.knowledgeAssociations.set(userId, knowledge);
      }

      console.log(`用户 ${userId} 的记忆数据已从数据库恢复`);
    } catch (error) {
      console.error('恢复记忆数据失败:', error);
    }
  }

  // 导出记忆数据
  async exportMemories(userId: string): Promise<any> {
    try {
      const conversations = this.conversationMemories.get(userId) || [];
      const preferences = this.userPreferences.get(userId) || [];
      const knowledge = this.knowledgeAssociations.get(userId) || [];

      return {
        userId,
        exportTime: new Date().toISOString(),
        data: {
          conversations,
          preferences,
          knowledge
        },
        stats: {
          totalConversations: conversations.length,
          totalPreferences: preferences.length,
          totalKnowledge: knowledge.length
        }
      };
    } catch (error) {
      console.error('导出记忆数据失败:', error);
      return null;
    }
  }

  // 导入记忆数据
  async importMemories(userId: string, memoryData: any): Promise<boolean> {
    try {
      if (memoryData.data) {
        if (memoryData.data.conversations) {
          this.conversationMemories.set(userId, memoryData.data.conversations);
        }
        if (memoryData.data.preferences) {
          this.userPreferences.set(userId, memoryData.data.preferences);
        }
        if (memoryData.data.knowledge) {
          this.knowledgeAssociations.set(userId, memoryData.data.knowledge);
        }
      }

      console.log(`用户 ${userId} 的记忆数据已导入`);
      return true;
    } catch (error) {
      console.error('导入记忆数据失败:', error);
      return false;
    }
  }
}

// 单例实例
let piaoshuMemory: PiaoshuMemory | null = null;

export async function getPiaoshuMemory(): Promise<PiaoshuMemory> {
  if (!piaoshuMemory) {
    piaoshuMemory = new PiaoshuMemory();
    await piaoshuMemory.initialize();
  }
  return piaoshuMemory;
}