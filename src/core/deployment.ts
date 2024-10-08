import { ChildProcess, exec } from 'child_process';
import { mergeDict } from '../utils';
import prisma from './prisma';
import path from 'path';
import fs from 'fs';
import { createEnvFile } from '../utils/deployment';
import { EnumStatus } from '@prisma/client';

type DeployExecType = {
  rollup: ChildProcess;
  blockscout: ChildProcess;
  bridge: ChildProcess;
};

export const deployExec: DeployExecType = {
  rollup: null,
  blockscout: null,
  bridge: null,
};

export async function deployService(
  name: 'rollup' | 'blockscout' | 'bridge',
  pathSrc: string,
  composeFile: string,
  oldEnv: Record<string, any>,
  newEnv: Record<string, any>,
  onClose: (...args: any[]) => any
): Promise<{ message: string; isSuccess: boolean }> {
  // check if service exists
  const service = await prisma.service.findFirst({
    where: {
      name,
    },
  });

  if (service) {
    return {
      message: 'Service already exists',
      isSuccess: false,
    };
  }

  const serviceCreate = await prisma.service.create({
    data: {
      name,
      status: EnumStatus.BUILDING,
    },
  });

  const env = mergeDict(oldEnv, newEnv);

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

  try {
    // delete the existing directory
    if (fs.existsSync(pathSrc)) {
      fs.rmdirSync(pathSrc, { recursive: true });
    }

    createEnvFile(env, pathSrc);
    deployExec[name] = exec(
      `docker-compose -f ${path.join(
        pathSrc,
        composeFile
      )} --profile sequencer up -d --build`,
      { cwd: pathSrc }
    );

    // Capture stdout (standard output)
    deployExec[name].stdout.on('data', async (data) => {
      await prisma.logging.create({
        data: {
          message: data.toString(),
          service: name,
        },
      });
    });

    // Capture stderr (error output)
    deployExec[name].stderr.on('data', async (data) => {
      await prisma.logging.create({
        data: {
          message: data.toString(),
          service: name,
        },
      });
    });

    // Handle process close event
    deployExec[name].on('close', async (code) => {
      await prisma.logging.create({
        data: {
          message: `Process exited with code ${code}`,
          service: name,
        },
      });
      if (code === 0) {
        await prisma.service.update({
          where: {
            id: serviceCreate.id,
          },
          data: {
            status: EnumStatus.UP,
          },
        });
        onClose();
      } else {
        console.error(`Error during deployment ${name}`);

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

    return {
      message: `Deployment successful ${name}`,
      isSuccess: true,
    };
  } catch (error) {
    console.error(
      `Error during deployment ${name} : ${(error as Error).message}`
    );

    await prisma.service.update({
      where: {
        id: serviceCreate.id,
      },
      data: {
        status: EnumStatus.FAILED,
      },
    });

    return {
      message: `Deployment failed ${name}`,
      isSuccess: false,
    };
  }
}
