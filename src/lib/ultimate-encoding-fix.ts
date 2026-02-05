// 终极编码修复工具 - 专门解决顽固乱码问题

export interface UltimateEncodingResult {
  content: string;
  encoding: string;
  confidence: number;
  method: string;
}

// 终极编码检测和修复
export function ultimateEncodingFix(arrayBuffer: ArrayBuffer): UltimateEncodingResult {
  console.log(`开始终极编码修复，文件大小: ${arrayBuffer.byteLength} 字节`);
  
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // 方法1: 检测BOM
  const bomResult = detectBOMUltimate(uint8Array, arrayBuffer);
  if (bomResult && bomResult.confidence > 95) {
    console.log(`BOM检测成功: ${bomResult.encoding}`);
    return bomResult;
  }
  
  // 方法2: 字节模式分析
  const bytePatternResult = analyzeBytePatterns(uint8Array);
  if (bytePatternResult && bytePatternResult.confidence > 90) {
    console.log(`字节模式分析成功: ${bytePatternResult.encoding}`);
    return bytePatternResult;
  }
  
  // 方法3: 多编码暴力测试
  const bruteForceResult = bruteForceEncoding(arrayBuffer);
  if (bruteForceResult && bruteForceResult.confidence > 80) {
    console.log(`暴力测试成功: ${bruteForceResult.encoding}`);
    return bruteForceResult;
  }
  
  // 方法4: 智能猜测和修复
  const smartGuessResult = smartGuessAndFix(arrayBuffer);
  console.log(`智能猜测结果: ${smartGuessResult.encoding}, 置信度: ${smartGuessResult.confidence}`);
  
  return smartGuessResult;
}

// BOM检测增强版
function detectBOMUltimate(uint8Array: Uint8Array, arrayBuffer: ArrayBuffer): UltimateEncodingResult | null {
  // UTF-8 BOM (EF BB BF)
  if (uint8Array.length >= 3 && 
      uint8Array[0] === 0xEF && 
      uint8Array[1] === 0xBB && 
      uint8Array[2] === 0xBF) {
    const decoder = new TextDecoder('utf-8');
    const content = ultimateCleanContent(decoder.decode(arrayBuffer.slice(3)));
    return {
      content,
      encoding: 'utf-8-bom',
      confidence: 100,
      method: 'BOM检测'
    };
  }
  
  // UTF-16 LE BOM (FF FE)
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFF && 
      uint8Array[1] === 0xFE) {
    const decoder = new TextDecoder('utf-16le');
    const content = ultimateCleanContent(decoder.decode(arrayBuffer.slice(2)));
    return {
      content,
      encoding: 'utf-16le-bom',
      confidence: 100,
      method: 'BOM检测'
    };
  }
  
  // UTF-16 BE BOM (FE FF)
  if (uint8Array.length >= 2 && 
      uint8Array[0] === 0xFE && 
      uint8Array[1] === 0xFF) {
    const decoder = new TextDecoder('utf-16be');
    const content = ultimateCleanContent(decoder.decode(arrayBuffer.slice(2)));
    return {
      content,
      encoding: 'utf-16be-bom',
      confidence: 100,
      method: 'BOM检测'
    };
  }
  
  return null;
}

// 字节模式分析
function analyzeBytePatterns(uint8Array: Uint8Array): UltimateEncodingResult | null {
  const sample = uint8Array.slice(0, Math.min(1000, uint8Array.length));
  
  // 检测GBK特征字节
  let gbkScore = 0;
  for (let i = 0; i < sample.length - 1; i++) {
    const byte1 = sample[i];
    const byte2 = sample[i + 1];
    
    // GBK第一字节范围: 0x81-0xFE
    // GBK第二字节范围: 0x40-0x7E, 0x80-0xFE
    if (byte1 >= 0x81 && byte1 <= 0xFE) {
      if ((byte2 >= 0x40 && byte2 <= 0x7E) || (byte2 >= 0x80 && byte2 <= 0xFE)) {
        gbkScore += 2;
      }
    }
  }
  
  // 检测UTF-8特征字节
  let utf8Score = 0;
  for (let i = 0; i < sample.length; i++) {
    const byte = sample[i];
    if (byte <= 0x7F) {
      utf8Score += 1; // ASCII字符
    } else if ((byte & 0xE0) === 0xC0) {
      // 2字节UTF-8序列开始
      if (i + 1 < sample.length && (sample[i + 1] & 0xC0) === 0x80) {
        utf8Score += 3;
        i++; // 跳过下一个字节
      }
    } else if ((byte & 0xF0) === 0xE0) {
      // 3字节UTF-8序列开始
      if (i + 2 < sample.length && 
          (sample[i + 1] & 0xC0) === 0x80 && 
          (sample[i + 2] & 0xC0) === 0x80) {
        utf8Score += 4;
        i += 2; // 跳过接下来的两个字节
      }
    }
  }
  
  console.log(`字节模式分析 - GBK分数: ${gbkScore}, UTF-8分数: ${utf8Score}`);
  
  if (gbkScore > utf8Score && gbkScore > 50) {
    try {
      const decoder = new TextDecoder('gbk', { fatal: false });
      const content = ultimateCleanContent(decoder.decode(uint8Array));
      const confidence = Math.min(95, 60 + (gbkScore / sample.length) * 100);
      
      return {
        content,
        encoding: 'gbk',
        confidence,
        method: '字节模式分析'
      };
    } catch (error) {
      console.log('GBK解码失败:', error);
    }
  }
  
  if (utf8Score > 30) {
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const content = ultimateCleanContent(decoder.decode(uint8Array));
      const confidence = Math.min(95, 60 + (utf8Score / sample.length) * 100);
      
      return {
        content,
        encoding: 'utf-8',
        confidence,
        method: '字节模式分析'
      };
    } catch (error) {
      console.log('UTF-8解码失败:', error);
    }
  }
  
  return null;
}

// 暴力编码测试
function bruteForceEncoding(arrayBuffer: ArrayBuffer): UltimateEncodingResult | null {
  const encodings = [
    { name: 'gbk', priority: 10 },
    { name: 'gb2312', priority: 9 },
    { name: 'gb18030', priority: 8 },
    { name: 'big5', priority: 7 },
    { name: 'utf-8', priority: 6 },
    { name: 'utf-16le', priority: 5 },
    { name: 'utf-16be', priority: 4 },
    { name: 'iso-8859-1', priority: 3 }
  ];
  
  let bestResult: UltimateEncodingResult | null = null;
  let bestScore = 0;
  
  for (const encoding of encodings) {
    try {
      const decoder = new TextDecoder(encoding.name, { fatal: false });
      const rawContent = decoder.decode(arrayBuffer);
      const cleanContent = ultimateCleanContent(rawContent);
      
      const score = calculateUltimateScore(cleanContent, encoding.name, encoding.priority);
      
      console.log(`${encoding.name}: 分数 ${score.toFixed(2)}, 长度 ${cleanContent.length}`);
      
      if (score > bestScore) {
        bestScore = score;
        bestResult = {
          content: cleanContent,
          encoding: encoding.name,
          confidence: Math.min(95, score),
          method: '暴力测试'
        };
      }
    } catch (error) {
      console.log(`${encoding.name} 暴力测试失败:`, error);
    }
  }
  
  return bestResult;
}

// 智能猜测和修复
function smartGuessAndFix(arrayBuffer: ArrayBuffer): UltimateEncodingResult {
  // 最后的保险方案
  try {
    // 尝试UTF-8解码
    const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
    let content = utf8Decoder.decode(arrayBuffer);
    
    // 如果有太多替换字符，尝试GBK
    const replacementCount = (content.match(/\uFFFD/g) || []).length;
    if (replacementCount > content.length * 0.1) {
      try {
        const gbkDecoder = new TextDecoder('gbk', { fatal: false });
        const gbkContent = gbkDecoder.decode(arrayBuffer);
        const gbkReplacementCount = (gbkContent.match(/\uFFFD/g) || []).length;
        
        if (gbkReplacementCount < replacementCount) {
          content = gbkContent;
          return {
            content: ultimateCleanContent(content),
            encoding: 'gbk',
            confidence: 70,
            method: '智能猜测'
          };
        }
      } catch (error) {
        console.log('GBK智能猜测失败:', error);
      }
    }
    
    return {
      content: ultimateCleanContent(content),
      encoding: 'utf-8',
      confidence: 60,
      method: '智能猜测'
    };
  } catch (error) {
    // 最后的最后，返回原始字节的字符串表示
    const uint8Array = new Uint8Array(arrayBuffer);
    const content = Array.from(uint8Array)
      .map(byte => String.fromCharCode(byte))
      .join('');
    
    return {
      content: ultimateCleanContent(content),
      encoding: 'binary',
      confidence: 30,
      method: '二进制降级'
    };
  }
}

// 终极评分算法
function calculateUltimateScore(content: string, encoding: string, priority: number): number {
  let score = priority * 5; // 基础优先级分数
  
  // 中文字符检测 (最重要的指标)
  const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
  const totalChars = content.length;
  
  if (totalChars > 0) {
    const chineseRatio = chineseChars / totalChars;
    score += chineseRatio * 60; // 中文字符比例权重
    
    // 中文编码对中文内容的加分
    if (chineseRatio > 0.05 && (encoding.includes('gb') || encoding === 'big5')) {
      score += 20;
    }
  }
  
  // 常见中文词汇检测
  const commonWords = [
    '的', '是', '在', '有', '和', '了', '不', '与', '也', '为',
    '第', '章', '节', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '这', '那', '我', '你', '他', '她', '它', '们', '中', '国', '人', '时', '年',
    '可以', '应该', '需要', '通过', '进行', '实现', '开发', '系统', '问题', '解决',
    '技术', '方法', '内容', '介绍', '分析', '总结', '飘叔', 'web', '革命'
  ];
  
  let wordScore = 0;
  for (const word of commonWords) {
    const matches = (content.match(new RegExp(word, 'g')) || []).length;
    wordScore += matches * (word.length > 1 ? 2 : 1);
  }
  score += Math.min(wordScore, 40);
  
  // 严重惩罚乱码和替换字符
  const garbledChars = (content.match(/[��]/g) || []).length;
  const replacementChars = (content.match(/[\uFFFD]/g) || []).length;
  score -= (garbledChars + replacementChars) * 100;
  
  // 惩罚过多的控制字符
  const controlChars = (content.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;
  score -= controlChars * 5;
  
  // 检测合理的标点符号
  const punctuation = (content.match(/[，。！？；：""''（）【】]/g) || []).length;
  score += Math.min(punctuation * 0.3, 15);
  
  // 内容长度合理性
  if (content.length < 50) {
    score -= 30; // 内容太短
  }
  
  return Math.max(0, score);
}

// 终极内容清理
function ultimateCleanContent(content: string): string {
  return content
    // 移除BOM
    .replace(/^\uFEFF/, '')
    
    // 统一换行符
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // 移除明显的乱码字符
    .replace(/[��]/g, '')
    .replace(/[\uFFFD]/g, '') // 替换字符
    
    // 移除控制字符，保留有用的空白字符
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    
    // 清理异常的Unicode字符
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    
    // 规范化空白字符
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    
    // 规范化换行
    .replace(/\n{3,}/g, '\n\n')
    
    // 清理开头和结尾
    .trim();
}

// 超级章节分割
export function superChapterSplit(content: string, bookTitle: string): Array<{title: string, content: string}> {
  console.log(`开始超级章节分割，内容长度: ${content.length}`);
  
  // 预处理内容，确保章节标题独占一行
  content = content
    .replace(/(第[一二三四五六七八九十百千万\d]+章[^\n\r]{0,100})/g, '\n\n$1\n\n')
    .replace(/(第[一二三四五六七八九十百千万\d]+节[^\n\r]{0,100})/g, '\n\n$1\n\n')
    .replace(/(Chapter\s+\d+[^\n\r]{0,100})/gi, '\n\n$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  const patterns = [
    {
      regex: /第[一二三四五六七八九十百千万\d]+章[^\n\r]{0,100}/g,
      priority: 10,
      name: '中文章节',
      minLength: 300
    },
    {
      regex: /第[一二三四五六七八九十百千万\d]+节[^\n\r]{0,100}/g,
      priority: 9,
      name: '中文节',
      minLength: 200
    },
    {
      regex: /^\s*\d+\.\s*[^\n\r]{8,100}/gm,
      priority: 8,
      name: '数字点号',
      minLength: 300
    },
    {
      regex: /^\s*\d+、\s*[^\n\r]{5,100}/gm,
      priority: 7,
      name: '数字顿号',
      minLength: 300
    },
    {
      regex: /Chapter\s+\d+[^\n\r]{0,100}/gi,
      priority: 6,
      name: '英文章节',
      minLength: 400
    }
  ];
  
  let bestSplit: Array<{title: string, content: string}> = [];
  let bestScore = 0;
  let bestPattern = '';
  
  for (const pattern of patterns) {
    const matches = Array.from(content.matchAll(pattern.regex));
    console.log(`${pattern.name}: 找到 ${matches.length} 个匹配`);
    
    if (matches.length >= 2 && matches.length <= 500) {
      const tempChapters: Array<{title: string, content: string}> = [];
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const title = match[0].trim();
        const startIndex = match.index!;
        const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
        
        let chapterContent = content.substring(startIndex, endIndex);
        chapterContent = chapterContent.replace(title, '').trim();
        
        if (chapterContent.length >= pattern.minLength) {
          tempChapters.push({
            title: title.length > 120 ? title.substring(0, 120) + '...' : title,
            content: chapterContent
          });
        }
      }
      
      if (tempChapters.length > 0) {
        const avgLength = tempChapters.reduce((sum, ch) => sum + ch.content.length, 0) / tempChapters.length;
        const score = pattern.priority + Math.min(avgLength / 1000, 20) + Math.min(tempChapters.length, 100);
        
        console.log(`${pattern.name}: ${tempChapters.length} 章节, 平均长度 ${Math.round(avgLength)}, 分数 ${score.toFixed(2)}`);
        
        if (score > bestScore) {
          bestScore = score;
          bestSplit = tempChapters;
          bestPattern = pattern.name;
        }
      }
    }
  }
  
  console.log(`最佳分割: ${bestPattern}, ${bestSplit.length} 个章节`);
  
  // 如果没有找到章节，使用段落分割
  if (bestSplit.length === 0) {
    console.log('使用段落分割');
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 800);
    
    if (paragraphs.length > 1) {
      return paragraphs.map((paragraph, index) => ({
        title: `${bookTitle} - 第${index + 1}部分`,
        content: paragraph
      }));
    }
    
    // 最后使用长度分割
    console.log('使用长度分割');
    const targetChapters = Math.min(100, Math.max(3, Math.floor(content.length / 4000)));
    const chunkSize = Math.floor(content.length / targetChapters);
    const chunks: Array<{title: string, content: string}> = [];
    
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.substring(i, i + chunkSize).trim();
      if (chunk.length > 500) {
        chunks.push({
          title: `${bookTitle} - 第${chunks.length + 1}部分`,
          content: chunk
        });
      }
    }
    
    return chunks;
  }
  
  return bestSplit;
}