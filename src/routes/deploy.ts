import express from 'express';
import requireJWTAuth from '../middleware/requireJWTAuth';
import simpleGit, { SimpleGit } from 'simple-git';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createEnvFile } from '../utils/deployment';
import prisma from '../core/prisma';
import { mergeDict, replaceEnv } from '../utils';
import { rollupConfig } from '../constant/rollup.config';
import { deployExec, deployService } from '../core/deployment';
import Docker from 'dockerode';

const git: SimpleGit = simpleGit();
const router = express.Router();

const repoUrl: string = 'https://github.com/upnodedev/opstack-compose.git';
const targetDir: string = path.join(__dirname, '../', '../', 'service');

// router.post('/rollup2', requireJWTAuth, async (req, res) => {
//   // check if service exists
//   const service = await prisma.service.findFirst({
//     where: {
//       name: 'node',
//     },
//   });

//   if (service) {
//     return res.status(400).json({ message: 'Service already exists' });
//   }

//   const serviceCreate = await prisma.service.create({
//     data: {
//       name: 'node',
//     },
//   });

//   const env = mergeDict(rollupConfig, req.body);

//   // save env to database
//   await prisma.config.createMany({
//     data: Object.keys(env).map((key) => ({
//       key,
//       value: {
//         value: env[key],
//       },
//       serviceId: serviceCreate.id,
//     })),
//   });

//   const repoName = path.basename(repoUrl, '.git');
//   const repoPath = path.join(targetDir, repoName);

//   try {
//     // delete the existing directory
//     if (fs.existsSync(repoPath)) {
//       fs.rmdirSync(repoPath, { recursive: true });
//     }

//     await git.clone(repoUrl, repoPath);
//     createEnvFile(env, repoPath);
//     deployExec.rollup = exec(
//       `docker-compose -f ${path.join(
//         repoPath,
//         'docker-compose.yml'
//       )} --profile sequencer up -d --build`,
//       { cwd: repoPath }
//     );

//     // Capture stdout (standard output)
//     deployExec.rollup.stdout.on('data', async (data) => {
//       await prisma.logging.create({
//         data: {
//           message: data.toString(),
//           service: 'rollup',
//         },
//       });
//     });

//     // Capture stderr (error output)
//     deployExec.rollup.stderr.on('data', async (data) => {
//       await prisma.logging.create({
//         data: {
//           message: data.toString(),
//           service: 'rollup',
//         },
//       });
//     });

//     // Handle process close event
//     deployExec.rollup.on('close', async (code) => {
//       await prisma.logging.create({
//         data: {
//           message: `Process exited with code ${code}`,
//           service: 'rollup',
//         },
//       });
//     });

//     return res.status(200).json({ message: 'Deployment started' });
//   } catch (error) {
//     console.error(`Error during deployment: ${(error as Error).message}`);

//     return res.status(500).json({ message: 'Deployment failed' });
//   }
// });

router.get('/log/:name', requireJWTAuth, async (req, res) => {
  const name = req.params.name;
  const logs = await prisma.logging.findMany({
    where: {
      service: name,
    },
  });
  const logMessages = logs.map((log) => log.message).join('');

  return res.status(200).json({ message: logMessages });
});

router.post('/rollup', requireJWTAuth, async (req, res) => {
  const payload = req.body;

  const repoName = 'opstack-compose';
  const repoPath = path.join(targetDir, repoName);
  await git.clone(repoUrl, repoPath);

  const rollupProcess = await deployService(
    'rollup',
    repoPath,
    'docker-compose.yml',
    rollupConfig,
    payload,
    async () => {
      const envPath = path.join(
        repoPath,
        'blockscout',
        'envs',
        'common-frontend.env'
      );

      const env = fs.readFileSync(envPath, 'utf8');
      const newEnv = replaceEnv(env, {
        NEXT_PUBLIC_NETWORK_NAME: payload.L2_CHAIN_NAME,
        NEXT_PUBLIC_NETWORK_SHORT_NAME: payload.L2_CHAIN_NAME,
        NEXT_PUBLIC_NETWORK_ID: payload.L2_CHAIN_ID,
        NEXT_PUBLIC_IS_TESTNET: false,
      });

      fs.writeFileSync(envPath, newEnv);

      await deployService(
        'blockscout',
        path.join(repoPath, 'blockscout'),
        'docker-compose.yml',
        {},
        {},
        () => {}
      );
    }
  );

  if (rollupProcess.isSuccess) {
    return res.status(200).json({ message: rollupProcess.message });
  } else {
    return res.status(500).json({ message: rollupProcess.message });
  }
});

export default router;
