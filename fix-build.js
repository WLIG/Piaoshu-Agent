const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复构建问题...\n');

// 1. 修复 tsconfig.json
console.log('1. 修复 tsconfig.json...');
const tsconfig = {
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
};

fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
console.log('✅ tsconfig.json 已修复');

// 2. 修复 next-env.d.ts
console.log('2. 修复 next-env.d.ts...');
const nextEnvContent = `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Global type declarations
declare global {
  var fetch: typeof globalThis.fetch;
  var JSON: typeof globalThis.JSON;
  var String: typeof globalThis.String;
  var Math: typeof globalThis.Math;
  var Date: typeof globalThis.Date;
  var setTimeout: typeof globalThis.setTimeout;
  var clearTimeout: typeof globalThis.clearTimeout;
}

export {};
`;

fs.writeFileSync('next-env.d.ts', nextEnvContent);
console.log('✅ next-env.d.ts 已修复');

// 3. 修复 test-api 页面
console.log('3. 修复 test-api 页面...');
const testApiContent = `'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestApiPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello, this is a test' })
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult('Error: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>API 测试页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testApi} disabled={loading}>
            {loading ? '测试中...' : '测试 API'}
          </Button>
          
          {result && (
            <div>
              <Badge variant="outline">结果</Badge>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}`;

fs.writeFileSync('src/app/test-api/page.tsx', testApiContent);
console.log('✅ test-api 页面已修复');

// 4. 修复主页面
console.log('4. 修复主页面...');
const homePageContent = `import React from 'react';
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
          <div className="flex items-center justify-center mb-6">
            <Bot className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">飘叔Agent</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            智能AI助手，支持多模态交互、语音识别、图像分析和文档处理
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
                智能对话
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                基于先进AI模型的智能对话系统，支持多轮对话和上下文理解
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="h-6 w-6 mr-2 text-green-600" />
                语音交互
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                支持语音输入和AI语音回复，提供更自然的交互体验
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="h-6 w-6 mr-2 text-purple-600" />
                图像分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                智能图像识别和分析，支持多种图片格式的内容理解
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-6 w-6 mr-2 text-orange-600" />
                文档处理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                支持多种文档格式解析，包括PDF、Word、Excel等
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-yellow-600" />
                个性化学习
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                基于用户行为的个性化推荐和智能学习系统
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-6 w-6 mr-2 text-red-600" />
                多模态融合
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                整合文本、语音、图像等多种模态，提供全方位AI服务
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/simple">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                简洁版体验
              </Button>
            </Link>
            <Link href="/complete">
              <Button size="lg" variant="outline">
                完整版体验
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                功能演示
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link href="/test-api">
              <Button variant="secondary">
                API 测试
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="secondary">
                文档上传
              </Button>
            </Link>
            <Link href="/media-test">
              <Button variant="secondary">
                多媒体测试
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>© 2024 飘叔Agent. 智能AI助手，让交互更简单。</p>
        </div>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/app/page.tsx', homePageContent);
console.log('✅ 主页面已修复');

console.log('\n🎉 构建问题修复完成！');
console.log('\n接下来可以尝试运行：');
console.log('- yarn build (如果yarn安装完成)');
console.log('- 或者等待依赖安装完成后再构建');