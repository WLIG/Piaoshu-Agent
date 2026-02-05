#!/usr/bin/env node

// Piaoshu Agent Skills安装脚本
// 模拟 npx skills add <owner/repo> 命令的功能

const fs = require('fs');
const path = require('path');

class SkillsInstaller {
  constructor() {
    this.skillsDir = path.join(process.cwd(), 'skills');
    this.configFile = path.join(this.skillsDir, 'skills.json');
    this.ensureSkillsDirectory();
  }

  ensureSkillsDirectory() {
    if (!fs.existsSync(this.skillsDir)) {
      fs.mkdirSync(this.skillsDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.configFile)) {
      fs.writeFileSync(this.configFile, JSON.stringify({
        version: "1.0.0",
        installedSkills: {},
        lastUpdated: new Date().toISOString()
      }, null, 2));
    }
  }

  loadConfig() {
    return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
  }

  saveConfig(config) {
    config.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
  }

  async installSkill(skillRepo) {
    console.log(`📦 Installing skill: ${skillRepo}`);
    
    const [owner, repo] = skillRepo.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid skill format. Use: owner/repo');
    }

    // 模拟技能下载和验证
    const skillInfo = await this.downloadSkill(skillRepo);
    
    // 验证技能质量
    const qualityCheck = this.validateSkillQuality(skillInfo);
    if (!qualityCheck.passed) {
      throw new Error(`Skill quality check failed: ${qualityCheck.reason}`);
    }

    // 安装技能
    const config = this.loadConfig();
    config.installedSkills[skillRepo] = {
      ...skillInfo,
      installedAt: new Date().toISOString(),
      status: 'active'
    };
    
    this.saveConfig(config);
    
    // 创建技能文件
    this.createSkillFiles(skillRepo, skillInfo);
    
    console.log(`✅ Successfully installed: ${skillInfo.name}`);
    return skillInfo;
  }

  async downloadSkill(skillRepo) {
    // 模拟从GitHub或技能仓库下载
    console.log(`   Downloading ${skillRepo}...`);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const [owner, repo] = skillRepo.split('/');
    
    // 根据技能类型生成不同的技能信息
    const skillInfo = this.generateSkillInfo(owner, repo);
    
    console.log(`   Downloaded ${skillInfo.name} v${skillInfo.version}`);
    return skillInfo;
  }

  generateSkillInfo(owner, repo) {
    const skillTypes = {
      'blockchain': {
        capabilities: ['DeFi分析', '智能合约审计', '代币经济学', '流动性分析'],
        description: '区块链和DeFi生态系统分析工具',
        tags: ['blockchain', 'defi', 'smart-contracts', 'tokenomics']
      },
      'web4': {
        capabilities: ['去中心化身份', '用户主权', '隐私协议', '数据自主权'],
        description: 'Web4.0生态系统分析和设计工具',
        tags: ['web4', 'decentralized', 'privacy', 'user-sovereignty']
      },
      'business': {
        capabilities: ['市场分析', '商业模式', '竞争情报', '财务建模'],
        description: '商业分析和战略规划工具',
        tags: ['business', 'strategy', 'market-analysis', 'financial-modeling']
      },
      'ai': {
        capabilities: ['模型架构', '性能优化', '训练策略', '部署方案'],
        description: 'AI和机器学习技术分析工具',
        tags: ['ai', 'machine-learning', 'neural-networks', 'optimization']
      },
      'data': {
        capabilities: ['数据分析', '趋势预测', '统计建模', '可视化'],
        description: '数据科学和分析工具',
        tags: ['data-science', 'analytics', 'statistics', 'visualization']
      },
      'piaoshu': {
        capabilities: ['Web4.0分析', '蜂窝智能', '商业策略', '趋势预测'],
        description: '飘叔专有的分析和预测工具',
        tags: ['piaoshu', 'web4', 'cellular-intelligence', 'business-strategy']
      }
    };

    const skillType = skillTypes[owner] || skillTypes['business'];
    
    return {
      name: repo,
      version: '1.0.' + Math.floor(Math.random() * 10),
      owner: owner,
      repository: `${owner}/${repo}`,
      description: skillType.description,
      capabilities: skillType.capabilities,
      tags: skillType.tags,
      author: owner,
      license: 'MIT',
      size: Math.floor(Math.random() * 500 + 100) + 'KB',
      quality: {
        reliability: Math.random() * 0.3 + 0.7,
        documentation: Math.random() * 0.2 + 0.8,
        compatibility: Math.random() * 0.2 + 0.8,
        performance: Math.random() * 0.1 + 0.9
      },
      dependencies: [],
      lastUpdated: new Date().toISOString()
    };
  }

  validateSkillQuality(skillInfo) {
    const minQuality = 0.7;
    const quality = skillInfo.quality;
    
    if (quality.reliability < minQuality) {
      return { passed: false, reason: 'Reliability score too low' };
    }
    
    if (quality.compatibility < minQuality) {
      return { passed: false, reason: 'Compatibility score too low' };
    }
    
    if (quality.documentation < 0.6) {
      return { passed: false, reason: 'Documentation quality insufficient' };
    }
    
    return { passed: true };
  }

  createSkillFiles(skillRepo, skillInfo) {
    const skillDir = path.join(this.skillsDir, skillRepo.replace('/', '-'));
    
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    
    // 创建技能配置文件
    const configPath = path.join(skillDir, 'skill.json');
    fs.writeFileSync(configPath, JSON.stringify(skillInfo, null, 2));
    
    // 创建技能实现文件
    const implPath = path.join(skillDir, 'index.js');
    const implContent = this.generateSkillImplementation(skillInfo);
    fs.writeFileSync(implPath, implContent);
    
    // 创建README文件
    const readmePath = path.join(skillDir, 'README.md');
    const readmeContent = this.generateSkillReadme(skillInfo);
    fs.writeFileSync(readmePath, readmeContent);
  }

  generateSkillImplementation(skillInfo) {
    return `// ${skillInfo.name} Skill Implementation
// Generated by Piaoshu Agent Skills System

class ${skillInfo.name.charAt(0).toUpperCase() + skillInfo.name.slice(1)}Skill {
  constructor() {
    this.name = '${skillInfo.name}';
    this.version = '${skillInfo.version}';
    this.capabilities = ${JSON.stringify(skillInfo.capabilities, null, 2)};
  }

  async analyze(query, context = {}) {
    console.log(\`🔍 \${this.name} analyzing: \${query.substring(0, 50)}...\`);
    
    // 模拟分析处理
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    return {
      analysis: this.generateAnalysis(query, context),
      confidence: ${skillInfo.quality.reliability.toFixed(2)},
      sources: ['${skillInfo.repository}'],
      metadata: {
        skill: this.name,
        version: this.version,
        processingTime: Date.now()
      }
    };
  }

  generateAnalysis(query, context) {
    // 基于技能类型生成分析内容
    const analysisTemplates = {
      '${skillInfo.owner}': \`基于${skillInfo.description}的专业分析：

• **核心洞察**: \${query}相关的关键要点和趋势
• **技术评估**: 当前技术水平和发展潜力
• **商业价值**: 市场机会和商业化路径
• **风险分析**: 主要风险因素和应对策略
• **实施建议**: 具体的行动方案和优化建议

**结论**: 基于专业分析，建议关注核心技术发展和市场机会。\`
    };
    
    return analysisTemplates['${skillInfo.owner}'] || '专业分析结果';
  }

  getCapabilities() {
    return this.capabilities;
  }

  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      owner: '${skillInfo.owner}',
      description: '${skillInfo.description}',
      tags: ${JSON.stringify(skillInfo.tags)}
    };
  }
}

module.exports = ${skillInfo.name.charAt(0).toUpperCase() + skillInfo.name.slice(1)}Skill;
`;
  }

  generateSkillReadme(skillInfo) {
    return `# ${skillInfo.name}

${skillInfo.description}

## 功能特性

${skillInfo.capabilities.map(cap => `- ${cap}`).join('\n')}

## 安装信息

- **版本**: ${skillInfo.version}
- **作者**: ${skillInfo.author}
- **大小**: ${skillInfo.size}
- **许可**: ${skillInfo.license}

## 质量评分

- **可靠性**: ${(skillInfo.quality.reliability * 100).toFixed(0)}%
- **文档完善度**: ${(skillInfo.quality.documentation * 100).toFixed(0)}%
- **兼容性**: ${(skillInfo.quality.compatibility * 100).toFixed(0)}%
- **性能**: ${(skillInfo.quality.performance * 100).toFixed(0)}%

## 标签

${skillInfo.tags.map(tag => `\`${tag}\``).join(' ')}

## 使用方法

\`\`\`javascript
const skill = require('./index.js');
const result = await skill.analyze('your query here');
console.log(result.analysis);
\`\`\`

---

*由 Piaoshu Agent Skills System 自动生成*
`;
  }

  listInstalledSkills() {
    const config = this.loadConfig();
    const skills = Object.entries(config.installedSkills);
    
    if (skills.length === 0) {
      console.log('📦 No skills installed yet.');
      return;
    }
    
    console.log('📦 Installed Skills:');
    console.log('='.repeat(50));
    
    skills.forEach(([repo, info]) => {
      const quality = Math.round(
        (info.quality.reliability + info.quality.compatibility + 
         info.quality.documentation + info.quality.performance) / 4 * 100
      );
      
      console.log(`${repo}`);
      console.log(`  📝 ${info.description}`);
      console.log(`  🏷️  ${info.tags.join(', ')}`);
      console.log(`  ⭐ Quality: ${quality}%`);
      console.log(`  📅 Installed: ${new Date(info.installedAt).toLocaleDateString()}`);
      console.log('');
    });
  }

  async installCoreSkills() {
    const coreSkills = [
      'blockchain/defi-analysis',
      'web4/decentralized-identity', 
      'business/startup-analysis',
      'ai/transformer-architecture',
      'data/market-research',
      'piaoshu/web4-analysis'
    ];

    console.log('🚀 Installing Piaoshu Agent Core Skills...');
    console.log('='.repeat(50));
    
    for (const skill of coreSkills) {
      try {
        await this.installSkill(skill);
      } catch (error) {
        console.error(`❌ Failed to install ${skill}: ${error.message}`);
      }
    }
    
    console.log('');
    console.log('✅ Core skills installation completed!');
    this.listInstalledSkills();
  }
}

// CLI 接口
async function main() {
  const installer = new SkillsInstaller();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Piaoshu Agent Skills System');
    console.log('');
    console.log('Usage:');
    console.log('  node install-skills.js add <owner/repo>     Install a skill');
    console.log('  node install-skills.js list                List installed skills');
    console.log('  node install-skills.js core                Install core skills');
    console.log('');
    console.log('Examples:');
    console.log('  node install-skills.js add blockchain/defi-analysis');
    console.log('  node install-skills.js add web4/decentralized-identity');
    console.log('  node install-skills.js add business/startup-analysis');
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'add':
        if (args.length < 2) {
          console.error('❌ Please specify a skill to install: owner/repo');
          process.exit(1);
        }
        await installer.installSkill(args[1]);
        break;
        
      case 'list':
        installer.listInstalledSkills();
        break;
        
      case 'core':
        await installer.installCoreSkills();
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SkillsInstaller;