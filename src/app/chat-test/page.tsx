'use client';

import { ChatInterface } from '@/components/ChatInterface';

export default function ChatTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">微信风格Plus按钮测试</h1>
        <p className="text-center text-gray-600 mb-6">
          这里可以测试微信风格的Plus按钮功能
        </p>
        
        <ChatInterface />
        
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">使用说明:</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. 在输入框左侧找到 ➕ 按钮</li>
            <li>2. 点击 ➕ 按钮展开功能菜单</li>
            <li>3. 选择语音、图片、上传或文档功能</li>
            <li>4. 按钮会有旋转动画效果</li>
          </ul>
        </div>
      </div>
    </div>
  );
}