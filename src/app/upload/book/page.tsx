'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Upload, FileText, CheckCircle, XCircle, Loader2, Eye, Download } from 'lucide-react';

interface Chapter {
  title: string;
  content: string;
  contentPreview?: string;
}

interface BookData {
  bookTitle: string;
  totalChapters: number;
  articles: any[];
  preview: Chapter[];
  detectedEncoding?: string;
  confidence?: number;
  method?: string;
}

export default function BookUploadPage() {
  const [bookTitle, setBookTitle] = useState('飘叔web4.0革命');
  const [author, setAuthor] = useState('Piaoshu');
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setParsing(true);
    setBookData(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookTitle', bookTitle);
    formData.append('author', author);

    try {
      const response = await fetch('/api/upload/book', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setBookData(result.data);
      } else {
        setUploadResult({
          success: false,
          error: result.error,
          suggestion: result.suggestion
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        error: `解析失败: ${error}`
      });
    } finally {
      setParsing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleUploadToDatabase = async () => {
    if (!bookData) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < bookData.articles.length; i += batchSize) {
        batches.push(bookData.articles.slice(i, i + batchSize));
      }

      let totalCreated = 0;
      let totalSkipped = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        
        const response = await fetch('/api/articles/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articles: batch }),
        });

        const result = await response.json();
        
        if (result.success) {
          totalCreated += result.data.created;
          totalSkipped += result.data.skipped;
          if (result.data.errors) {
            allErrors.push(...result.data.errors);
          }
        } else {
          allErrors.push(`批次 ${i + 1} 上传失败: ${result.error}`);
        }

        setUploadProgress(((i + 1) / batches.length) * 100);
        
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setUploadResult({
        success: true,
        data: {
          created: totalCreated,
          skipped: totalSkipped,
          errors: allErrors
        },
        message: `《${bookData.bookTitle}》上传完成！创建 ${totalCreated} 章，跳过 ${totalSkipped} 章${allErrors.length > 0 ? `，${allErrors.length} 个错误` : ''}`
      });

    } catch (error) {
      setUploadResult({
        success: false,
        error: `上传失败: ${error}`
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadJson = () => {
    if (!bookData) return;
    
    const jsonData = {
      bookInfo: {
        title: bookData.bookTitle,
        author: author,
        totalChapters: bookData.totalChapters
      },
      articles: bookData.articles
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bookData.bookTitle}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  书籍上传工具
                </h1>
                <p className="text-muted-foreground">
                  专门处理大型书籍文档，智能分割章节并上传到知识库
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/upload', '_blank')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  批量上传
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  返回主页
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  书籍信息配置
                </CardTitle>
                <CardDescription>
                  设置书籍基本信息并上传文档
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">书名</label>
                    <Input
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="输入书名"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">作者</label>
                    <Input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="输入作者名"
                    />
                  </div>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">上传书籍文档</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>推荐格式：.txt (UTF-8编码)</strong><br/>
                    支持 .md 格式，暂不支持 .docx/.doc
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={parsing}
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        解析中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        选择文件
                      </>
                    )}
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>推荐格式</strong>：纯文本(.txt)，UTF-8编码</p>
                  <p>• <strong>Word转换</strong>：另存为 → 纯文本 → UTF-8编码</p>
                  <p>• <strong>文件大小</strong>：最大50MB</p>
                  <p>• <strong>章节识别</strong>：支持"第X章"等格式</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>解析结果</CardTitle>
                <CardDescription>
                  查看编码检测和章节分割结果
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{bookData.bookTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          共 {bookData.totalChapters} 个章节
                        </p>
                        {bookData.detectedEncoding && (
                          <p className="text-xs text-green-600 mt-1">
                            编码: {bookData.detectedEncoding} 
                            {bookData.confidence && ` (${bookData.confidence}%)`}
                            {bookData.method && ` - ${bookData.method}`}
                          </p>
                        )}
                      </div>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {bookData.totalChapters}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleUploadToDatabase}
                        disabled={uploading}
                        className="flex-1"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            上传中...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            上传到数据库
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={downloadJson}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载JSON
                      </Button>
                    </div>

                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>上传进度</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        章节预览
                      </h4>
                      <ScrollArea className="h-[300px] border rounded-lg p-4">
                        <div className="space-y-3">
                          {bookData.preview.map((chapter, index) => (
                            <div key={index} className="border-l-2 border-purple-200 pl-3">
                              <h5 className="font-medium text-sm">{chapter.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                {chapter.contentPreview}
                              </p>
                            </div>
                          ))}
                          {bookData.totalChapters > 3 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              ... 还有 {bookData.totalChapters - 3} 个章节
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : parsing ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-lg font-medium">正在解析文档...</p>
                      <p className="text-sm text-muted-foreground">
                        使用终极编码检测，确保无乱码
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>上传文档后将显示解析结果</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {uploadResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {uploadResult.success ? '上传结果' : '上传失败'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className={`font-medium ${uploadResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {uploadResult.message || uploadResult.error}
                  </p>

                  {uploadResult.suggestion && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">💡 解决方案:</h4>
                      <p className="text-sm text-blue-700">{uploadResult.suggestion}</p>
                    </div>
                  )}

                  {uploadResult.success && uploadResult.data && (
                    <div className="flex gap-2">
                      <Badge variant="default">
                        创建: {uploadResult.data.created}
                      </Badge>
                      <Badge variant="secondary">
                        跳过: {uploadResult.data.skipped}
                      </Badge>
                      {uploadResult.data.errors?.length > 0 && (
                        <Badge variant="destructive">
                          错误: {uploadResult.data.errors.length}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>💡 使用指南</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">📝 Word文档转换步骤:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>打开你的Word文档</li>
                  <li>点击"文件" → "另存为"</li>
                  <li>文件类型选择"纯文本(*.txt)"</li>
                  <li>编码选择"UTF-8"</li>
                  <li>保存后上传.txt文件</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">✅ 为什么推荐.txt格式:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>零乱码</strong> - UTF-8编码完美支持中文</li>
                  <li>• <strong>纯文本</strong> - 无格式干扰，专注内容</li>
                  <li>• <strong>高效解析</strong> - 快速准确的章节识别</li>
                  <li>• <strong>兼容性好</strong> - 所有系统都支持</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">🎯 测试文件:</h4>
                <p className="text-sm text-muted-foreground">
                  项目中已准备好 <code>pure-text-test.txt</code> 测试文件，包含5个章节的示例内容
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}