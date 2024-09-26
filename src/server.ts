// src/app.ts

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fs from 'fs';
import healthz from './routes/healthz';
import auth from './routes/auth';
import deploy from './routes/deploy';
import { PrismaClient } from '@prisma/client';
import { connectPrisma, disconnectPrisma } from './core/prisma';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Define your CORS options
const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET', // Allow only GET requests
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify the allowed headers
};

// Use the CORS middleware with the options
app.use(cors(corsOptions));

app.use(morgan('dev'));

// app.use(bodyParser.json({ limit: '5mb' }));
// app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// router
app.use('/api/healthz', healthz);
app.use('/api/auth', auth);
app.use('/api/deploy', deploy);

// Initialize WebSocket server
const serverApp = createServer(app);
export const wss = new WebSocketServer({ server: serverApp });

const server = app.listen(PORT, async () => {
  await connectPrisma(); // Ensure that Prisma is connected when starting the server
  console.log(`Server running on port ${PORT}`);
});

// Gracefully shutdown Prisma when server is terminated
async function gracefulShutdown() {
  console.log('Shutting down server...');
  await disconnectPrisma(); // Ensure Prisma is disconnected properly
  server.close(() => {
    console.log('Server closed');
    process.exit(0); // Exit process after closing server
  });
}

// Listen to termination signals to handle graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', async (err) => {
  console.error('Uncaught Exception: ', err);
  await gracefulShutdown();
});
