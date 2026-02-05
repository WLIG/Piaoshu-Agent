import { NextRequest, NextResponse } from 'next/server';
import { ultimateEncodingFix, superChapterSplit } from '@/lib/ultimate-encoding-fix';

// POST /api/upload/book - 专门处理大型书籍文档的上传
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bookTitle = (formData.get('bookTitle') as string) || '未命名书籍';
    const authorName = (formData.get('author') as string) || 'Piaoshu';

    console.log(`🚀 开始处理文件: ${file.name}, 大小: ${file.size} 字节`);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Please upload files smaller than 50MB.' },
        { status: 400 }
      );
    }

    let content = '';
    let detectedEncoding = 'unknown';
    let confidence = 0;
    let method = 'unknown';

    // 根据文件类型解析内容 - 简化版本，专注解决乱码
    console.log(`📄 文件类型: ${file.type}, 文件名: ${file.name}`);
    
    if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      // 对于Word文档，直接提示用户转换为文本格式
      return NextResponse.json({
        success: false,
        error: 'DOCX/DOC文件解析复杂，请将文档另存为.txt格式后重新上传。这样可以确保完美的中文显示效果。',
        suggestion: '操作步骤：打开Word文档 → 文件 → 另存为 → 选择"纯文本(*.txt)" → 编码选择"UTF-8" → 保存后重新上传'
      }, { status: 400 });
    } else {
      // 所有其他文件都当作文本处理
      console.log('📄 当作文本文件处理，启动终极编码修复...');
      const arrayBuffer = await file.arrayBuffer();
      const result = ultimateEncodingFix(arrayBuffer);
      content = result.content;
      detectedEncoding = result.encoding;
      confidence = result.confidence;
      method = result.method;
      
      console.log(`✅ 编码修复完成: ${detectedEncoding} (${method}), 置信度: ${confidence.toFixed(2)}%, 内容长度: ${content.length}`);
    }

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { success: false, error: 'No valid content found in the file or content too short' },
        { status: 400 }
      );
    }

    console.log(`📝 内容解析完成，长度: ${content.length} 字符`);

    // 使用超级章节分割
    const chapters = superChapterSplit(content, bookTitle);

    if (chapters.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Could not split content into chapters' },
        { status: 400 }
      );
    }

    console.log(`📚 章节分割完成，共 ${chapters.length} 个章节`);

    // 为每个章节生成文章数据
    const articles = chapters.map((chapter: any, index: number) => ({
      title: chapter.title,
      content: chapter.content,
      summary: generateSummary(chapter.content),
      category: '实践指南',
      tags: `${bookTitle},第${index + 1}章,知识分享`,
      difficulty: estimateDifficulty(chapter.content),
      author: authorName,
      publishedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        bookTitle,
        totalChapters: chapters.length,
        articles,
        detectedEncoding,
        confidence: Math.round(confidence),
        method,
        preview: chapters.slice(0, 3).map((ch: any) => ({
          title: ch.title,
          contentPreview: ch.content.substring(0, 200) + '...'
        }))
      },
      message: `✅ 成功解析《${bookTitle}》为 ${chapters.length} 个章节 (编码: ${detectedEncoding}, 方法: ${method}, 置信度: ${Math.round(confidence)}%)`
    });

  } catch (error) {
    console.error('❌ 书籍解析错误:', error);
    return NextResponse.json(
      { success: false, error: `Failed to parse book: ${error}` },
      { status: 500 }
    );
  }
}

// 高级DOCX解析 - 修复版
async function parseDocxAdvanced(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log('🔧 开始DOCX高级解析...');
  
  try {
    // 检测是否真的是DOCX文件
    const uint8Array = new Uint8Array(arrayBuffer);
    const header = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (header !== '504b0304') {
      console.log('❌ 不是有效的DOCX文件，使用文本解析');
      const result = ultimateEncodingFix(arrayBuffer);
      return result.content;
    }
    
    console.log('✅ 检测到有效DOCX文件');
    
    // 简单的DOCX文本提取 - 避免解析XML结构
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(arrayBuffer);
    
    // 提取所有可能的文本内容
    const textMatches = content.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    
    if (textMatches && textMatches.length > 0) {
      const extractedText = textMatches
        .map(match => {
          const text = match.replace(/<[^>]*>/g, '');
          return text.trim();
        })
        .filter(text => text.length > 0)
        .join(' ');
      
      if (extractedText.length > 100) {
        console.log(`✅ DOCX文本提取成功，长度: ${extractedText.length}`);
        return extractedText;
      }
    }
    
    console.log('⚠️ DOCX文本提取失败，尝试其他方法');
    
    // 如果XML解析失败，尝试直接文本提取
    const cleanContent = content
      .replace(/<[^>]*>/g, ' ') // 移除所有XML标签
      .replace(/[^\x20-\x7E\u4e00-\u9fff\s]/g, ' ') // 只保留ASCII和中文字符
      .replace(/\s+/g, ' ') // 合并空格
      .trim();
    
    if (cleanContent.length > 100) {
      console.log(`✅ DOCX清理文本成功，长度: ${cleanContent.length}`);
      return cleanContent;
    }
    
  } catch (error) {
    console.log('❌ DOCX解析出错:', error);
  }
  
  // 最后的降级方案 - 当作二进制文件处理
  console.log('🔄 使用终极编码修复作为降级方案');
  const result = ultimateEncodingFix(arrayBuffer);
  return result.content;
}

// 高级DOC解析 - 修复版
async function parseDocAdvanced(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log('🔧 开始DOC高级解析...');
  
  try {
    // DOC文件更复杂，直接使用编码修复
    const result = ultimateEncodingFix(arrayBuffer);
    
    if (result.confidence > 50) {
      console.log(`✅ DOC解析成功: ${result.encoding}, 置信度: ${result.confidence}`);
      return result.content;
    }
    
    // 如果编码修复效果不好，尝试基本清理
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(arrayBuffer);
    
    const cleanContent = content
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // 移除控制字符
      .replace(/[^\x20-\x7E\u4e00-\u9fff\s]/g, ' ') // 只保留可读字符
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`✅ DOC基本清理完成，长度: ${cleanContent.length}`);
    return cleanContent;
    
  } catch (error) {
    console.log('❌ DOC解析出错:', error);
    
    // 最后的降级方案
    const result = ultimateEncodingFix(arrayBuffer);
    return result.content;
  }
}

// 生成摘要
function generateSummary(content: string): string {
  const sentences = content.split(/[。！？.!?]/).filter((s: string) => s.trim().length > 10);
  const summary = sentences.slice(0, 3).join('。');
  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary + '。';
}

// 估算难度
function estimateDifficulty(content: string): number {
  let difficulty = 1;
  
  if (content.length > 3000) difficulty++;
  if (content.length > 6000) difficulty++;
  if (/[专业|技术|理论|框架|算法|模型]/.test(content)) difficulty++;
  if (/[高级|深度|复杂|advanced|complex]/i.test(content)) difficulty++;
  
  return Math.min(difficulty, 5);
}