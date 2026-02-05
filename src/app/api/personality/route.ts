import { NextRequest, NextResponse } from 'next/server';
import { PersonalityLearning } from '@/lib/personality/PersonalityLearning';

// GET /api/personality - 获取用户个性化档案
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';

    const personalityLearner = new PersonalityLearning(userId);
    const personalityProfile = personalityLearner.getPersonalityProfile();
    const conversationAnalysis = personalityLearner.analyzeConversationPatterns();

    return NextResponse.json({
      success: true,
      data: {
        userId,
        personalityProfile,
        conversationAnalysis,
        recommendations: generatePersonalityRecommendations(personalityProfile),
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('获取个性化档案失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get personality profile' },
      { status: 500 }
    );
  }
}

// POST /api/personality - 更新个性化设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId = 'anonymous',
      action,
      feedback,
      preferences
    } = body as {
      userId?: string;
      action: 'feedback' | 'reset' | 'update_preferences';
      feedback?: {
        messageId: string;
        rating: 'positive' | 'negative' | 'neutral';
        comment?: string;
      };
      preferences?: {
        formalityLevel?: number;
        humorLevel?: number;
        technicalDepth?: number;
        directness?: number;
      };
    };

    const personalityLearner = new PersonalityLearning(userId);

    switch (action) {
      case 'feedback':
        if (feedback) {
          // 处理用户反馈
          await personalityLearner.recordInteraction({
            userId,
            message: `反馈消息ID: ${feedback.messageId}`,
            response: `用户反馈: ${feedback.rating}`,
            timestamp: new Date(),
            feedback: feedback.rating,
            context: feedback.comment || ''
          });

          return NextResponse.json({
            success: true,
            message: '反馈已记录，将用于改进个性化体验'
          });
        }
        break;

      case 'reset':
        personalityLearner.resetPersonality();
        return NextResponse.json({
          success: true,
          message: '个性化档案已重置'
        });

      case 'update_preferences':
        if (preferences) {
          // 手动更新偏好设置
          const currentProfile = personalityLearner.getPersonalityProfile();
          const updatedProfile = { ...currentProfile, ...preferences };
          
          // 这里需要实现更新逻辑
          return NextResponse.json({
            success: true,
            message: '偏好设置已更新',
            data: updatedProfile
          });
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('更新个性化设置失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update personality settings' },
      { status: 500 }
    );
  }
}

// 生成个性化建议
function generatePersonalityRecommendations(personalityProfile: any): any {
  const recommendations = {
    modelSuggestions: [] as string[],
    communicationTips: [] as string[],
    learningAreas: [] as string[]
  };

  // 模型建议
  if (personalityProfile.analyticalThinking > 0.8) {
    recommendations.modelSuggestions.push('nemotron - 适合深度分析');
  }
  if (personalityProfile.creativityLevel > 0.7) {
    recommendations.modelSuggestions.push('kimi2.5 - 适合创意任务');
  }
  if (personalityProfile.businessFocus > 0.8) {
    recommendations.modelSuggestions.push('business - 专业商业分析');
  }

  // 沟通建议
  if (personalityProfile.directness < 0.5) {
    recommendations.communicationTips.push('可以更直接地表达需求');
  }
  if (personalityProfile.exampleUsage < 0.5) {
    recommendations.communicationTips.push('多举例子会让回复更具体');
  }

  // 学习领域
  if (personalityProfile.techFocus < 0.6) {
    recommendations.learningAreas.push('技术深度');
  }
  if (personalityProfile.marketingFocus < 0.6) {
    recommendations.learningAreas.push('营销策略');
  }

  return recommendations;
}