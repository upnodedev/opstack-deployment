import WebSocket, { Server } from 'ws';
import Docker from 'dockerode';
import jwt from 'jwt-simple';
import env from './utils/env';
import { ChildProcess, exec } from 'child_process';
import path from 'path';

// Initialize Dockerode
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

const activeLogStreams = new Map();

// WebSocket server
export const initWebSocketServer = (server: any) => {
  console.log('Initializing WebSocket server...');
  const wss = new Server({ server });

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket, req) => {
    const token = req.url?.split('token=')[1];

    if (!token) {
      ws.send('No token provided');
      ws.close();
      return;
    }

    // Verify the JWT token
    const payload = jwt.decode(token, env.JWT_SECRET, false) as JwtPayload;

    if (!payload || payload.sub !== env.USER) {
      ws.send('Invalid token');
      ws.close();
      return;
    }

    ws.send(`Connected as ${payload.sub}`);

    // Handle incoming messages
    ws.on('message', async (containerName: string) => {
      console.log(`Streaming logs for container: ${containerName}`);

      let containerId = null;

      if (ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not open, cannot process log request.');
        return;
      }

      docker.listContainers({ all: true }, async (err, containers) => {
        if (err) {
          console.error(err);
          ws.send('Error fetching logs');
          ws.close();
          return;
        }

        const containerAll = containers.map((container) => {
          return {
            Id: container.Id,
            Names: JSON.stringify(container.Names),
          };
        });

        const containerFind = containerAll.find((container) => {
          return JSON.stringify(container.Names).includes(containerName);
        });

        if (!containerFind) {
          ws.send(`Service not found with name: ${containerName}`);
          ws.close();
          return;
        }

        containerId = containerFind.Id;

        // Stop any previous log stream for this client
        if (activeLogStreams.has(containerId)) {
          const logStream = activeLogStreams.get(containerId);
          activeLogStreams.delete(containerId);
        }

        // Start streaming logs for the requested service
        await streamLogs(containerName, containerId, ws);
      });
    });
  });
};

// Function to stream logs from a Docker container
async function streamLogs(containerName: string, containerId: string, ws) {
  try {
    const container = docker.getContainer(containerId);
    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    logStream.on('data', (chunk) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(chunk.toString());
      }
    });

    logStream.on('end', () => {
      console.log(`Log stream for ${containerId} (${containerName}) ended`);
    });

    activeLogStreams.set(containerId, logStream);
  } catch (err) {
    console.error(
      `Error streaming logs for ${containerId} (${containerName}):`,
      err.message
    );
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        `Error: Unable to fetch logs for service ${containerId} (${containerName})`
      );
    }
  }
}
