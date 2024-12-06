import path from 'path';
import { runCommand } from '../utils';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Get container status
 * @param {string} imageName
 * @returns {Promise<string | undefined>}
 */
export const getDockerContainerStatus = async (
  imageName: string
): Promise<string | undefined> => {
  const dockerStatus = await runCommand(
    `docker ps -a --filter "name=${imageName}" --format "{{.Status}}"`
  );
  return dockerStatus;
};

export enum DockerStatus {
  RUNNING = 'RUNNING',
  EXITED = 'EXITED',
  CREATED = 'CREATED',
  PAUSED = 'PAUSED',
  RESTART = 'RESTART',
  UNKNOWN = 'UNKNOWN',
}

export enum ContainerProfile {
  deployment = 'Deployment',
  rollup = 'Rollup',
  logging = 'Logging',
  bridge = 'Bridge',
  blockscout = 'Blockscout',
  unknow = 'Unknown',
}

export const ContainerProfileList = {
  [ContainerProfile.deployment]: [
    'deployment-traefik',
    'deployment-db',
    'deployment-backend',
    'deployment-frontend',
  ],
  [ContainerProfile.rollup]: [
    'force-clone',
    'celestia-da',
    'op-geth',
    'op-node',
    'op-batcher',
    'op-proposer',
  ],
  [ContainerProfile.logging]: ['grafana', 'prometheus'],
  [ContainerProfile.bridge]: [
    'bridge-indexer-db',
    'bridge-indexer-deposit',
    'bridge-indexer-withdrawal',
    'bridge-indexer-server',
    'bridge-indexer-frontend',
  ],
  [ContainerProfile.blockscout]: [
    'blockscout-redis-db',
    'blockscout-db-init',
    'blockscout-db',
    'blockscout-backend',
    'blockscout-visualizer',
    'blockscout-sig-provider',
    'blockscout-frontend',
    'blockscout-stats-db-init',
    'blockscout-stats-db',
    'blockscout-stats',
    'blockscout-user-ops-indexer',
    'blockscout-proxy',
  ],
};

/**
 * Function to map Docker status strings to standardized statuses.
 * @param {string} status - The `STATUS` field from `docker ps`.
 * @returns {DockerStatus} - A standardized status like "RUNNING", "EXITED", etc.
 */
function getDockerStatus(status: string): DockerStatus {
  if (!status || typeof status !== 'string') {
    throw new Error('Invalid status input');
  }

  // Normalize and map status
  if (status.startsWith('Up')) {
    return DockerStatus.RUNNING;
  } else if (status.startsWith('Exited')) {
    return DockerStatus.EXITED;
  } else if (status.startsWith('Created')) {
    return DockerStatus.CREATED;
  } else if (status.startsWith('Paused')) {
    return DockerStatus.PAUSED;
  } else if (status.startsWith('Restarting')) {
    return DockerStatus.RESTART;
  } else if (status.startsWith('Dead')) {
    return DockerStatus.EXITED;
  } else {
    return DockerStatus.UNKNOWN;
  }
}

/**
 * Function to get the list of all Docker containers and their statuses.
 * @returns {Promise<{ id: string, image: string, name: string, statusText: string, status: DockerStatus }[]>}
 */
export const getAllDockerPs = async (): Promise<
  {
    id: string;
    image: string;
    name: string;
    statusText: string;
    status: DockerStatus;
  }[]
> => {
  // get container id from docker ps (image, container id, name,status)
  const splitSting = '|~~|';
  const { stdout } = await execPromise(
    `docker ps --format "{{.ID}}${splitSting}{{.Image}}${splitSting}{{.Names}}${splitSting}{{.Status}}"`
  );

  const containerListString = stdout.split('\n');
  containerListString.pop();
  const containerList = containerListString.map((container) => {
    const [id, image, name, statusText] = container.split(splitSting);
    const status = getDockerStatus(statusText);

    const profile = Object.keys(ContainerProfileList).find((key) => {
      return ContainerProfileList[key].includes(name);
    });

    return {
      id,
      image,
      name,
      statusText,
      status,
      profile,
    };
  });
  // console.log(containerList);
  return containerList;
};
