import { NextRequest, NextResponse } from 'next/server';

// 高级Word文档解析API（需要安装mammoth库）
// 使用方法：npm install mammoth @types/mammoth

// POST /api/upload/parse-advanced - 使用mammoth库解析Word文档
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 检查文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain', // .txt
      'text/markdown', // .md
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload .docx, .doc, .txt, or .md files' },
        { status: 400 }
      );
    }

    let content = '';
    let title = file.name.replace(/\.[^/.]+$/, ''); // 移除文件扩展名作为默认标题

    // 根据文件类型解析内容
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      // 处理纯文本和Markdown文件
      content = await file.text();
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      // 使用mammoth解析.docx文件
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
        
        // 如果有警告，记录但不阻止处理
        if (result.messages.length > 0) {
          console.log('Mammoth warnings:', result.messages);
        }
      } catch (error) {
        console.error('Error parsing Word file with mammoth:', error);
        // 降级到基本解析
        content = await parseDocxBasic(await file.arrayBuffer());
      }
    } else if (file.name.endsWith('.doc')) {
      // .doc文件使用基本解析
      const arrayBuffer = await file.arrayBuffer();
      content = await parseDocBasic(arrayBuffer);
    }

    // 基本内容清理
    content = content.trim();
    
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No content found in the file' },
        { status: 400 }
      );
    }

    // 尝试从内容中提取标题
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      // 如果第一行较短且不以句号结尾，可能是标题
      if (firstLine.length < 100 && !firstLine.endsWith('.') && !firstLine.endsWith('。')) {
        title = firstLine.replace(/^#+\s*/, ''); // 移除Markdown标题标记
        content = lines.slice(1).join('\n').trim(); // 剩余内容
      }
    }

    // 生成摘要（取前200个字符）
    const summary = content.length > 200 
      ? content.substring(0, 200) + '...' 
      : content;

    // 基于内容智能推测分类和标签
    const { category, tags, difficulty } = analyzeContent(content);

    const parsedData = {
      title,
      content,
      summary,
      category,
      tags,
      difficulty,
      author: 'Piaoshu',
      publishedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: `Successfully parsed ${file.name} using advanced parser`
    });

  } catch (error) {
    console.error('Error in advanced file parsing:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse file' },
      { status: 500 }
    );
  }
}

// 基本DOCX解析（降级方案）
async function parseDocxBasic(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('utf8');
    
    // 尝试提取XML中的文本内容
    const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches) {
      return textMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // 如果XML解析失败，尝试简单的文本提取
    return content
      .replace(/[^\x20-\x7E\u4e00-\u9fff]/g, ' ') // 保留ASCII和中文字符
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    throw new Error('Failed to parse DOCX content');
  }
}

// 基本DOC解析
async function parseDocBasic(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('utf8');
    return content
      .replace(/[^\x20-\x7E\u4e00-\u9fff]/g, ' ') // 保留ASCII和中文字符
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    throw new Error('Failed to parse DOC content');
  }
}

// 智能分析内容，推测分类和标签
function analyzeContent(content: string): { category: string; tags: string; difficulty: number } {
  const lowerContent = content.toLowerCase();
  
  // 关键词映射
  const categoryKeywords = {
    '商业分析': ['商业', '市场', '分析', '策略', '营销', '销售', '客户', '竞争', '盈利', 'business', 'market', 'strategy'],
    '技术趋势': ['技术', '科技', '人工智能', 'ai', '机器学习', '云计算', '区块链', '物联网', 'technology', 'tech', 'artificial intelligence'],
    '产品策略': ['产品', '设计', '用户体验', 'ux', 'ui', '产品经理', '需求', '功能', 'product', 'design', 'user experience'],
    '数据科学': ['数据', '统计', '分析', '算法', '模型', '预测', 'data', 'analytics', 'algorithm', 'model'],
    '创业投资': ['创业', '投资', '融资', '股权', '估值', '风险', 'startup', 'investment', 'funding', 'venture'],
    '实践指南': ['指南', '教程', '步骤', '方法', '实践', '操作', 'guide', 'tutorial', 'how to', 'practice']
  };

  let category = '未分类';
  let maxScore = 0;
  const foundTags = new Set<string>();

  // 分析分类
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
        foundTags.add(keyword);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      category = cat;
    }
  }

  // 生成标签
  const tags = Array.from(foundTags).slice(0, 5).join(',');

  // 估算难度（基于内容长度和复杂词汇）
  let difficulty = 1;
  if (content.length > 2000) difficulty++;
  if (content.length > 5000) difficulty++;
  if (/[专业|高级|深度|复杂|advanced|complex|professional]/gi.test(content)) difficulty++;
  if (/[理论|框架|模型|算法|theory|framework|model|algorithm]/gi.test(content)) difficulty++;

  return {
    category,
    tags: tags || '知识分享',
    difficulty: Math.min(difficulty, 5)
  };
}