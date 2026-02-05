'use client';

// 禁用静态生成
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Trash2, Upload } from 'lucide-react';

const AdminPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/articles?page=1&limit=50');
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data?.articles || []);
      }
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true })
      });

      const data = await response.json();
      if (data.success) {
        loadArticles();
        alert('删除成功');
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除失败');
    } finally {
      setLoading(false);
    }
  };

  const openWindow = (url) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Shield className="h-8 w-8 text-red-600" />
                  飘叔Agent 管理后台
                </h1>
                <p className="text-gray-600">
                  飘叔专用管理界面
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/upload', '_blank')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  上传内容
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/', '_blank')}
                  className="flex items-center gap-2"
                >
                  返回主页
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {/* 文章管理 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>文章管理</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={loadArticles} disabled={loading}>
                      刷新
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteAll}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除全部
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    共 {articles?.length || 0} 篇文章
                  </p>
                  
                  {loading ? (
                    <div className="text-center py-8">加载中...</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {articles?.map((article) => (
                        <div key={article.id} className="p-3 border rounded">
                          <h3 className="font-medium">{article.title}</h3>
                          <p className="text-sm text-gray-600">
                            {article.category} • {article.author}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 快速链接 */}
            <Card>
              <CardHeader>
                <CardTitle>快速链接</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => openWindow('/upload')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  文章上传工具
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => openWindow('/upload/book')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  书籍上传工具
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;