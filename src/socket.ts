import WebSocket, { Server } from 'ws';
import Docker from 'dockerode';
import jwt from 'jwt-simple';
import env from './utils/env';

// Initialize Dockerode
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

// WebSocket server
export const initWebSocketServer = (server: any) => {
  console.log('Initializing WebSocket server...');
  const wss = new Server({ server });

  // WebSocket connection handler
  wss.on('connection', (ws: WebSocket, req) => {
    const token = req.url?.split('token=')[1];

    console.log({ token });

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

        const container = docker.getContainer(containerName);

        try {
          // Stream logs from the Docker container
          const logStream = await container.logs({
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
    } catch (error) {
      ws.send('Invalid token');
      ws.close();
    }
  });
};
