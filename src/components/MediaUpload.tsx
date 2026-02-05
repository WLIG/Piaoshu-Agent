'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  File, 
  X, 
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document' | 'other';
  preview?: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  analysis?: any;
  error?: string;
}

interface MediaUploadProps {
  onUpload: (files: MediaFile[]) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxSize?: number; // MB
  acceptedTypes?: string[];
}

export function MediaUpload({ 
  onUpload, 
  onError, 
  disabled = false,
  maxFiles = 5,
  maxSize = 50,
  acceptedTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx', '.txt', '.md']
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): MediaFile['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.includes('pdf') || file.type.includes('document') || 
        file.type.includes('text') || file.name.endsWith('.md') ||
        file.name.endsWith('.txt') || file.name.endsWith('.doc') ||
        file.name.endsWith('.docx')) return 'document';
    return 'other';
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `文件大小超过 ${maxSize}MB 限制`;
    }
    
    const fileType = getFileType(file);
    if (fileType === 'other' && acceptedTypes.length > 0) {
      const isAccepted = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      });
      
      if (!isAccepted) {
        return '不支持的文件类型';
      }
    }
    
    return null;
  };

  const handleFiles = async (fileList: FileList) => {
    if (disabled) return;
    
    const newFiles: MediaFile[] = [];
    const currentFileCount = files.length;
    
    for (let i = 0; i < Math.min(fileList.length, maxFiles - currentFileCount); i++) {
      const file = fileList[i];
      const error = validateFile(file);
      
      if (error) {
        onError(`${file.name}: ${error}`);
        continue;
      }
      
      const preview = await createPreview(file);
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${i}`,
        file,
        type: getFileType(file),
        preview,
        status: 'pending',
        progress: 0
      };
      
      newFiles.push(mediaFile);
    }
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      processFiles(newFiles);
    }
  };

  const processFiles = async (filesToProcess: MediaFile[]) => {
    for (const mediaFile of filesToProcess) {
      try {
        // 更新状态为上传中
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? { ...f, status: 'uploading' } : f
        ));

        // 模拟上传进度
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setFiles(prev => prev.map(f => 
            f.id === mediaFile.id ? { ...f, progress } : f
          ));
        }

        // 上传文件
        const formData = new FormData();
        formData.append('file', mediaFile.file);
        formData.append('type', mediaFile.type);

        const uploadResponse = await fetch('/api/upload/media', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('上传失败');
        }

        const uploadResult = await uploadResponse.json();

        // 更新状态为分析中
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? { ...f, status: 'analyzing', progress: 100 } : f
        ));

        // 分析文件内容
        let analysis = null;
        if (mediaFile.type === 'image') {
          const analysisResponse = await fetch('/api/analyze/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: uploadResult.url })
          });
          
          if (analysisResponse.ok) {
            analysis = await analysisResponse.json();
          }
        } else if (mediaFile.type === 'document') {
          const analysisResponse = await fetch('/api/analyze/document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentUrl: uploadResult.url })
          });
          
          if (analysisResponse.ok) {
            analysis = await analysisResponse.json();
          }
        } else if (mediaFile.type === 'video') {
          const analysisResponse = await fetch('/api/analyze/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoUrl: uploadResult.url })
          });
          
          if (analysisResponse.ok) {
            analysis = await analysisResponse.json();
          }
        }

        // 更新为完成状态
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? { 
            ...f, 
            status: 'completed', 
            analysis: analysis?.data || { description: '文件上传成功' }
          } : f
        ));

      } catch (error) {
        console.error('处理文件失败:', error);
        setFiles(prev => prev.map(f => 
          f.id === mediaFile.id ? { 
            ...f, 
            status: 'error', 
            error: error instanceof Error ? error.message : '处理失败'
          } : f
        ));
      }
    }

    // 检查是否所有文件都处理完成
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length > 0) {
      onUpload(completedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: MediaFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            拖拽文件到这里，或点击选择文件
          </p>
          <p className="text-xs text-muted-foreground">
            支持图片、视频、文档等格式，最大 {maxSize}MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* 文件列表 */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 border rounded-lg bg-card"
              >
                {/* 文件预览/图标 */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>

                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                    {getStatusIcon(file.status)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {/* 进度条 */}
                  {(file.status === 'uploading' || file.status === 'analyzing') && (
                    <div className="space-y-1">
                      <Progress value={file.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        {file.status === 'uploading' ? '上传中...' : '分析中...'}
                      </p>
                    </div>
                  )}

                  {/* 分析结果 */}
                  {file.status === 'completed' && file.analysis && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {file.analysis.description || '处理完成'}
                    </p>
                  )}

                  {/* 错误信息 */}
                  {file.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">
                      ✗ {file.error || '处理失败'}
                    </p>
                  )}
                </div>

                {/* 删除按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}