import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"] as const,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"] as const,
});

export const metadata: Metadata = {
  title: "飘叔Agent - AI智能助手",
  description: "飘叔专属AI智能助手，提供智能对话、知识管理、文档处理等功能",
  keywords: ["飘叔Agent", "AI助手", "智能对话", "知识管理", "文档处理"],
  authors: [{ name: "飘叔团队" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        
        {/* 隐藏开发模式指示器的脚本 */}
        <Script id="hide-dev-indicator" strategy="afterInteractive">
          {`
            (function() {
              function hideDevIndicator() {
                const selectors = [
                  '[data-nextjs-toast-wrapper]',
                  '[data-nextjs-toast]',
                  '[data-nextjs-dialog-overlay]',
                  '[data-nextjs-dialog]',
                  '[data-nextjs-portal]',
                  '[data-nextjs-dev-overlay]',
                  '[data-nextjs-dev-indicator]',
                  '[data-turbopack-indicator]',
                  '[data-nextjs-indicator]',
                  '[data-nextjs-turbopack-indicator]',
                  '[data-turbopack-dev-indicator]',
                  '.__next-dev-overlay-wrapper',
                  '.__next-dev-overlay',
                  '.__next-dev-indicator',
                  '.__turbopack-indicator',
                  '.__nextjs-indicator',
                  '.turbopack-indicator',
                  '.next-indicator',
                  '[class*="nextjs"]',
                  '[class*="turbopack"]',
                  '[id*="nextjs"]',
                  '[id*="turbopack"]'
                ];

                selectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(element => {
                    element.style.display = 'none';
                    element.style.visibility = 'hidden';
                    element.style.opacity = '0';
                    element.style.pointerEvents = 'none';
                  });
                });

                // 隐藏小的固定定位元素
                const fixedElements = document.querySelectorAll('div[style*="position: fixed"]');
                fixedElements.forEach(element => {
                  const style = window.getComputedStyle(element);
                  const width = parseInt(style.width) || 0;
                  const height = parseInt(style.height) || 0;
                  const text = element.textContent?.trim() || '';
                  
                  if (width <= 60 && height <= 60 && (text === 'N' || text.length <= 3)) {
                    element.style.display = 'none';
                  }
                });
              }

              // 创建观察器
              const observer = new MutationObserver(hideDevIndicator);
              
              // 立即执行
              hideDevIndicator();
              
              // 开始观察
              observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class', 'id']
              });

              // 定期清理
              setInterval(hideDevIndicator, 1000);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
