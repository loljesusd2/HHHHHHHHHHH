
// This file redirects to the actual seed script in scripts/seed.ts
const { spawn } = require('child_process');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'scripts', 'seed.ts');
const child = spawn('tsx', [seedPath], { stdio: 'inherit' });

child.on('close', (code: number | null) => {
  process.exit(code || 0);
});
