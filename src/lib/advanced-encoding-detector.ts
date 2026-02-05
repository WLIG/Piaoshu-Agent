// 高级编码检测和修复工具 - 专门解决中文乱码问题

export interface EncodingResult {
  content: string;
  encoding: string;
  confidence: number;
  originalSize: number;
  cleanedSize: number;
}

// 主要编码检测函数
export function detectAndFixEncoding(arrayBuffer: ArrayBuffer): EncodingResult {
  console.log(`开始编码检测，文件大小: ${arrayBuffer.byteLength} 字节`);
  
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // 1. 首先检测BOM
  const bomResult = detectBOM(uint8Array, arrayBuffer);
  if (bomResult && bomResult.confidence > 90) {
    console.log(`检测到BOM: ${bomResult.encoding}`);
    return bomResult;
  }
  
  // 2. 尝试多种编码方案
  const encodingTests = [
    // 中文编码优先
    { name: 'gbk', decoder: () => new TextDecoder('gbk', { fatal: false }) },
    { name: 'gb2312', decoder: () => new TextDecoder('gb2312', { fatal: false }) },
    { name: 'gb18030', decoder: () => new TextDecoder('gb18030', { fatal: false }) },
    { name: 'big5', decoder: () => new TextDecoder('big5', { fatal: false }) },
    // UTF编码
    { name: 'utf-8', decoder: () => new TextDecoder('utf-8', { fatal: false }) },
    { name: 'utf-16le', decoder: () => new TextDecoder('utf-16le', { fatal: false }) },
    { name: 'utf-16be', decoder: () => new TextDecoder('utf-16be', { fatal: false }) },
    // 其他编码
    { name: 'iso-8859-1', decoder: () => new TextDecoder('iso-8859-1', { fatal: false }) },
  ];
  
  let bestResult: EncodingResult = {
    content: '',
    encoding: 'unknown',
    confidence: 0,
    originalSize: arrayBuffer.byteLength,
    cleanedSize: 0
  };
  
  for (const test of encodingTests) {
    try {
      const decoder = test.decoder();
      const rawContent = decoder.decode(arrayBuffer);
      const cleanedContent = advancedCleanContent(rawContent);
      const confidence = calculateAdvancedConfidence(cleanedContent, test.name, rawContent);
      
      console.log(`${test.name}: 置信度 ${confidence.toFixed(2)}, 长度 ${cleanedContent.length}`);
      
      if (confidence > bestResult.confidence) {
        bestResult = {
          content: cleanedContent,
          encoding: test.name,
          confidence,
          originalSize: arrayBuffer.byteLength,
          cleanedSize: cleanedContent.length
        };
      }
    } catch (error) {
      console.log(`${test.name} 解码失败:`, error);
      continue;
    }
  }
  
  console.log(`最佳编码: ${bestResult.encoding}, 置信度: ${bestResult.confidence.toFixed(2)}`);
  return bestResult;
}

// BOM检测
function detectBOM(uint8Array: Uint8Array, arrayBuffer: ArrayBuffer): EncodingResult | null {
  // UTF-8 BOM (EF BB BF)
  if (uint8Array.length >= 3 && 
      uint8Array[0] === 0xEF && 
      uint8Array[1] === 0xBB && 
      uint8Array[2] === 0xBF) {
    const decoder = new TextDecoder('utf-8');
    const content = advancedCleanContent(decoder.decode(arrayBuffer.slice(3)));
    return {
      content,
      encoding: 'utf-8-bom',
      confidence: 100,
      originalSize: arrayBuffer.byteLength,
      cleanedSize: content.length
    };
  }
  
  // UTF-16 LE BOM (FF FE)
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFF && 
      uint8Array[1] === 0xFE) {
    const decoder = new TextDecoder('utf-16le');
    const content = advancedCleanContent(decoder.decode(arrayBuffer.slice(2)));
    return {
      content,
      encoding: 'utf-16le-bom',
      confidence: 100,
      originalSize: arrayBuffer.byteLength,
      cleanedSize: content.length
    };
  }
  
  // UTF-16 BE BOM (FE FF)
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFE && 
      uint8Array[1] === 0xFF) {
    const decoder = new TextDecoder('utf-16be');
    const content = advancedCleanContent(decoder.decode(arrayBuffer.slice(2)));
    return {
      content,
      encoding: 'utf-16be-bom',
      confidence: 100,
      originalSize: arrayBuffer.byteLength,
      cleanedSize: content.length
    };
  }
  
  return null;
}

// 高级置信度计算
function calculateAdvancedConfidence(content: string, encoding: string, rawContent: string): number {
  let score = 0;
  
  // 基础分数
  score += 10;
  
  // 1. 中文字符检测 (最重要)
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = content.length;
  
  if (totalChars > 0) {
    const chineseRatio = chineseChars / totalChars;
    score += chineseRatio * 50; // 中文字符比例权重很高
    
    // 如果中文字符很多，给中文编码额外加分
    if (chineseRatio > 0.1) {
      if (encoding.includes('gb') || encoding === 'big5') {
        score += 15; // 中文编码处理中文的优势
      }
    }
  }
  
  // 2. 常见中文词汇和短语检测
  const commonWords = [
    // 基础词汇
    '的', '是', '在', '有', '和', '了', '不', '与', '也', '为', '这', '那',
    '我', '你', '他', '她', '它', '们', '中', '国', '人', '时', '年', '月', '日',
    // 章节相关
    '第', '章', '节', '部分', '内容', '介绍', '总结', '分析', '方法', '技术',
    // 数字
    '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    // 常见短语
    '可以', '应该', '需要', '通过', '进行', '实现', '开发', '系统', '问题', '解决'
  ];
  
  let wordMatches = 0;
  for (const word of commonWords) {
    const matches = (content.match(new RegExp(word, 'g')) || []).length;
    wordMatches += matches;
  }
  score += Math.min(wordMatches * 1.5, 30); // 限制最大加分
  
  // 3. 严重惩罚乱码字符
  const garbledChars = (content.match(/[��]/g) || []).length;
  score -= garbledChars * 50; // 严重惩罚
  
  // 4. 惩罚替换字符 (通常表示解码失败)
  const replacementChars = (content.match(/[\uFFFD]/g) || []).length;
  score -= replacementChars * 30;
  
  // 5. 检测异常控制字符
  const controlChars = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
  score -= controlChars * 2;
  
  // 6. 检测合理的标点符号
  const chinesePunctuation = (content.match(/[，。！？；：""''（）【】]/g) || []).length;
  score += Math.min(chinesePunctuation * 0.5, 10);
  
  // 7. 检测章节标题模式
  const chapterPatterns = [
    /第[一二三四五六七八九十百千万\d]+章/g,
    /第[一二三四五六七八九十百千万\d]+节/g,
    /Chapter\s+\d+/gi
  ];
  
  for (const pattern of chapterPatterns) {
    const matches = (content.match(pattern) || []).length;
    if (matches > 0) {
      score += matches * 3; // 章节标题加分
    }
  }
  
  // 8. 内容长度合理性检查
  if (content.length < rawContent.length * 0.3) {
    score -= 20; // 内容丢失太多
  }
  
  // 9. 编码特定优化
  if (encoding === 'utf-8') {
    // UTF-8 对于混合内容的优势
    const asciiChars = (content.match(/[a-zA-Z0-9]/g) || []).length;
    if (asciiChars > 0 && chineseChars > 0) {
      score += 5; // 混合内容优势
    }
  }
  
  return Math.max(0, score);
}

// 高级内容清理
function advancedCleanContent(content: string): string {
  return content
    // 1. 移除BOM字符
    .replace(/^\uFEFF/, '')
    
    // 2. 统一换行符
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // 3. 移除明显的乱码字符
    .replace(/[��]/g, '')
    .replace(/[\uFFFD]/g, '') // 替换字符
    
    // 4. 移除控制字符，但保留有用的空白字符
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    // 5. 清理异常的Unicode字符
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    
    // 6. 规范化空白字符
    .replace(/[ \t]+/g, ' ') // 多个空格/制表符合并为一个空格
    .replace(/\n[ \t]+/g, '\n') // 行首空白
    .replace(/[ \t]+\n/g, '\n') // 行尾空白
    
    // 7. 规范化多个换行
    .replace(/\n{3,}/g, '\n\n') // 最多保留两个连续换行
    
    // 8. 移除文档开头和结尾的多余空白
    .trim();
}

// 智能章节分割 - 改进版
export function smartChapterSplit(content: string, bookTitle: string): Array<{title: string, content: string}> {
  console.log(`开始章节分割，内容长度: ${content.length}`);
  
  // 预处理：确保章节标题前后有换行
  content = content
    .replace(/(第[一二三四五六七八九十百千万\d]+章[^\n\r]{0,50})/g, '\n$1\n')
    .replace(/(第[一二三四五六七八九十百千万\d]+节[^\n\r]{0,50})/g, '\n$1\n')
    .replace(/(Chapter\s+\d+[^\n\r]{0,50})/gi, '\n$1\n')
    .replace(/\n{3,}/g, '\n\n'); // 清理多余换行
  
  const patterns = [
    {
      regex: /第[一二三四五六七八九十百千万\d]+章[^\n\r]{0,80}/g,
      priority: 10,
      name: '中文章节',
      minLength: 500
    },
    {
      regex: /第[一二三四五六七八九十百千万\d]+节[^\n\r]{0,80}/g,
      priority: 9,
      name: '中文节',
      minLength: 300
    },
    {
      regex: /^\s*\d+\.\s*[^\n\r]{8,80}/gm,
      priority: 8,
      name: '数字点号',
      minLength: 400
    },
    {
      regex: /^\s*\d+、\s*[^\n\r]{5,80}/gm,
      priority: 7,
      name: '数字顿号',
      minLength: 400
    },
    {
      regex: /^[一二三四五六七八九十百千万]+、[^\n\r]{5,80}/gm,
      priority: 6,
      name: '中文数字',
      minLength: 300
    },
    {
      regex: /Chapter\s+\d+[^\n\r]{0,80}/gi,
      priority: 5,
      name: '英文章节',
      minLength: 500
    }
  ];
  
  let bestSplit: Array<{title: string, content: string}> = [];
  let bestScore = 0;
  let bestPattern = '';
  
  for (const pattern of patterns) {
    const matches = Array.from(content.matchAll(pattern.regex));
    console.log(`${pattern.name}: 找到 ${matches.length} 个匹配`);
    
    if (matches.length >= 2 && matches.length <= 300) {
      const tempChapters: Array<{title: string, content: string}> = [];
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const title = match[0].trim();
        const startIndex = match.index!;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
        
        let chapterContent = content.substring(startIndex, endIndex);
        // 移除标题，保留内容
        chapterContent = chapterContent.replace(title, '').trim();
        
        if (chapterContent.length >= pattern.minLength) {
          tempChapters.push({
            title: title.length > 100 ? title.substring(0, 100) + '...' : title,
            content: chapterContent
          });
        }
      }
      
      if (tempChapters.length > 0) {
        const avgLength = tempChapters.reduce((sum, ch) => sum + ch.content.length, 0) / tempChapters.length;
        const lengthScore = Math.min(avgLength / 1000, 15); // 平均长度分数
        const countScore = Math.min(tempChapters.length, 50); // 章节数量分数
        const score = pattern.priority + lengthScore + countScore;
        
        console.log(`${pattern.name}: ${tempChapters.length} 章节, 平均长度 ${Math.round(avgLength)}, 分数 ${score.toFixed(2)}`);
        
        if (score > bestScore) {
          bestScore = score;
          bestSplit = tempChapters;
          bestPattern = pattern.name;
        }
      }
    }
  }
  
  console.log(`最佳分割模式: ${bestPattern}, 分割出 ${bestSplit.length} 个章节`);
  
  // 如果没有找到合适的章节分割
  if (bestSplit.length === 0) {
    console.log('未找到章节模式，尝试段落分割');
    
    // 尝试段落分割
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 1000); // 段落最小长度
    
    if (paragraphs.length > 1 && paragraphs.length <= 100) {
      console.log(`段落分割: ${paragraphs.length} 个部分`);
      return paragraphs.map((paragraph, index) => ({
        title: `${bookTitle} - 第${index + 1}部分`,
        content: paragraph
      }));
    }
    
    // 最后按长度分割
    console.log('使用长度分割');
    const targetChapters = Math.min(50, Math.max(5, Math.floor(content.length / 5000)));
    const chunkSize = Math.floor(content.length / targetChapters);
    const chunks: Array<{title: string, content: string}> = [];
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize).trim();
      if (chunk.length > 800) {
        chunks.push({
          title: `${bookTitle} - 第${chunks.length + 1}部分`,
          content: chunk
        });
      }
    }
    
    console.log(`长度分割: ${chunks.length} 个部分`);
    return chunks;
  }
  
  return bestSplit;
}