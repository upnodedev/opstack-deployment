import express from 'express';
import requireJWTAuth from '../middleware/requireJWTAuth';
import path from 'path';
import fs from 'fs';

const targetDir: string = path.join(
  __dirname,
  '../',
  '../',
  'service',
  'opstack-compose',
  'data',
  'deployments'
);

const router = express.Router();

router.get('/:filename', requireJWTAuth, (req, res) => {
  const filePath = path.join(targetDir, req.params.filename);

  // Check if the requested file exists and is a JSON file
  if (fs.existsSync(filePath) && filePath.endsWith('.json')) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      message: 'File not found or not a JSON file',
    });
  }
});

export default router;
