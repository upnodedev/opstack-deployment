import express from 'express';
import env from '../utils/env';
import jwt from 'jwt-simple';

const router = express.Router();

router.post('/login', (req, res, next) => {
  if (req.body.username === env.USER && req.body.password === env.PASSWORD) {
    // Generate a JWT token
    const payload = {
      sub: req.body.username,
      iat: new Date().getTime(),
    };
    const token = jwt.encode(payload, env.JWT_SECRET);
    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
