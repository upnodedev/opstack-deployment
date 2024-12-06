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

let logStream: any;

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

    try {
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
            ws.send(`Service not found ${JSON.stringify(containerAll)}`);
            // ws.close();
            return;
          }

          containerId = containerFind.Id;
          const container = docker.getContainer(containerId);

          try {
            // Stream logs from the Docker container
            logStream = await container.logs({
              follow: true,
              stdout: true,
              stderr: true,
            });

            logStream.on('data', (chunk) => {
              ws.send(chunk.toString());
            });

            logStream.on('end', () => {
              ws.send('Log stream ended.');
              ws.close();
            });
          } catch (error) {
            console.error('Error streaming logs:', error.message);
            ws.send('Error streaming logs.');
          }
        });
      });

      ws.on('close', () => {
        if (logStream) {
          logStream.destroy();
        }
      });
    } catch (error) {
      console.error('Error connecting to WebSocket:', error.message);
      ws.send('Error connecting to WebSocket.');
      ws.close();
    }
  });
};
