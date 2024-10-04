import express from 'express';
import env from '../utils/env';
import jwt from 'jwt-simple';
import requireJWTAuth from '../middleware/requireJWTAuth';

const router = express.Router();

router.post('/login', (req, res, next) => {
  if (req.body.username === env.USER && req.body.password === env.PASSWORD) {
    const token = jwt.encode(
      {
        sub: req.body.username,
        iat: new Date().getTime(),
        exp: new Date().getTime() + 10 * 24 * 60 * 60 * 1000,
      },
      env.JWT_SECRET
    );
    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

router.get('/profile', requireJWTAuth, (req, res, next) => {
  res.status(200).json({ user: env.USER });
});

export default router;
