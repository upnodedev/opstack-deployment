import express from 'express';
import requireJWTAuth from '../middleware/requireJWTAuth';
import simpleGit, { SimpleGit } from 'simple-git';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { createEnvFile } from '../utils/deployment';
import prisma from '../core/prisma';
import { createNewEnv, mergeDict, replaceEnv, runCommand } from '../utils';
import { blockscoutConfig, rollupConfig } from '../constant/rollup.config';
import { deployExec, deployService } from '../core/deployment';
import Docker from 'dockerode';
import { ethers } from 'ethers';
import env from '../utils/env';
import { EnumStatus } from '@prisma/client';
import { getAllDockerPs } from '../core/container';

const git: SimpleGit = simpleGit();
const router = express.Router();

const repoUrl: string = 'https://github.com/upnodedev/opstack-compose.git';
const branchName: string = 'develop-full';
const targetDir: string = path.join(__dirname, '../', '../', 'service');

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
  const L1_RPC_URL = payload.L1_RPC_URL;
  const DOMAIN_NAME =
    process.env.DOMAIN_NAME === 'localhost'
      ? undefined
      : process.env.DOMAIN_NAME;

  // get current block number from L1
  const provider = new ethers.JsonRpcProvider(L1_RPC_URL);
  const blockNumber = await provider.getBlockNumber();

  if (fs.existsSync(repoPath)) {
    fs.rm(repoPath, { recursive: true, force: true }, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Failed to delete existing directory' });
      }
    });
  }

  // sleep 1 s

  await new Promise((resolve) => setTimeout(resolve, 5000));

  try {
    await git.clone(repoUrl, repoPath, [
      '-b',
      branchName,
      '--recurse-submodules',
    ]);
  } catch {
    return res.status(500).json({ message: 'Failed to clone repository' });
  }

  const domainList = {
    DOMAIN_NAME: DOMAIN_NAME,
    L2_RPC_URL: DOMAIN_NAME
      ? `https://chain.${DOMAIN_NAME}`
      : 'http://localhost:8545',
    L2_BLOCK_EXPLORER_URL_API: DOMAIN_NAME
      ? `https://blockscout.${DOMAIN_NAME}/api`
      : 'http://localhost:4240/api',
    L2_BLOCK_EXPLORER_URL: DOMAIN_NAME
      ? `https://blockscout.${DOMAIN_NAME}`
      : 'http://localhost:4240',
    OPSTACK_BRIDGE_INDEXER_SERVER: DOMAIN_NAME
      ? `https://opstack-bridge-indexer-server.${DOMAIN_NAME}`
      : 'http://localhost:3043',
    L2_STATS_API_HOST: DOMAIN_NAME
      ? `https://blockscout-stats.${DOMAIN_NAME}`
      : 'http://localhost:4241',
    L2_VISUALIZER_API_HOST: DOMAIN_NAME
      ? `https://blockscout-visualizer.${DOMAIN_NAME}`
      : 'http://localhost:4242',
  };

  // create indexer.env
  const envIndexerPath = path.join(repoPath, 'indexer.env');

  const newEnvIndexer = createNewEnv({
    L1_RPC_URL_1: payload.L1_RPC_URL,
    L1_CHAIN_NAME: payload.L1_CHAIN_NAME,
    L1_CHAIN_ID: payload.L1_CHAIN_ID,
    L1_LIMIT_BLOCKS: 1000,
    L1_PORTAL_ADDRESS: '0x',
    L1_PORTAL_BLOCK_CREATED: blockNumber,
    L2_RPC_URL_1: domainList.L2_RPC_URL,
    L2_CHAIN_NAME: payload.L2_CHAIN_NAME,
    L2_CHAIN_ID: payload.L2_CHAIN_ID,
    L2_STANDARD_BRIDGE_ADDRESS: '0x4200000000000000000000000000000000000010',
    L2_STANDARD_BRIDGE_BLOCK_CREATED: 0,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DB: 'indexer',
    DATABASE_URL: 'opstack-bridge-indexer-db:5432',
  });

  fs.writeFileSync(envIndexerPath, newEnvIndexer);

  // create deploy-override.json
  const deployOverridePath = path.join(repoPath, 'deploy-override.json');
  const deployOverride = {
    finalizationPeriodSeconds: payload.finalizationPeriodSeconds,
    l2OutputOracleSubmissionInterval: payload.l2OutputOracleSubmissionInterval,
    l2BlockTime: payload.l2BlockTime,
    governanceTokenSymbol: payload.governanceTokenSymbol,
    governanceTokenName: payload.governanceTokenName,
  };
  fs.writeFileSync(deployOverridePath, JSON.stringify(deployOverride, null, 2));

  const VITE_STATE_ROOT_PERIOD =
    payload.l2BlockTime * payload.l2OutputOracleSubmissionInterval;
  const VITE_WITHDRAWAL_PERIOD = +payload.finalizationPeriodSeconds;

  // create bridge.env
  const envUiPath = path.join(repoPath, 'ui.env');

  const newEnvUi = createNewEnv({
    VITE_APP_NAME: `${payload.L2_CHAIN_NAME} Bridge`,
    VITE_APP_LOGO: `${payload.APP_LOGO}`,
    VITE_COLOR_PRIMARY: `${payload.COLOR_PRIMARY}`,
    VITE_COLOR_SECONDARY: `${payload.COLOR_SECONDARY}`,
    VITE_L1_CHAIN_NAME: `${payload.L1_CHAIN_NAME}`,
    VITE_L1_CHAIN_ID: payload.L1_CHAIN_ID,
    VITE_L1_RPC_URL: payload.L1_RPC_URL,
    VITE_L1_LOGO_URL: payload.L1_LOGO_URL,
    VITE_L1_NATIVE_CURRENCY_DECIMALS: payload.L1_NATIVE_CURRENCY_DECIMALS || 18,
    VITE_L1_NATIVE_CURRENCY_NAME: payload.L1_NATIVE_CURRENCY_NAME,
    VITE_L1_NATIVE_CURRENCY_SYMBOL: payload.L1_NATIVE_CURRENCY_SYMBOL,
    VITE_L1_BLOCK_EXPLORER_NAME: `${payload.L1_CHAIN_NAME} explorer`,
    VITE_L1_BLOCK_EXPLORER_URL: payload.L1_BLOCK_EXPLORER_URL,
    VITE_L1_BLOCK_EXPLORER_API: payload.L1_BLOCK_EXPLORER_API,
    VITE_L2_CHAIN_NAME: payload.L2_CHAIN_NAME,
    VITE_L2_CHAIN_ID: payload.L2_CHAIN_ID,
    VITE_L2_RPC_URL: domainList.L2_RPC_URL,
    VITE_L2_LOGO_URL: payload.L2_LOGO_URL,
    VITE_L2_NATIVE_CURRENCY_DECIMALS: payload.L2_NATIVE_CURRENCY_DECIMALS || 18,
    VITE_L2_NATIVE_CURRENCY_NAME: payload.L2_NATIVE_CURRENCY_NAME,
    VITE_L2_NATIVE_CURRENCY_SYMBOL: payload.L2_NATIVE_CURRENCY_SYMBOL,
    VITE_L2_BLOCK_EXPLORER_NAME: `${payload.L2_CHAIN_NAME} explorer`,
    VITE_L2_BLOCK_EXPLORER_URL: domainList.L2_BLOCK_EXPLORER_URL,
    VITE_L2_BLOCK_EXPLORER_API: domainList.L2_BLOCK_EXPLORER_URL_API,
    VITE_L2_OUTPUT_ORACLE_PROXY_ADDRESS: '0x',
    VITE_PORTAL_PROXY_ADDRESS: '0x',
    VITE_L1_STANDARD_BRIDGE_PROXY_ADDRESS: '0x',
    VITE_L1_CROSS_DOMAIN_MESSENGER_PROXY_ADDRESS: '0x',
    VITE_L1_ERC721_BRIDGE_ADDRESS_PROXY: '0x',
    VITE_STATE_ROOT_PERIOD,
    VITE_WITHDRAWAL_PERIOD,
    VITE_L2_STANDARD_BRIDGE_PROXY_ADDRESS:
      '0x4200000000000000000000000000000000000010',
    VITE_API_ENDPOINT: domainList.OPSTACK_BRIDGE_INDEXER_SERVER,
    VITE_WALLETCONNECT_PROJECT_ID: payload.WALLETCONNECT_PROJECT_ID,
    VITE_L1_MULTI_CALL3_ADDRESS: payload.L1_MULTI_CALL3_ADDRESS,
    VITE_L1_MULTI_CALL3_BLOCK_CREATED: payload.L1_MULTI_CALL3_BLOCK_CREATED,
  });

  fs.writeFileSync(envUiPath, newEnvUi);

  // create blockscout-fe.env
  const envBlockscoutFePath = path.join(repoPath, 'blockscout.env');
  const newEnvBlockscoutFe = createNewEnv(
    mergeDict(blockscoutConfig, {
      NEXT_PUBLIC_API_HOST: `blockscout.${process.env.DOMAIN_NAME}`,
      NEXT_PUBLIC_API_PROTOCOL: process.env.PROTOCOL,
      NEXT_PUBLIC_STATS_API_HOST: domainList.L2_STATS_API_HOST,
      NEXT_PUBLIC_NETWORK_NAME: payload.L2_CHAIN_NAME,
      NEXT_PUBLIC_NETWORK_SHORT_NAME: payload.L2_CHAIN_NAME,
      NEXT_PUBLIC_NETWORK_ID: payload.L2_CHAIN_ID,
      NEXT_PUBLIC_NETWORK_CURRENCY_NAME: payload.L2_NATIVE_CURRENCY_NAME,
      NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL: payload.L2_NATIVE_CURRENCY_SYMBOL,
      NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS: 18,
      NEXT_PUBLIC_APP_HOST: process.env.DOMAIN_NAME,
      NEXT_PUBLIC_APP_PROTOCOL: process.env.PROTOCOL,
      NEXT_PUBLIC_VISUALIZE_API_HOST: domainList.L2_VISUALIZER_API_HOST,
      NEXT_PUBLIC_API_WEBSOCKET_PROTOCOL:
        process.env.PROTOCOL === 'http' ? 'ws' : 'wss',
      NEXT_PUBLIC_IS_TESTNET: false,
    })
  );

  fs.writeFileSync(envBlockscoutFePath, newEnvBlockscoutFe);

  const service = await prisma.service.findFirst({
    where: {
      name: 'rollup',
    },
  });

  if (service) {
    return res.status(500).json({ message: 'Service already exists' });
  }

  const serviceCreate = await prisma.service.create({
    data: {
      name: 'rollup',
      status: EnumStatus.BUILDING,
    },
  });

  const envRollup = mergeDict(rollupConfig, {
    ...payload,
    APP_BLOCKSCOUT_HOST: `blockscout.${process.env.DOMAIN_NAME}`,
    APP_BLOCKSCOUT_PROTOCAL: process.env.PROTOCOL,
  });
  createEnvFile(envRollup, repoPath);
  // sleep 1 s
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const CURRENT_PATH = process.env.CURRENT_PATH || (await runCommand('pwd'));
    console.log('CURRENT_PATH', CURRENT_PATH);

    deployExec.rollup = exec(
      `CURRENT_PATH=${CURRENT_PATH} docker-compose -f docker-compose-all.yml --profile sequencer --profile blockscout --profile opstack-bridge up -d --build`,
      { cwd: repoPath }
    );

    // Capture stdout (standard output)
    deployExec.rollup.stdout.on('data', async (data) => {
      console.log(data.toString());
      await prisma.logging.create({
        data: {
          message: data.toString(),
          service: 'rollup',
        },
      });
    });

    // Capture stderr (error output)
    deployExec.rollup.stderr.on('data', async (data) => {
      console.error(data.toString());
      await prisma.logging.create({
        data: {
          message: data.toString(),
          service: 'rollup',
        },
      });
    });

    // Handle process close event
    deployExec.rollup.on('close', async (code) => {
      await prisma.logging.create({
        data: {
          message: `Process exited with code ${code}`,
          service: 'rollup',
        },
      });
      // 9 SIGKILL
      if (code === 0) {
        await prisma.service.update({
          where: {
            id: serviceCreate.id,
          },
          data: {
            status: EnumStatus.UP,
          },
        });
        console.log('Rollup deployment started');
      } else {
        console.error(`Error during deployment rollup +` + code);

        await prisma.service.update({
          where: {
            id: serviceCreate.id,
          },
          data: {
            status: EnumStatus.FAILED,
          },
        });
      }
    });
  } catch (error) {
    console.error(`Error during deployment rollup (catch block)`);
    console.log(error);

    await prisma.service.update({
      where: {
        id: serviceCreate.id,
      },
      data: {
        status: EnumStatus.FAILED,
      },
    });

    return res.status(500).json({ message: 'Rollup deployment failed' });
  }

  return res.status(200).json({ message: 'Rollup deployment started' });
});

router.get('/status', requireJWTAuth, async (req, res) => {
  const services = await prisma.service.findFirst({
    where: {
      name: 'rollup',
    },
  });
  if (services) {
    return res.status(200).json({ status: services.status, deploy: true });
  }
  return res.status(200).json({ status: null, deploy: false });
});

router.get('/container', requireJWTAuth, async (req, res) => {
  try {
    const dockeList = await getAllDockerPs();
    return res.status(200).json(dockeList);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get container list' });
  }
});

export default router;
