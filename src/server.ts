// src/app.ts

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import healthz from './routes/healthz';
import auth from './routes/auth';
import deploy from './routes/deploy';
import config from './routes/config';

const app = express();
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
app.use('/api/config', config);

export default app;
