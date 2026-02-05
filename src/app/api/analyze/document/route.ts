import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { generateResponse } from '@/lib/agent/llm';

// POST /api/analyze/document - 文档分析API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentUrl } = body;

    if (!documentUrl) {
      return NextResponse.json(
        { success: false, error: 'Document URL is required' },
        { status: 400 }
      );
    }

    console.log('📄 开始分析文档:', documentUrl);

    let documentContent = '';
    let documentType = 'unknown';

    try {
      // 获取文档路径
      const filePath = join(process.cwd(), 'public', documentUrl);
      
      // 根据文件扩展名确定类型
      const extension = documentUrl.split('.').pop()?.toLowerCase();
      
      if (extension === 'txt' || extension === 'md') {
        documentContent = await readFile(filePath, 'utf-8');
        documentType = extension;
      } else if (extension === 'pdf') {
        // PDF处理 - 这里简化处理，实际项目中可以使用pdf-parse等库
        documentContent = '这是一个PDF文档，需要专门的PDF解析工具来提取内容。';
        documentType = 'pdf';
      } else if (extension === 'doc' || extension === 'docx') {
        // Word文档处理 - 这里简化处理，实际项目中可以使用mammoth等库
        documentContent = '这是一个Word文档，需要专门的Word解析工具来提取内容。';
        documentType = 'word';
      } else {
        // 尝试作为文本文件读取
        documentContent = await readFile(filePath, 'utf-8');
        documentType = 'text';
      }
    } catch (fileError) {
      console.error('文件读取错误:', fileError);
      documentContent = '无法读取文档内容，可能是文件格式不支持或文件损坏。';
    }

    // 构建文档分析提示
    const analysisPrompt = `请分析这个文档的内容。文档类型：${documentType}

文档内容：
${documentContent.substring(0, 2000)} ${documentContent.length > 2000 ? '...(内容已截断)' : ''}

请提供：
1. 文档的主要内容摘要
2. 关键信息和要点
3. 文档的类型和用途
4. 可能的应用场景
5. 如果是技术文档，请提取重要的技术要点

请用中文回复，语言要专业但易懂，符合飘叔的风格。`;

    // 调用LLM进行文档分析
    const response = await generateResponse([
      { role: 'user', content: analysisPrompt }
    ], 'anonymous');

    const analysis = {
      description: response.content || '文档分析完成',
      details: {
        type: 'document',
        documentType,
        url: documentUrl,
        contentLength: documentContent.length,
        analyzedAt: new Date().toISOString(),
        confidence: 0.90
      },
      content: documentContent.substring(0, 1000), // 返回部分内容用于预览
      suggestions: [
        '可以询问文档中的具体细节',
        '可以要求总结特定章节',
        '可以基于文档内容进行深入讨论'
      ]
    };

    console.log('✅ 文档分析完成');

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Analysis failed' },
      { status: 500 }
    );
  }
}