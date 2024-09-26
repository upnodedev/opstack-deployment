import express from 'express';
import requireJWTAuth from '../middleware/requireJWTAuth';
import simpleGit, { SimpleGit } from 'simple-git';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createEnvFile } from '../utils/deployment';
import prisma from '../core/prisma';
import { mergeDict } from '../utils';
import { rollupConfig } from '../constant/rollup.config';
import { deployExec } from '../core/deployment';

const git: SimpleGit = simpleGit();

const router = express.Router();

const repoUrl: string = 'https://github.com/upnodedev/opstack-compose.git';
const targetDir: string = path.join(__dirname, '../', '../', 'service');

router.post('/rollup', requireJWTAuth, async (req, res) => {
  // check if service exists
  const service = await prisma.service.findFirst({
    where: {
      name: 'node',
    },
  });

  console.log(service);

  if (service) {
    return res.status(400).json({ message: 'Service already exists' });
  }

  const serviceCreate = await prisma.service.create({
    data: {
      name: 'node',
    },
  });

  const env = mergeDict(rollupConfig, req.body);

  // save env to database
  await prisma.config.createMany({
    data: Object.keys(env).map((key) => ({
      key,
      value: {
        value: env[key],
      },
      serviceId: serviceCreate.id,
    })),
  });

  const repoName = path.basename(repoUrl, '.git');
  const repoPath = path.join(targetDir, repoName);

  try {
    // delete the existing directory
    if (fs.existsSync(repoPath)) {
      fs.rmdirSync(repoPath, { recursive: true });
    }

    await git.clone(repoUrl, repoPath);
    createEnvFile(env, repoPath);
    deployExec.rollup = exec(
      `docker-compose -f ${path.join(
        repoPath,
        'docker-compose.yml'
      )} --profile sequencer up -d --build`,
      { cwd: repoPath },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return res.status(500).json({ message: `Error: ${error.message}` });
        }
        res.status(200).json({ message: 'Docker Compose started successfully', stdout, stderr });
      }
    );
  } catch (error) {
    console.error(`Error during deployment: ${(error as Error).message}`);
  }
});

export default router;
