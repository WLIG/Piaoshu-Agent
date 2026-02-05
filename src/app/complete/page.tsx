'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, Bot, User, Sparkles, Plus, Mic, Image as ImageIcon, 
  Upload, FileText, ArrowLeft, X, Settings, Brain, Palette, 
  Eye, Code, Briefcase, Volume2, VolumeX, Copy, Download,
  MessageSquare, BarChart3, BookOpen, Users, Globe, Rocket,
  Heart, Share2, Clock, TrendingUp, Zap, Target
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'voice' | 'document';
  metadata?: any;
}

interface ChatStats {
  totalMessages: number;
  sessionsToday: number;
  avgResponseTime: number;
  userSatisfaction: number;
}

export default function CompletePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🎉 欢迎使用飘叔Agent完整版！我是你的智能助手，具备以下能力：\n\n🧠 **专业分析** - 商业思维和案例分析\n🎤 **语音交互** - 语音输入和AI语音回复\n🖼️ **图像理解** - 智能图片分析\n📁 **文档处理** - 多格式文档解析\n💾 **长期记忆** - 跨会话记住你的偏好\n\n有什么我可以帮助你的吗？',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatStats, setChatStats] = useState<ChatStats>({
    totalMessages: 1247,
    sessionsToday: 23,
    avgResponseTime: 1.2,
    userSatisfaction: 4.8
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string = input, type: 'text' | 'image' | 'voice' | 'document' = 'text') => {
    if (!content.trim() && !selectedFile || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || `[${type === 'image' ? '图片' : type === 'voice' ? '语音' : '文档'}]`,
      timestamp: new Date(),
      type,
      metadata: selectedFile ? { fileName: selectedFile.name, fileSize: selectedFile.size } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedFile(null);
    setLoading(true);
    setShowPlusMenu(false);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      let response = '';
      switch (type) {
        case 'voice':
          response = '🎤 我听到了你的语音消息。基于语音内容，我的分析是...';
          break;
        case 'image':
          response = '🖼️ 我分析了你上传的图片。从图像中我可以看到...';
          break;
        case 'document':
          response = '📄 我已经处理了你的文档。文档内容显示...';
          break;
        default:
          response = generateSmartResponse(content);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 更新统计数据
      setChatStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + 2,
        avgResponseTime: Math.round((prev.avgResponseTime + Math.random() * 2) * 10) / 10
      }));
      
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartResponse = (input: string): string => {
    const responses = [
      `基于你的问题"${input}"，我的专业分析是：这是一个很有价值的话题。从商业角度来看...`,
      `关于"${input}"，让我用类比的方式来解释：就像...`,
      `你提到的"${input}"让我想到了一个经典案例：...`,
      `从Skills系统的角度分析"${input}"，我认为关键在于...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-10 h-10 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">飘叔Agent 完整版</h1>
              <p className="text-sm text-gray-600">多模态智能对话系统</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              v2.0 Pro
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              智能对话
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              数据分析
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              知识库
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              设置
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="h-[70vh] flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-blue-600" />
                        智能对话
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {messages.length} 消息
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                              ) : (
                                <Bot className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className={`rounded-lg p-3 ${
                              message.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/20">
                                <span className="text-xs opacity-70">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                                {message.role === 'assistant' && (
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Volume2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {loading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input Area */}
                    <div className="border-t p-4">
                      {selectedFile && (
                        <div className="mb-3 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800">{selectedFile.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPlusMenu(!showPlusMenu)}
                            className="px-3"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          
                          {showPlusMenu && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 min-w-[200px]">
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-2 justify-start"
                                  onClick={() => {
                                    setIsRecording(!isRecording);
                                    if (!isRecording) {
                                      setTimeout(() => {
                                        setIsRecording(false);
                                        handleSend('这是一段语音消息的内容', 'voice');
                                      }, 3000);
                                    }
                                  }}
                                >
                                  <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
                                  {isRecording ? '停止录音' : '语音输入'}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-2 justify-start"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <ImageIcon className="w-4 h-4" />
                                  图片分析
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-2 justify-start"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  <Upload className="w-4 h-4" />
                                  文档上传
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-2 justify-start"
                                >
                                  <Brain className="w-4 h-4" />
                                  Skills分析
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={isRecording ? "正在录音..." : "输入你的问题..."}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          disabled={loading || isRecording}
                          className="flex-1"
                        />
                        
                        <Button 
                          onClick={() => handleSend()} 
                          disabled={loading || !input.trim()}
                          className="px-4"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-4">
                {/* Stats Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">会话统计</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">总消息数</span>
                      <span className="font-semibold">{chatStats.totalMessages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">今日会话</span>
                      <span className="font-semibold">{chatStats.sessionsToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">响应时间</span>
                      <span className="font-semibold">{chatStats.avgResponseTime}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">满意度</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{chatStats.userSatisfaction}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} className={`text-xs ${i <= chatStats.userSatisfaction ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">快速操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      导出对话
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Share2 className="w-4 h-4 mr-2" />
                      分享会话
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Brain className="w-4 h-4 mr-2" />
                      记忆管理
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">总对话数</p>
                      <p className="text-2xl font-bold text-blue-600">1,247</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="text-green-600">+12%</span> 比上周
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">活跃用户</p>
                      <p className="text-2xl font-bold text-green-600">89</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="text-green-600">+5%</span> 比上周
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">响应时间</p>
                      <p className="text-2xl font-bold text-purple-600">1.2s</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="text-green-600">-0.3s</span> 比上周
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">满意度</p>
                      <p className="text-2xl font-bold text-orange-600">4.8</p>
                    </div>
                    <Heart className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="text-green-600">+0.2</span> 比上周
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>使用趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>数据可视化图表</p>
                    <p className="text-sm">显示用户使用趋势和模式</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">知识文章 {i}</CardTitle>
                      <Badge variant="secondary">商业分析</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      这是一篇关于商业分析和案例研究的文章，包含了详细的分析和见解...
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {Math.floor(Math.random() * 1000) + 100}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {Math.floor(Math.random() * 50) + 10}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        2天前
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>个性化设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">启用语音回复</span>
                    <Button variant="outline" size="sm">开启</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">记忆学习</span>
                    <Button variant="outline" size="sm">开启</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">专业模式</span>
                    <Button variant="outline" size="sm">开启</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>系统信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">版本</span>
                    <span className="text-sm font-mono">v2.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">部署环境</span>
                    <span className="text-sm">Vercel</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API状态</span>
                    <Badge variant="secondary" className="text-xs">正常</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setSelectedFile(file);
              const fileType = file.type.startsWith('image/') ? 'image' : 'document';
              handleSend(`上传了文件: ${file.name}`, fileType);
            }
          }}
        />
      </div>
    </div>
  );
}