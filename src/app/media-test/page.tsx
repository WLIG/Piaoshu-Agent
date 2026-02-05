'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaUpload } from '@/components/MediaUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

// 禁用静态生成
export const dynamic = 'force-dynamic';

interface UploadedFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document' | 'other';
  analysis?: any;
}

export default function MediaTestPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string>('');

  const handleUpload = (files: any[]) => {
    console.log('上传的文件:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2">多媒体上传测试</h1>
            <p className="text-muted-foreground">
              测试图片、视频、文档等多种格式的上传和分析功能
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2"
          >
            返回主页
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm">❌ {error}</p>
            </CardContent>
          </Card>
        )}

        {/* 上传组件 */}
        <Card>
          <CardHeader>
            <CardTitle>文件上传</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUpload
              onUpload={handleUpload}
              onError={handleError}
              maxFiles={5}
              maxSize={20}
              acceptedTypes={['image/*', 'video/*', '.pdf', '.doc', '.docx', '.txt', '.md']}
            />
          </CardContent>
        </Card>

        {/* 已上传文件列表 */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>已上传文件 ({uploadedFiles.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                清空所有
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{file.type}</Badge>
                        <div>
                          <h3 className="font-medium">{file.file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* 分析结果 */}
                    {file.analysis && (
                      <div className="bg-muted rounded-lg p-3">
                        <h4 className="font-medium mb-2">分析结果:</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {file.analysis.description}
                        </p>
                        
                        {file.analysis.suggestions && (
                          <div>
                            <h5 className="font-medium text-sm mb-1">建议:</h5>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {file.analysis.suggestions.map((suggestion: string, idx: number) => (
                                <li key={idx}>• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>功能说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">支持的文件类型:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">图片 (jpg, png, gif, webp)</Badge>
                <Badge variant="secondary">视频 (mp4, avi, mov, webm)</Badge>
                <Badge variant="secondary">文档 (pdf, doc, docx, txt, md)</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">功能特点:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 拖拽上传或点击选择文件</li>
                <li>• 实时上传进度显示</li>
                <li>• AI智能内容分析</li>
                <li>• 文件预览和管理</li>
                <li>• 错误处理和提示</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}