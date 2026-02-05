import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageCircle, Mic, Image, Upload, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">飘叔Agent</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            多模态智能对话系统，具备长期记忆、人格化交互和专业分析能力
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">智能对话</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                基于Skills系统的专业分析和商业思维
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Mic className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">语音输入</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                语音转文字，AI回复语音播放
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Image className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">图片分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                AI驱动的智能图像理解和分析
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Upload className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-lg">文档处理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                智能编码检测和文档内容解析
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                开始体验飘叔Agent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                选择你喜欢的体验方式，开始与智能Agent对话
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/simple">
                  <Button size="lg" className="w-full sm:w-auto">
                    简化版体验
                  </Button>
                </Link>
                <Link href="/complete">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    完整版体验
                  </Button>
                </Link>
                <Link href="/chat-test">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    测试版体验
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>🚀 飘叔Agent v2.0 - 部署在Vercel云平台</p>
          <p>具备长期记忆、多模态交互、专业分析能力</p>
        </div>
      </div>
    </div>
  );
}