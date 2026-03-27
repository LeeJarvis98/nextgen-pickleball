import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('ERROR: .env.local not found');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#') && line.includes('='))
    .map(line => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim()];
    })
);

const token = env.VERCEL_TOKEN;
if (!token) {
  console.error('ERROR: VERCEL_TOKEN not found in .env.local');
  process.exit(1);
}

const isPreview = process.argv.includes('--preview');
const prodFlag = isPreview ? '' : '--prod';
const cmd = `npx vercel deploy --token ${token} ${prodFlag}`.trim();

console.log(`Deploying to ${isPreview ? 'preview' : 'production'}...`);
execSync(cmd, { stdio: 'inherit' });
