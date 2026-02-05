// 编码检测和修复工具

export interface EncodingResult {
  content: string;
  encoding: string;
  confidence: number;
}

// 检测并修复文本编码
export function detectAndFixEncoding(arrayBuffer: ArrayBuffer): EncodingResult {
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // 检测BOM
  const bomResult = detectBOM(uint8Array, arrayBuffer);
  if (bomResult) {
    return bomResult;
  }
  
  // 尝试多种编码
  const encodings = [
    'utf-8',
    'gbk', 
    'gb2312',
    'gb18030',
    'big5',
    'utf-16le',
    'utf-16be'
  ];
  
  let bestResult: EncodingResult = {
    content: '',
    encoding: 'utf-8',
    confidence: 0
  };
  
  for (const encoding of encodings) {
    try {
      const decoder = new TextDecoder(encoding, { fatal: false });
      const content = decoder.decode(arrayBuffer);
      const confidence = calculateEncodingConfidence(content, encoding);
      
      if (confidence > bestResult.confidence) {
        bestResult = {
          content: cleanContent(content),
          encoding,
          confidence
        };
      }
    } catch (error) {
      continue;
    }
  }
  
  return bestResult;
}

// 检测BOM
function detectBOM(uint8Array: Uint8Array, arrayBuffer: ArrayBuffer): EncodingResult | null {
  // UTF-8 BOM
  if (uint8Array.length >= 3 && 
      uint8Array[0] === 0xEF && 
      uint8Array[1] === 0xBB && 
      uint8Array[2] === 0xBF) {
    const decoder = new TextDecoder('utf-8');
    return {
      content: cleanContent(decoder.decode(arrayBuffer.slice(3))),
      encoding: 'utf-8-bom',
      confidence: 100
    };
  }
  
  // UTF-16 LE BOM
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFF && 
      uint8Array[1] === 0xFE) {
    const decoder = new TextDecoder('utf-16le');
    return {
      content: cleanContent(decoder.decode(arrayBuffer.slice(2))),
      encoding: 'utf-16le-bom',
      confidence: 100
    };
  }
  
  // UTF-16 BE BOM
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFE && 
      uint8Array[1] === 0xFF) {
    const decoder = new TextDecoder('utf-16be');
    return {
      content: cleanContent(decoder.decode(arrayBuffer.slice(2))),
      encoding: 'utf-16be-bom',
      confidence: 100
    };
  }
  
  return null;
}

// 计算编码置信度
function calculateEncodingConfidence(content: string, encoding: string): number {
  let score = 0;
  
  // 基础分数
  score += 10;
  
  // 中文字符检测
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = content.length;
  
  if (totalChars > 0) {
    const chineseRatio = chineseChars / totalChars;
    score += chineseRatio * 40; // 中文字符比例权重
  }
  
  // 常见中文词汇检测
  const commonChineseWords = [
    '的', '是', '在', '有', '和', '了', '不', '与', '也', '为',
    '第', '章', '节', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '这', '那', '我', '你', '他', '她', '它', '们', '中', '国', '人', '时', '年'
  ];
  
  let wordMatches = 0;
  for (const word of commonChineseWords) {
    if (content.includes(word)) {
      wordMatches++;
    }
  }
  score += wordMatches * 2;
  
  // 检测乱码字符
  const garbledChars = (content.match(/[��]/g) || []).length;
  score -= garbledChars * 20; // 严重惩罚乱码
  
  // 检测异常控制字符
  const controlChars = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
  score -= controlChars * 1;
  
  // 检测异常字节序列
  const invalidSequences = (content.match(/[\uFFFD]/g) || []).length;
  score -= invalidSequences * 15;
  
  // 编码特定加分
  if (encoding === 'utf-8' && chineseChars > 0) {
    score += 5; // UTF-8 处理中文的优势
  }
  
  if ((encoding === 'gbk' || encoding === 'gb2312' || encoding === 'gb18030') && chineseChars > totalChars * 0.3) {
    score += 10; // GBK系列处理中文的优势
  }
  
  return Math.max(0, score);
}

// 清理内容
function cleanContent(content: string): string {
  return content
    // 移除BOM字符
    .replace(/^\uFEFF/, '')
    // 统一换行符
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 移除控制字符，保留换行、制表符和空格
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 移除明显的乱码字符
    .replace(/[��]/g, '')
    // 移除替换字符
    .replace(/[\uFFFD]/g, '')
    // 规范化空白字符
    .replace(/[ \t]+/g, ' ')
    // 规范化多个换行
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

// 智能章节分割
export function smartChapterSplit(content: string, bookTitle: string): Array<{title: string, content: string}> {
  const chapters: Array<{title: string, content: string}> = [];
  
  // 章节模式，按优先级排序
  const patterns = [
    // 中文章节模式
    {
      regex: /第[一二三四五六七八九十百千万\d]+章[^\n\r]{0,50}/g,
      priority: 10,
      name: '中文章节'
    },
    {
      regex: /第[一二三四五六七八九十百千万\d]+节[^\n\r]{0,50}/g,
      priority: 9,
      name: '中文节'
    },
    // 数字模式
    {
      regex: /^\s*\d+\.\s*[^\n\r]{5,50}/gm,
      priority: 8,
      name: '数字点号'
    },
    {
      regex: /^\s*\d+、\s*[^\n\r]{5,50}/gm,
      priority: 7,
      name: '数字顿号'
    },
    // 中文数字模式
    {
      regex: /^[一二三四五六七八九十百千万]+、[^\n\r]{5,50}/gm,
      priority: 6,
      name: '中文数字'
    },
    // 英文章节
    {
      regex: /Chapter\s+\d+[^\n\r]{0,50}/gi,
      priority: 5,
      name: '英文章节'
    }
  ];
  
  let bestSplit: Array<{title: string, content: string}> = [];
  let bestScore = 0;
  let bestPattern = '';
  
  for (const pattern of patterns) {
    const matches = Array.from(content.matchAll(pattern.regex));
    
    if (matches.length >= 2 && matches.length <= 200) {
      const tempChapters: Array<{title: string, content: string}> = [];
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const title = match[0].trim();
        const startIndex = match.index!;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
        
        let chapterContent = content.substring(startIndex, endIndex);
        // 移除标题，保留内容
        chapterContent = chapterContent.replace(title, '').trim();
        
        if (chapterContent.length > 300) { // 确保章节有足够内容
          tempChapters.push({
            title: title.length > 80 ? title.substring(0, 80) + '...' : title,
            content: chapterContent
          });
        }
      }
      
      // 计算分割质量
      if (tempChapters.length > 0) {
        const avgLength = tempChapters.reduce((sum, ch) => sum + ch.content.length, 0) / tempChapters.length;
        const score = tempChapters.length * pattern.priority + Math.min(avgLength / 1000, 10);
        
        if (score > bestScore) {
          bestScore = score;
          bestSplit = tempChapters;
          bestPattern = pattern.name;
        }
      }
    }
  }
  
  console.log(`使用分割模式: ${bestPattern}, 分割出 ${bestSplit.length} 个章节`);
  
  // 如果没有找到合适的章节分割，尝试段落分割
  if (bestSplit.length === 0) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 800);
    
    if (paragraphs.length > 1) {
      console.log(`使用段落分割，分割出 ${paragraphs.length} 个部分`);
      return paragraphs.map((paragraph, index) => ({
        title: `${bookTitle} - 第${index + 1}部分`,
        content: paragraph.trim()
      }));
    }
    
    // 最后按长度分割
    const chunkSize = Math.max(4000, Math.floor(content.length / 30));
    const chunks: Array<{title: string, content: string}> = [];
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize);
      if (chunk.trim().length > 500) {
        chunks.push({
          title: `${bookTitle} - 第${chunks.length + 1}部分`,
          content: chunk.trim()
        });
      }
    }
    
    console.log(`使用长度分割，分割出 ${chunks.length} 个部分`);
    return chunks;
  }
  
  return bestSplit;
}