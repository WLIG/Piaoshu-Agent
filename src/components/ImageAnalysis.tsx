'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Upload, X, Loader2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageAnalysisProps {
  onAnalysis: (result: {
    description: string;
    analysis: string;
    confidence: number;
  }) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

interface AnalysisResult {
  description: string;
  analysis: string;
  confidence: number;
}

export function ImageAnalysis({ onAnalysis, onError, disabled = false }: ImageAnalysisProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      onError?.('请选择图片文件');
      return;
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      onError?.('图片文件不能超过5MB');
      return;
    }

    setSelectedImage(file);
    
    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // 清除之前的分析结果
    setAnalysisResult(null);
  }, [onError]);

  // 拖拽处理
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // 模拟文件输入事件
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }, [handleFileSelect]);

  // 分析图片
  const analyzeImage = async () => {
    if (!selectedImage || !imagePreview) return;

    setIsAnalyzing(true);
    try {
      // 转换为base64
      const base64 = imagePreview.split(',')[1];
      
      const response = await fetch('/api/multimodal/vlm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: `data:${selectedImage.type};base64,${base64}`,
          prompt: '请详细描述这张图片的内容，包括主要物体、场景、文字信息等。'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const analysisData = {
          description: result.data.description,
          analysis: result.data.analysis,
          confidence: result.data.confidence
        };
        
        setAnalysisResult(analysisData);
        onAnalysis(analysisData);
      } else {
        onError?.('图片分析失败，请重试');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      onError?.('图片分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 清除图片
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* 文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 上传区域 */}
      {!imagePreview && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <Upload className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 md:mb-4 text-gray-400" />
          <p className="text-base md:text-lg font-medium text-gray-600 mb-1 md:mb-2">
            点击上传或拖拽图片到这里
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            支持 JPG、PNG、GIF 格式，最大 5MB
          </p>
        </motion.div>
      )}

      {/* 图片预览和分析 */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                  {/* 图片预览 */}
                  <div className="relative flex-shrink-0 w-full md:w-auto">
                    <img
                      src={imagePreview}
                      alt="预览"
                      className="w-full md:w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={clearImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* 操作和结果 */}
                  <div className="flex-1 space-y-3 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedImage?.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {((selectedImage?.size || 0) / 1024 / 1024).toFixed(2)} MB
                      </Badge>
                    </div>

                    {/* 分析按钮 */}
                    <Button
                      onClick={analyzeImage}
                      disabled={disabled || isAnalyzing}
                      className="w-full"
                      size="sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          分析中...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          分析图片
                        </>
                      )}
                    </Button>

                    {/* 分析结果 */}
                    {analysisResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Image className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">分析结果</span>
                            <Badge variant="outline" className="text-xs">
                              置信度: {(analysisResult.confidence * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {analysisResult.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}