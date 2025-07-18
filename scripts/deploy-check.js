
/**
 * Pre-deploy verification script for Beauty GO
 * Checks all requirements before deploying to Netlify
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Beauty GO - Pre-Deploy Verification\n');

const checks = [
  {
    name: 'Netlify configuration',
    check: () => fs.existsSync('netlify.toml'),
    message: 'netlify.toml file exists'
  },
  {
    name: 'Environment variables template',
    check: () => fs.existsSync('.env.example'),
    message: '.env.example file exists'
  },
  {
    name: 'Package.json',
    check: () => fs.existsSync('package.json'),
    message: 'package.json file exists'
  },
  {
    name: 'Prisma schema',
    check: () => fs.existsSync('prisma/schema.prisma'),
    message: 'Prisma schema file exists'
  },
  {
    name: 'Deploy documentation',
    check: () => fs.existsSync('README-NETLIFY-DEPLOY.md'),
    message: 'Deploy documentation exists'
  },
  {
    name: 'Health check function',
    check: () => fs.existsSync('netlify/functions/health.js'),
    message: 'Health check Netlify function exists'
  },
  {
    name: 'Node modules',
    check: () => fs.existsSync('node_modules'),
    message: 'Dependencies are installed'
  },
  {
    name: 'Prisma client',
    check: () => {
      try {
        require('@prisma/client');
        return true;
      } catch (e) {
        return false;
      }
    },
    message: 'Prisma client is available'
  }
];

let allPassed = true;

console.log('Running pre-deploy checks...\n');

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}: ${check.message}`);
  
  if (!passed) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for Netlify deployment.');
  console.log('\nNext steps:');
  console.log('1. Commit your changes to Git');
  console.log('2. Push to your repository');
  console.log('3. Connect repository to Netlify');
  console.log('4. Configure environment variables');
  console.log('5. Deploy!');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues before deploying.');
  console.log('\nRefer to README-NETLIFY-DEPLOY.md for detailed instructions.');
  process.exit(1);
}
