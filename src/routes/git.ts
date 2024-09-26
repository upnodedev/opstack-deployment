import express from 'express';
import requireJWTAuth from '../middleware/requireJWTAuth';

const router = express.Router();

router.get('/version', requireJWTAuth, async (req, res) => {
  return res
    .status(200)
    .json({ status: 'Deployment is running', status_code: 200 });
});

export default router;
