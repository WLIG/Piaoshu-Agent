'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, XCircle, Loader2, File, Plus, BookOpen } from 'lucide-react';
import Error from 'next/error';

interface ParsedArticle {
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string;
  difficulty: number;
  author: string;
  publishedAt: string;
}

export default function UploadPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [parsedArticles, setParsedArticles] = useState<ParsedArticle[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonUpload = async () => {
    if (!jsonInput.trim()) return;

    try {
      setUploading(true);
      const data = JSON.parse(jsonInput);
      
      const response = await fetch('/api/articles/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setParsing(true);
    const newParsedArticles: ParsedArticle[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload/parse', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          newParsedArticles.push(result.data);
        } else {
          console.error(`Failed to parse ${file.name}:`, result.error);
        }
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
      }
    }

    setParsedArticles(prev => [...prev, ...newParsedArticles]);
    setParsing(false);

    // 自动生成JSON
    if (newParsedArticles.length > 0) {
      const jsonData = {
        articles: [...parsedArticles, ...newParsedArticles]
      };
      setJsonInput(JSON.stringify(jsonData, null, 2));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const loadTemplate = async () => {
    try {
      const response = await fetch('/api/articles/batch');
      const data = await response.json();
      if (data.success) {
        setJsonInput(JSON.stringify(data.data.template, null, 2));
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const removeParsedArticle = (index: number) => {
    const newArticles = parsedArticles.filter((_, i) => i !== index);
    setParsedArticles(newArticles);
    
    if (newArticles.length > 0) {
      const jsonData = { articles: newArticles };
      setJsonInput(JSON.stringify(jsonData, null, 2));
    } else {
      setJsonInput('');
    }
  };

  const editParsedArticle = (index: number, field: keyof ParsedArticle, value: string | number) => {
    const newArticles = [...parsedArticles];
    newArticles[index] = { ...newArticles[index], [field]: value };
    setParsedArticles(newArticles);
    
    const jsonData = { articles: newArticles };
    setJsonInput(JSON.stringify(jsonData, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">知识库批量上传</h1>
                <p className="text-muted-foreground">
                  为飘叔Agent上传文章内容，支持Word文档、文本文件和JSON格式
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                返回主页
              </Button>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => window.open('/upload/book', '_blank')}
                className="mr-2"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                书籍上传工具
              </Button>
              <span className="text-sm text-muted-foreground">
                专门处理大型书籍文档（如81章节）
              </span>
            </div>
          </div>

          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">文件上传</TabsTrigger>
              <TabsTrigger value="json">JSON上传</TabsTrigger>
            </TabsList>

            {/* 文件上传标签页 */}
            <TabsContent value="files" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 文件上传区域 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <File className="h-5 w-5" />
                      文件上传
                    </CardTitle>
                    <CardDescription>
                      支持 .docx, .doc, .txt, .md 格式文件
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 拖拽上传区域 */}
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">拖拽文件到这里</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        或点击选择文件上传
                      </p>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        选择文件
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".docx,.doc,.txt,.md"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {parsing && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>解析文件中...</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 解析结果预览 */}
                <Card>
                  <CardHeader>
                    <CardTitle>解析结果</CardTitle>
                    <CardDescription>
                      预览和编辑解析出的文章信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {parsedArticles.length > 0 ? (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {parsedArticles.map((article, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <Input
                                value={article.title}
                                onChange={(e) => editParsedArticle(index, 'title', e.target.value)}
                                className="font-medium"
                                placeholder="文章标题"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeParsedArticle(index)}
                                className="ml-2"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={article.category}
                                onChange={(e) => editParsedArticle(index, 'category', e.target.value)}
                                placeholder="分类"
                              />
                              <Input
                                value={article.difficulty}
                                type="number"
                                min="1"
                                max="5"
                                onChange={(e) => editParsedArticle(index, 'difficulty', parseInt(e.target.value))}
                                placeholder="难度"
                              />
                            </div>
                            
                            <Input
                              value={article.tags}
                              onChange={(e) => editParsedArticle(index, 'tags', e.target.value)}
                              placeholder="标签（逗号分隔）"
                            />
                            
                            <div className="text-sm text-muted-foreground">
                              内容长度: {article.content.length} 字符
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        上传文件后将显示解析结果
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 生成的JSON预览 */}
              {parsedArticles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>生成的JSON数据</CardTitle>
                    <CardDescription>
                      可以复制此JSON数据到JSON上传标签页进行上传
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                      readOnly
                    />
                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleJsonUpload} disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            上传中...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            直接上传到数据库
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(jsonInput)}
                      >
                        复制JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* JSON上传标签页 */}
            <TabsContent value="json" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* JSON上传区域 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      JSON批量上传
                    </CardTitle>
                    <CardDescription>
                      粘贴JSON格式的文章数据进行批量上传
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={loadTemplate}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        加载模板
                      </Button>
                    </div>

                    <Textarea
                      placeholder="粘贴JSON格式的文章数据..."
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />

                    <Button 
                      onClick={handleJsonUpload}
                      disabled={!jsonInput.trim() || uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          开始上传
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* 结果显示 */}
                <Card>
                  <CardHeader>
                    <CardTitle>上传结果</CardTitle>
                    <CardDescription>
                      查看上传状态和详细信息
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                            {result.success ? '上传成功' : '上传失败'}
                          </span>
                        </div>

                        {result.success && result.data && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Badge variant="default">
                                创建: {result.data.created}
                              </Badge>
                              <Badge variant="secondary">
                                跳过: {result.data.skipped}
                              </Badge>
                              {result.data.errors?.length > 0 && (
                                <Badge variant="destructive">
                                  错误: {result.data.errors.length}
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {result.message}
                            </p>

                            {result.data.errors?.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium text-red-700 mb-2">错误详情:</h4>
                                <ul className="text-sm text-red-600 space-y-1">
                                  {result.data.errors.map((error: string, index: number) => (
                                    <li key={index}>• {error}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {!result.success && (
                          <p className="text-sm text-red-600">
                            {result.error}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        等待上传结果...
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* 使用说明 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">支持的文件格式:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">.docx - Word 2007+</Badge>
                  <Badge variant="outline">.doc - Word 97-2003</Badge>
                  <Badge variant="outline">.txt - 纯文本</Badge>
                  <Badge variant="outline">.md - Markdown</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">智能解析功能:</h4>
                <ul className="text-sm space-y-1">
                  <li>• 自动提取文章标题和内容</li>
                  <li>• 智能分析文章分类和标签</li>
                  <li>• 自动评估内容难度等级</li>
                  <li>• 生成文章摘要</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">支持的分类:</h4>
                <div className="flex flex-wrap gap-2">
                  {['商业分析', '技术趋势', '产品策略', '数据科学', '创业投资', '实践指南'].map(cat => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}