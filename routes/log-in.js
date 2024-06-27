import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import Message from '../models/message.js';

const router = express.Router();

router.get('/log-in', (req, res) => {
  res.render('index', {
    title: 'Log In',
    username: undefined,
    password: undefined,
    errors: undefined,
  });
});

router.post('/log-in', [
  body('username', 'Username does not exist')
    .trim()
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (!user) {
        throw new Error('Username does not exist');
      }
      return true;
    }),

  body('password', 'Incorrect password')
    .trim()
    .escape()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        return false;
      }
      const match = await bcrypt.compare(value, user.password);
      if (!match) {
        throw new Error('Incorrect password');
      }

      return true;
    }),

  body('secret').trim().escape().optional(),

  asyncHandler(async (req, res, next) => {
    if (req.body.secret === process.env.MEMBER_PW) {
      await User.findOneAndUpdate(
        { username: req.body.username },
        { member: true },
        { new: false },
      );
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('index', {
        title: 'Log In',
        username: req.body.username,
        password: req.body.password,
        errors: errors.array(),
      });
    } else {
      passport.authenticate('local', {
        successRedirect: '/message-board',
        failureRedirect: '/log-in',
      })(req, res, next);
    }
  }),
]);

router.get(
  '/log-out',
  asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
      req.user._id,
      { member: false },
      { new: false },
    );
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }),
);

router.get(
  '/delete-account',
  asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id);
    const userMessages = await Message.find({ author: req.user._id });
    userMessages.forEach(async (message) => {
      await Message.findByIdAndDelete(message._id);
    });

    res.redirect('/');
  }),
);

export default router;
