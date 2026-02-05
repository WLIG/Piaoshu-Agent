'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, onError, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 开始录音
  const startRecording = useCallback(async () => {
    try {
      // 检查浏览器支持
      if (!navigator || !('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
        onError?.('浏览器不支持录音功能');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });

      // 检查MediaRecorder支持
      if (typeof window !== 'undefined' && 'MediaRecorder' in window) {
        const mediaRecorder = new (window as any).MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event: any) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
          
          // 停止所有音频轨道
          stream.getTracks().forEach((track: any) => track.stop());
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
      } else {
        onError?.('浏览器不支持MediaRecorder');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('无法访问麦克风，请检查权限设置');
    }
  }, [onError]);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  // 处理音频
  const processAudio = async (audioBlob: Blob) => {
    try {
      // 转换为base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // 发送到ASR API
      const response = await fetch('/api/multimodal/asr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio.split(',')[1], // 移除data:audio/webm;base64,前缀
          provider: 'mock',
          language: 'zh-CN'
        }),
      });

      const result = await response.json() as any;
      
      if (result.success && result.data?.text) {
        console.log(`🎯 语音识别成功: "${result.data.text}" (置信度: ${(result.data.confidence * 100).toFixed(1)}%)`);
        onTranscript(result.data.text);
      } else {
        const errorMsg = result.suggestion ? 
          `${result.error}\n💡 ${result.suggestion}` : 
          result.error || '语音识别失败，请重试';
        onError?.(errorMsg);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      onError?.('语音处理失败，请检查网络连接后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // Blob转Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && 'FileReader' in window) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } else {
        reject(new Error('FileReader not supported'));
      }
    });
  };

  // 切换录音状态
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <div className="relative">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={toggleRecording}
          disabled={disabled || isProcessing}
          className={`relative h-10 w-10 md:h-12 md:w-12 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Mic className="h-4 w-4 md:h-5 md:w-5" />
          )}
          
          {/* 录音动画效果 */}
          {isRecording && (
            <div className="absolute inset-0 rounded-md border-2 border-red-400 animate-pulse" />
          )}
        </Button>
      </div>

      {/* 状态指示 */}
      <div className="flex-1 min-w-0">
        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-3 md:h-4 bg-red-500 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="truncate">正在录音...</span>
          </div>
        )}

        {isProcessing && (
          <div className="text-sm text-blue-600">
            正在识别...
          </div>
        )}
      </div>
    </div>
  );
}