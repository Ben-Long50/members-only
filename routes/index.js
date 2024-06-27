import express from 'express';
import { isAuthenticated } from '../config/passport.js';

const router = express.Router();

router.get('/', isAuthenticated, (req, res, next) => {
  res.redirect('/message-board');
});

export default router;
