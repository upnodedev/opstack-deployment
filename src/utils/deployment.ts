import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';
// import { exec } from 'child-process-promise';
import { exec } from 'child_process';

const git = simpleGit();

export async function createEnvFile(
  config: Record<string, any>,
  repoPath: string
) {
  const envFilePath = path.join(repoPath, '.env');
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write the .env content to file
  fs.writeFileSync(envFilePath, envContent, 'utf-8');
  console.log('.env file created successfully.');
}
