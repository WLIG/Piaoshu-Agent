import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 示例文章数据
const sampleArticles = [
  {
    title: '什么是飘叔Agent？',
    content: `飘叔Agent是一个基于人工智能的智能知识助手系统。它能够：

1. 智能问答：基于81篇文章内容，精准回答用户问题
2. 个性化推荐：根据用户阅读行为，智能推荐相关内容
3. 多模态交互：支持语音、图像、文本等多种交互方式
4. 知识图谱：构建文章间的关联关系，深度理解内容

飘叔Agent的核心是"自我进化"能力，通过用户反馈不断优化推荐算法和问答质量。`,
    summary: '飘叔Agent是一个基于AI的智能知识助手，具备问答、推荐、多模态交互和自我进化能力。',
    coverImage: null,
    author: 'Piaoshu',
    tags: '介绍,Agent,AI',
    category: '系统介绍',
    difficulty: 1,
    publishedAt: new Date('2024-01-01').toISOString(),
  },
  {
    title: 'AI技术如何改变阅读体验',
    content: `AI技术正在深刻改变我们的阅读体验：

**个性化推荐**
传统阅读是被动接受内容，AI推荐让我们主动发现感兴趣的内容。通过分析阅读时长、点击行为、分享偏好，AI可以精准推荐符合用户兴趣的文章。

**智能问答**
阅读过程中遇到疑问，可以立即提问。AI基于文章内容提供准确答案，就像身边有一位随时待命的知识专家。

**多模态交互**
不再局限于文字阅读。语音输入让提问更便捷，图像识别让内容更丰富，TTS技术让阅读更轻松。

**知识关联**
AI能够发现文章间的隐含联系，构建知识网络，帮助读者建立系统性的知识体系。

这些技术让阅读从单向接收变成了双向互动，从被动发现变成了主动探索。`,
    summary: 'AI技术通过个性化推荐、智能问答、多模态交互和知识关联，彻底改变了传统的阅读体验。',
    coverImage: null,
    author: 'Piaoshu',
    tags: 'AI,阅读,技术,体验',
    category: '技术分享',
    difficulty: 2,
    publishedAt: new Date('2024-01-02').toISOString(),
  },
  {
    title: '推荐系统的核心原理',
    content: `推荐系统的核心原理可以概括为：理解用户、理解内容、匹配需求。

**用户画像构建**
通过收集用户的行为数据：
- 阅读时长：反映内容的吸引程度
- 点赞/收藏：表达明确的偏好
- 分享：表示认可和价值认同
- 滚动深度：衡量内容完整性

**内容特征提取**
每篇文章都有多维特征：
- 文本主题：使用NLP技术提取
- 分类标签：人工或自动标注
- 阅读难度：基于词汇和句子结构
- 热门程度：基于阅读和互动数据

**匹配算法**
1. 协同过滤：找到相似用户，推荐他们喜欢的内容
2. 内容推荐：基于内容相似度推荐
3. 混合推荐：结合多种策略，提高推荐多样性

**动态衰减**
用户兴趣会随时间变化：
- 活跃用户：兴趣更新快，权重衰减快
- 沉默用户：兴趣稳定，权重衰减慢
- 时效性：新鲜内容给予一定权重提升

推荐系统的目标是：在对的时间，推对的内容，给对的人。`,
    summary: '推荐系统通过构建用户画像、提取内容特征、匹配需求和动态衰减算法，实现精准的内容推荐。',
    coverImage: null,
    author: 'Piaoshu',
    tags: '推荐系统,算法,用户画像',
    category: '技术分享',
    difficulty: 3,
    publishedAt: new Date('2024-01-03').toISOString(),
  },
  {
    title: '多模态AI的应用场景',
    content: `多模态AI是指能够同时处理和理解多种类型数据的AI系统，包括文本、语音、图像、视频等。

**语音交互（ASR + TTS）**
- 语音输入：将语音转换为文本，方便用户提问
- 语音输出：将文本转换为自然语音，解放双眼双手

应用场景：
- 驾车时的语音助手
- 视障人士的无障碍访问
- 学习时的朗读功能

**图像理解（VLM）**
- 内容识别：理解图片中的物体和场景
- OCR：提取图片中的文字信息
- 图文问答：基于图片内容回答问题

应用场景：
- 拍照识别文章
- 提取扫描件内容
- 视觉辅助学习

**视频处理**
- 关键帧提取：从视频中提取重要画面
- 内容总结：生成视频的文字摘要
- 智能搜索：基于内容检索视频

应用场景：
- 视频内容检索
- 自动生成字幕
- 视频学习助手

**跨模态关联**
- 图文匹配：理解图片与文字的关联
- 视听协同：结合视频和音频理解内容
- 多模态检索：用一种模态查询另一种模态

多模态AI让信息获取更加自然和高效，符合人类的感知习惯。`,
    summary: '多模态AI整合语音、图像、视频等多种输入方式，提供更自然、更智能的交互体验。',
    coverImage: null,
    author: 'Piaoshu',
    tags: '多模态,ASR,TTS,VLM,应用',
    category: '技术分享',
    difficulty: 2,
    publishedAt: new Date('2024-01-04').toISOString(),
  },
  {
    title: '知识图谱的价值',
    content: `知识图谱是用图结构表示实体及其关系的知识系统，在飘叔Agent中扮演重要角色。

**实体识别**
从文章中提取关键实体：
- 人物：作者、提及的人物
- 概念：重要术语、理论
- 事件：历史事件、重要时刻
- 地点：地理位置、机构组织

**关系抽取**
识别实体间的关系：
- 相关：概念间的关联
- 属于：分类关系
- 反对：观点对立
- 提及：在同一文中出现

**知识推理**
基于关系进行推理：
- 传递推理：A→B，B→C，则A→C
- 聚类推理：同一关系的实体形成概念群
- 关联推理：通过多个路径连接的实体关系更紧密

**应用场景**
1. 精准检索：找到直接和间接相关的内容
2. 深度问答：理解问题涉及的实体网络
3. 知识推荐：推荐相关联的知识点
4. 冲突检测：发现不同文章中的观点差异

知识图谱让知识从碎片化变成网络化，从孤立存在变成相互关联。`,
    summary: '知识图谱通过实体识别、关系抽取和知识推理，将碎片化知识构建成网络化的知识体系。',
    coverImage: null,
    author: 'Piaoshu',
    tags: '知识图谱,实体,关系,推理',
    category: '技术分享',
    difficulty: 3,
    publishedAt: new Date('2024-01-05').toISOString(),
  },
  {
    title: '如何高效使用飘叔Agent',
    content: `掌握这些技巧，可以让飘叔Agent更好地为您服务：

**提问技巧**
1. 明确具体：避免模糊提问，明确您想了解的内容
   - 不好："推荐一篇文章"
   - 好："推荐一篇关于推荐算法的文章"

2. 提供上下文：说明您的背景和需求
   - "我是产品经理，想了解推荐系统的商业价值"

3. 逐步深入：从简单问题开始，逐步深入
   - 先问"什么是推荐系统"，再问"推荐系统如何优化"

**阅读习惯**
1. 及时反馈：对推荐内容点赞或跳过，帮助系统了解您
2. 完整阅读：深度阅读会提高相关内容推荐权重
3. 多样探索：尝试不同分类，拓展知识面

**功能使用**
1. 语音输入：开车或忙碌时使用语音更方便
2. 图片提问：遇到不懂的内容，拍照直接问
3. 收藏整理：将重要内容收藏，方便回顾

**最佳实践**
- 每天花10-15分钟浏览推荐内容
- 对感兴趣的内容深入阅读并提问
- 定期回顾收藏的文章
- 分享有价值的内容给朋友

飘叔Agent越用越懂您，关键是持续互动和反馈。`,
    summary: '掌握提问技巧、养成良好的阅读习惯、善用各种功能，可以让飘叔Agent更好地为您服务。',
    coverImage: null,
    author: 'Piaoshu',
    tags: '使用技巧,最佳实践',
    category: '使用指南',
    difficulty: 1,
    publishedAt: new Date('2024-01-06').toISOString(),
  },
];

// POST /api/seed - 初始化示例数据
export async function POST() {
  try {
    let created = 0;
    let skipped = 0;

    for (const article of sampleArticles) {
      const existing = await db.article.findFirst({
        where: { title: article.title },
      });

      if (!existing) {
        await db.article.create({
          data: article,
        });
        created++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        created,
        skipped,
        total: sampleArticles.length,
      },
      message: `已创建 ${created} 篇文章，跳过 ${skipped} 篇已存在的文章`,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}

// GET /api/seed - 查看数据状态
export async function GET() {
  try {
    const count = await db.article.count();
    const articles = await db.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        total: count,
        recent: articles,
      },
    });
  } catch (error) {
    console.error('Error fetching seed status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seed status' },
      { status: 500 }
    );
  }
}
