'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, TrendingUp, Heart, BookOpen, Award } from 'lucide-react';

interface UserStats {
  totalReads: number;
  totalLikes: number;
  totalShares: number;
  avgReadDuration: number;
  level: number;
  levelProgress: number;
}

interface UserInterest {
  category: string;
  score: number;
}

interface UserProfileProps {
  userId?: string;
}

export function UserProfile({ userId = 'anonymous' }: UserProfileProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [statsRes, interestsRes] = await Promise.all([
        fetch(`/api/users/${userId}/stats`),
        fetch(`/api/users/${userId}/interests`),
      ]);
      
      const statsData = await statsRes.json();
      const interestsData = await interestsRes.json();
      
      if (statsData.success) setStats(statsData.data);
      if (interestsData.success) setInterests(interestsData.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="h-40 bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder-avatar.png" />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>访客用户</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                等级 {stats?.level || 1}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stats">统计</TabsTrigger>
            <TabsTrigger value="interests">兴趣</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">升级进度</span>
                <span className="font-medium">{stats?.levelProgress || 0}%</span>
              </div>
              <Progress value={stats?.levelProgress || 0} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{stats?.totalReads || 0}</div>
                <div className="text-xs text-muted-foreground">阅读文章</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Heart className="h-6 w-6 text-red-500 mb-2" />
                <div className="text-2xl font-bold">{stats?.totalLikes || 0}</div>
                <div className="text-xs text-muted-foreground">点赞</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
                <div className="text-2xl font-bold">{stats?.totalShares || 0}</div>
                <div className="text-xs text-muted-foreground">分享</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Award className="h-6 w-6 text-purple-500 mb-2" />
                <div className="text-2xl font-bold">
                  {Math.round((stats?.avgReadDuration || 0) / 60)}
                </div>
                <div className="text-xs text-muted-foreground">平均阅读(分钟)</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="interests" className="space-y-3">
            {interests.length > 0 ? (
              interests.map((interest, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{interest.category}</span>
                    <span className="text-muted-foreground">
                      {Math.round(interest.score * 100)}%
                    </span>
                  </div>
                  <Progress value={interest.score * 100} />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无兴趣数据</p>
                <p className="text-xs mt-2">多阅读文章来建立你的兴趣画像</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
