'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Mic, Image as ImageIcon, Upload, FileText } from 'lucide-react';

interface MultiFunctionMenuProps {
  onVoiceInput?: () => void;
  onImageAnalysis?: () => void;
  onMediaUpload?: () => void;
  onFileUpload?: () => void;
  disabled?: boolean;
}

export function MultiFunctionMenu({
  onVoiceInput,
  onImageAnalysis,
  onMediaUpload,
  onFileUpload,
  disabled = false
}: MultiFunctionMenuProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action: () => void | undefined, fallbackUrl?: string) => {
    if (action) {
      action();
    } else if (fallbackUrl) {
      window.open(fallbackUrl, '_blank');
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        disabled={disabled}
        onClick={handleMenuToggle}
        className="h-9 w-9 md:h-10 md:w-10"
        title="添加内容"
      >
        <Plus className="h-4 w-4" />
      </Button>
      
      {showMenu && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2">添加内容到对话</div>
            
            <button
              onClick={() => handleMenuAction(onVoiceInput)}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
            >
              <Mic className="h-4 w-4" />
              <div>
                <div className="text-sm">语音输入</div>
                <div className="text-xs text-gray-500">说话转换为文字</div>
              </div>
            </button>

            <button
              onClick={() => handleMenuAction(onImageAnalysis, '/media-test')}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
            >
              <ImageIcon className="h-4 w-4" />
              <div>
                <div className="text-sm">图片分析</div>
                <div className="text-xs text-gray-500">上传图片进行AI分析</div>
              </div>
            </button>

            <hr className="my-2" />

            <button
              onClick={() => handleMenuAction(onMediaUpload, '/upload')}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
            >
              <Upload className="h-4 w-4" />
              <div>
                <div className="text-sm">多媒体上传</div>
                <div className="text-xs text-gray-500">图片、视频、文档等</div>
              </div>
            </button>

            <button
              onClick={() => handleMenuAction(onFileUpload, '/upload/book')}
              className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
            >
              <FileText className="h-4 w-4" />
              <div>
                <div className="text-sm">文档上传</div>
                <div className="text-xs text-gray-500">PDF、Word、文本文件</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}