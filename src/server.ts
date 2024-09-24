// src/app.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fs from 'fs';
import healthz from './routes/healthz';
import auth from './routes/auth';

const app = express();
const PORT = 3000;

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

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// router
app.use('/api/healthz', healthz);
app.use('/api/auth', auth);

app.listen(PORT, () => console.log(`server running on ${PORT}`));