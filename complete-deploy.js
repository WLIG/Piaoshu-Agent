const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('Complete Fix and Deploy Process');
console.log('========================================\n');

function runCommand(command, description, required = true) {
  console.log(`[${description}]`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`✓ ${description} completed\n`);
    return true;
  } catch (error) {
    if (required) {
      console.error(`✗ ${description} failed!`);
      console.error(`Error: ${error.message}\n`);
      return false;
    } else {
      console.log(`⚠ ${description} failed, continuing...\n`);
      return true;
    }
  }
}

async function main() {
  // Step 1: Clean cache
  runCommand('npm cache clean --force', '1/7 Cleaning npm cache', false);

  // Step 2: Install dependencies
  if (!runCommand('npm install', '2/7 Installing dependencies', true)) {
    process.exit(1);
  }

  // Step 3: Generate Prisma
  runCommand('npx prisma generate', '3/7 Generating Prisma client', false);

  // Step 4: Build
  if (!runCommand('npx next build', '4/7 Building Next.js', true)) {
    process.exit(1);
  }

  // Step 5: Git status
  runCommand('git status', '5/7 Checking git status', false);

  // Step 6: Git add and commit
  console.log('[6/7 Committing changes]');
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Fix build errors and update configuration"', { stdio: 'inherit' });
    console.log('✓ Changes committed\n');
  } catch (error) {
    console.log('⚠ No changes to commit or commit failed\n');
  }

  // Step 7: Push to GitHub
  console.log('[7/7 Pushing to GitHub]');
  try {
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✓ Pushed to GitHub (main branch)\n');
  } catch (error) {
    try {
      execSync('git push origin master', { stdio: 'inherit' });
      console.log('✓ Pushed to GitHub (master branch)\n');
    } catch (error2) {
      console.log('⚠ Push failed, you may need to push manually\n');
    }
  }

  console.log('========================================');
  console.log('SUCCESS! Process completed');
  console.log('========================================\n');
  console.log('Next steps:');
  console.log('1. Go to https://vercel.com/wligs-projects');
  console.log('2. Click on your project');
  console.log('3. Click "Redeploy" or wait for automatic deployment\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
