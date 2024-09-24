import express from 'express';
import requireJWTAuth from '../middleware/requireJWTAuth';

const router = express.Router();

router.get('', (req, res) => {
  return res
    .status(200)
    .json({ status: 'Deployment is running', status_code: 200 });
});

export default router;
