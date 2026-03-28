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

const vercelProjectJson = resolve(process.cwd(), '.vercel', 'project.json');
if (!existsSync(vercelProjectJson)) {
  console.error('ERROR: Project not linked. Run the following command first:');
  console.error(`  npx vercel link --token <your-token> --yes`);
  console.error('This creates .vercel/project.json which identifies your project for deployments.');
  process.exit(1);
}

const isPreview = process.argv.includes('--preview');
const prodFlag = isPreview ? '' : '--prod';
const cmd = `npx vercel deploy ${prodFlag} --yes`.trim();

// Pass the token via environment variable — never interpolate secrets into command strings
const deployEnv = {
  ...process.env,
  VERCEL_TOKEN: token,
};

console.log(`Deploying to ${isPreview ? 'preview' : 'production'}...`);
try {
  execSync(cmd, { stdio: 'inherit', env: deployEnv });
} catch {
  console.error('\nDeployment failed. Check the Vercel output above for details.');
  process.exit(1);
}
