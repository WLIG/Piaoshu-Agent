import { NextRequest, NextResponse } from 'next/server';
import { PiaoshuSkillsIntegration } from '@/lib/skills/PiaoshuSkillsIntegration';

// GET /api/skills/status - 获取Skills系统状态
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 检查Skills系统状态');
    
    const skillsSystem = new PiaoshuSkillsIntegration();
    
    // 获取已安装的技能
    const installedSkills = skillsSystem.getInstalledSkills();
    
    // 获取推荐技能
    const recommendedSkills = skillsSystem.getRecommendedSkills();
    
    // 系统状态
    const status = {
      isActive: true,
      version: '1.0.0',
      installedSkillsCount: installedSkills.length,
      totalRecommendedSkills: recommendedSkills.length,
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: {
        status,
        installedSkills: installedSkills.map(skill => ({
          name: skill.name,
          domain: skill.domain,
          version: skill.version,
          capabilities: skill.capabilities,
          quality: skill.quality,
          author: skill.author
        })),
        recommendedSkills: recommendedSkills.slice(0, 10), // 只返回前10个推荐
        domains: ['blockchain', 'web4', 'business', 'ai', 'architecture', 'data', 'piaoshu']
      }
    });
    
  } catch (error) {
    console.error('❌ Skills系统状态检查失败:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get skills system status',
      data: {
        status: {
          isActive: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, { status: 500 });
  }
}

// POST /api/skills/status - 安装核心技能
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始安装核心技能');
    
    const skillsSystem = new PiaoshuSkillsIntegration();
    
    // 安装核心技能
    await skillsSystem.installCoreSkills();
    
    // 获取安装后的状态
    const installedSkills = skillsSystem.getInstalledSkills();
    
    return NextResponse.json({
      success: true,
      message: '核心技能安装完成',
      data: {
        installedCount: installedSkills.length,
        skills: installedSkills.map(skill => ({
          name: skill.name,
          domain: skill.domain,
          quality: skill.quality
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ 核心技能安装失败:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to install core skills'
    }, { status: 500 });
  }
}