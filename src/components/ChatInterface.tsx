'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Sparkles, Plus, Mic, Image as ImageIcon, Upload, FileText, ArrowLeft, X, Settings, Brain, Palette, Eye, Code, Briefcase } from 'lucide-react';
import { VoiceInput } from '@/components/VoiceInput';
import document from 'next/document';
import document from 'next/document';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  model?: string;
  attachments?: {
    type: 'image' | 'file' | 'audio';
    url: string;
    name: string;
    analysis?: string;
  }[];
}

interface ChatInterfaceProps {
  conversationId?: string;
  onArticleClick?: (articleId: string) => void;
}

type ChatMode = 'chat' | 'upload' | 'voice';

// 模型配置
interface ModelInfo {
  id: string;
  name: string;
  category: 'conversation' | 'reasoning' | 'creative' | 'multimodal' | 'business' | 'code';
  description: string;
  icon: any;
  color: string;
  supportThinking: boolean;
  supportVision: boolean;
  bestFor: string[];
}

const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'z-ai/glm4.7',
    name: 'GLM-4.7B',
    category: 'reasoning',
    description: '智谱AI GLM-4.7B，支持思维链推理，适合复杂分析',
    icon: Brain,
    color: 'text-purple-600',
    supportThinking: true,
    supportVision: false,
    bestFor: ['推理分析', '逻辑思考', '问题解决']
  },
  {
    id: 'moonshot/kimi2.5',
    name: 'Kimi 2.5',
    category: 'creative',
    description: 'Moonshot Kimi 2.5，创意生成专家，适合文案创作',
    icon: Palette,
    color: 'text-pink-600',
    supportThinking: false,
    supportVision: false,
    bestFor: ['创意写作', '文案生成', '内容创作']
  },
  {
    id: 'nvidia/llama3-chatqa-1.5-70b',
    name: 'Llama3-ChatQA-70B',
    category: 'conversation',
    description: 'NVIDIA Llama3 ChatQA，对话专家，适合日常交流',
    icon: User,
    color: 'text-blue-600',
    supportThinking: false,
    supportVision: false,
    bestFor: ['日常对话', '问答交流', '知识查询']
  },
  {
    id: 'nvidia/llama-3.2-90b-vision-instruct',
    name: 'Llama3.2-Vision-90B',
    category: 'multimodal',
    description: 'NVIDIA Llama3.2 Vision，多模态专家，支持图像理解',
    icon: Eye,
    color: 'text-green-600',
    supportThinking: false,
    supportVision: true,
    bestFor: ['图像分析', '视觉理解', '多模态交互']
  },
  {
    id: 'nvidia/nemotron-4-340b-instruct',
    name: 'Nemotron-4-340B',
    category: 'business',
    description: 'NVIDIA Nemotron-4，商业分析专家，适合专业场景',
    icon: Briefcase,
    color: 'text-orange-600',
    supportThinking: false,
    supportVision: false,
    bestFor: ['商业分析', '专业咨询', '决策支持']
  },
  {
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    name: 'Nemotron-70B-Code',
    category: 'code',
    description: 'NVIDIA Nemotron 代码专家，适合编程和技术问题',
    icon: Code,
    color: 'text-indigo-600',
    supportThinking: false,
    supportVision: false,
    bestFor: ['代码生成', '技术问答', '编程辅助']
  }
];

export function ChatInterface({ conversationId, onArticleClick }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('chat');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<string>('z-ai/glm4.7');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  // 获取当前选中的模型信息
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // 点击外部关闭模型选择器
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
        setShowModelSelector(false);
      }
    }

    if (showModelSelector && typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModelSelector]);

  const handleSend = async () => {
    if (!input?.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
      model: selectedModel,
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // 根据选择的模型调用不同的API
      const apiEndpoint = selectedModel.startsWith('nvidia/') ? '/api/nvidia/chat' : '/api/chat-enhanced';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: currentInput,
          userId: 'anonymous',
          model: selectedModel,
          enableThinking: currentModel.supportThinking
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data.success && data.data) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.data.message?.content || data.data.content || '抱歉，我无法生成回复。',
            createdAt: new Date().toISOString(),
            model: selectedModel,
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        createdAt: new Date().toISOString(),
        model: selectedModel,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlusMenuAction = (action: string) => {
    setShowPlusMenu(false);
    
    switch (action) {
      case 'voice':
        setChatMode('voice');
        break;
      case 'image':
        if (imageInputRef.current) {
          imageInputRef.current.click();
        }
        break;
      case 'media':
      case 'file':
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    setChatMode('upload');
    setUploadedFiles(files);
    setUploadProgress(0);

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setChatMode('chat');
    }
  };

  const handleBackToChat = () => {
    setChatMode('chat');
    setUploadedFiles([]);
    setUploadProgress(0);
    setShowPlusMenu(false);
    setVoiceError('');
  };

  // 处理语音转录结果
  const handleVoiceTranscript = (text: string) => {
    setInput(text);
    setChatMode('chat');
    setVoiceError('');
    // 自动发送语音转录的文本
    setTimeout(() => {
      if (text.trim()) {
        handleSend();
      }
    }, 100);
  };

  // 处理语音错误
  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    console.error('语音输入错误:', error);
  };

  const handleSendWithFiles = async () => {
    if (!input?.trim() && uploadedFiles.length === 0) return;

    setLoading(true);

    try {
      // 处理图片上传和分析
      const attachments = await Promise.all(
        uploadedFiles.map(async (file) => {
          const attachment = {
            type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
            url: URL.createObjectURL(file),
            name: file.name,
            analysis: undefined as string | undefined
          };

          // 如果是图片，先上传到服务器进行分析
          if (file.type.startsWith('image/')) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              
              const uploadResponse = await fetch('/api/upload/media', {
                method: 'POST',
                body: formData,
              });
              
              if (uploadResponse.ok) {
                const uploadData = await uploadResponse.json();
                if (uploadData.success) {
                  attachment.url = uploadData.data.url;
                  
                  // 调用图片分析API
                  const analysisResponse = await fetch('/api/analyze/image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      imageUrl: uploadData.data.url,
                      fileName: file.name 
                    }),
                  });
                  
                  if (analysisResponse.ok) {
                    const analysisData = await analysisResponse.json();
                    if (analysisData.success) {
                      attachment.analysis = analysisData.data.description;
                    }
                  }
                }
              }
            } catch (error) {
              console.error('图片上传或分析失败:', error);
            }
          }
          
          return attachment;
        })
      );

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: input || '上传了文件，请帮我分析一下',
        createdAt: new Date().toISOString(),
        model: selectedModel,
        attachments: attachments.map(att => ({
          type: att.type,
          url: att.url,
          name: att.name,
          analysis: att.analysis
        }))
      };

      setMessages(prev => [...prev, userMessage]);
      
      // 构建包含图片信息的消息
      let messageWithImageInfo = input || '请分析这些文件';
      
      const imageAttachments = attachments.filter(att => att.type === 'image');
      if (imageAttachments.length > 0) {
        messageWithImageInfo += '\n\n📸 上传的图片：\n';
        imageAttachments.forEach((att, index) => {
          messageWithImageInfo += `${index + 1}. ${att.name}`;
          if (att.analysis) {
            messageWithImageInfo += `\n   图片内容：${att.analysis}`;
          }
          messageWithImageInfo += '\n';
        });
        messageWithImageInfo += '\n请基于这些图片内容进行分析和回答。';
      }
      
      setInput('');
      setUploadedFiles([]);
      setChatMode('chat');

      // 如果有图片且选择的模型不支持视觉，自动切换到支持视觉的模型
      let targetModel = selectedModel;
      if (imageAttachments.length > 0 && !currentModel.supportVision) {
        const visionModel = AVAILABLE_MODELS.find(m => m.supportVision);
        if (visionModel) {
          targetModel = visionModel.id;
          setSelectedModel(targetModel);
        }
      }

      const apiEndpoint = targetModel.startsWith('nvidia/') ? '/api/nvidia/chat' : '/api/chat-enhanced';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageWithImageInfo,
          userId: 'anonymous',
          model: targetModel,
          hasAttachments: true,
          attachments: attachments.map(att => ({
            type: att.type,
            name: att.name,
            analysis: att.analysis
          }))
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data.success && data.data) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.data.message?.content || data.data.content || '我已经分析了您上传的内容...',
            createdAt: new Date().toISOString(),
            model: targetModel,
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，文件处理遇到了问题。请稍后再试。',
        createdAt: new Date().toISOString(),
        model: selectedModel,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {chatMode !== 'chat' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToChat}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>
              {chatMode === 'chat' && '飘叔 AI 助手'}
              {chatMode === 'upload' && '文件上传'}
              {chatMode === 'voice' && '语音输入'}
            </span>
          </div>
          
          {/* 模型选择器 */}
          {chatMode === 'chat' && (
            <div className="relative" ref={modelSelectorRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 text-xs"
              >
                <currentModel.icon className={`h-3 w-3 ${currentModel.color}`} />
                <span className="hidden sm:inline">{currentModel.name}</span>
                <Settings className="h-3 w-3" />
              </Button>
              
              {showModelSelector && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <div className="text-sm font-medium mb-3">选择AI模型</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {AVAILABLE_MODELS.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id);
                            setShowModelSelector(false);
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedModel === model.id 
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                              : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <model.icon className={`h-5 w-5 mt-0.5 ${model.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{model.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {model.category}
                                </Badge>
                                {model.supportThinking && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Brain className="h-3 w-3 mr-1" />
                                    思维链
                                  </Badge>
                                )}
                                {model.supportVision && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Eye className="h-3 w-3 mr-1" />
                                    视觉
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {model.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {model.bestFor.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {chatMode !== 'chat' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToChat}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* 聊天模式 */}
        {chatMode === 'chat' && (
          <div className="flex-1 px-4 overflow-y-auto">
            <div className="space-y-4 py-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>你好！我是飘叔AI助手</p>
                  <p className="text-sm">可以问我任何问题，或上传文件让我帮你分析</p>
                </div>
              )}
              
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-2 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* 附件预览 */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {message.attachments.map((attachment, idx) => (
                          <div key={idx} className="relative">
                            {attachment.type === 'image' ? (
                              <img
                                src={attachment.url}
                                alt={attachment.name}
                                className="w-32 h-32 object-cover rounded-lg border"
                              />
                            ) : (
                              <div className="w-32 h-20 bg-gray-100 rounded-lg border flex items-center justify-center">
                                <FileText className="h-8 w-8 text-gray-500" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                              {attachment.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {/* 显示使用的模型 */}
                      {message.model && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <div className="flex items-center gap-1 text-xs opacity-70">
                            {(() => {
                              const modelInfo = AVAILABLE_MODELS.find(m => m.id === message.model);
                              if (modelInfo) {
                                const IconComponent = modelInfo.icon;
                                return (
                                  <>
                                    <IconComponent className="h-3 w-3" />
                                    <span>{modelInfo.name}</span>
                                  </>
                                );
                              }
                              return <span>{message.model}</span>;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 上传模式 */}
        {chatMode === 'upload' && (
          <div className="flex-1 px-4 py-4">
            <div className="text-center mb-6">
              <Upload className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold mb-2">文件上传</h3>
              <p className="text-sm text-muted-foreground">
                已选择 {uploadedFiles.length} 个文件，添加描述后发送给AI分析
              </p>
            </div>

            {/* 文件列表 */}
            <div className="space-y-3 mb-6">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-8 w-8 text-green-600" />
                    ) : (
                      <FileText className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(index)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 语音模式 */}
        {chatMode === 'voice' && (
          <div className="flex-1 px-4 py-4 flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Mic className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">语音输入</h3>
              <p className="text-sm text-muted-foreground mb-6">
                点击麦克风按钮开始录音，说完后再次点击停止
              </p>
              
              {/* 语音输入组件 */}
              <div className="mb-6">
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onError={handleVoiceError}
                  disabled={loading}
                />
              </div>

              {/* 错误提示 */}
              {voiceError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 whitespace-pre-line">
                    {voiceError}
                  </p>
                </div>
              )}

              {/* 返回按钮 */}
              <Button onClick={handleBackToChat} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回聊天
              </Button>
            </div>
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 功能面板 */}
        <div className="p-4 border-t space-y-3">
          {/* Plus功能菜单 */}
          {showPlusMenu && chatMode === 'chat' && (
            <div className="bg-white border rounded-lg shadow-lg p-4 mb-2">
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => handlePlusMenuAction('voice')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mic className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-600">语音</span>
                </button>

                <button
                  onClick={() => handlePlusMenuAction('image')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600">图片</span>
                </button>

                <button
                  onClick={() => handlePlusMenuAction('media')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-600">上传</span>
                </button>

                <button
                  onClick={() => handlePlusMenuAction('file')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-xs text-gray-600">文档</span>
                </button>
              </div>
            </div>
          )}

          {/* 底部输入栏 */}
          <div className="flex items-center gap-2 bg-white rounded-full border p-2">
            {/* Plus按钮 - 只在聊天模式显示 */}
            {chatMode === 'chat' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlusMenu(!showPlusMenu)}
                disabled={loading}
                className={`h-8 w-8 rounded-full ${showPlusMenu ? 'bg-gray-100' : ''}`}
                title="更多功能"
              >
                <Plus className={`h-5 w-5 transition-transform ${showPlusMenu ? 'rotate-45' : ''}`} />
              </Button>
            )}

            {/* 输入框 */}
            <Input
              placeholder={
                chatMode === 'chat' ? "输入你的问题..." :
                chatMode === 'upload' ? "描述一下这些文件..." :
                "语音输入中..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (chatMode === 'upload') {
                    handleSendWithFiles();
                  } else if (chatMode === 'chat') {
                    handleSend();
                  }
                }
              }}
              disabled={loading || chatMode === 'voice'}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0"
            />

            {/* 发送按钮 */}
            <Button 
              onClick={chatMode === 'upload' ? handleSendWithFiles : handleSend}
              disabled={loading || (chatMode === 'chat' && !input?.trim()) || chatMode === 'voice'}
              className="h-8 w-8 rounded-full p-0"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}