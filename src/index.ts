import { disconnectPrisma } from "./core/prisma";
import app from "./server";
import http from 'http';
import { initWebSocketServer } from "./socket";
import env from "./utils/env";

const server = http.createServer(app);

// Initialize WebSocket server
initWebSocketServer(server);

// Gracefully shutdown Prisma when server is terminated
async function gracefulShutdown() {
  console.log('Shutting down server...');
  await disconnectPrisma(); // Ensure Prisma is disconnected properly
  server.close(() => {
    console.log('Server closed');
    process.exit(0); // Exit process after closing server
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Listen to termination signals to handle graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception: ', err);
  await gracefulShutdown();
});
