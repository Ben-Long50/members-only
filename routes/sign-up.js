import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import User from '../models/user.js';

const router = express.Router();

router.get('/sign-up', (req, res) =>
  res.render('sign-up-form', {
    title: 'Sign Up',
    firstName: undefined,
    lastName: undefined,
    username: undefined,
    errors: undefined,
  }),
);

router.post('/sign-up', [
  body('firstName', 'First Name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('lastName', 'Last Name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  body('username', 'Username must be a minimum of 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error('Username already exists');
      }
      return true;
    }),

  body('password', 'Password must be a minimum of 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  body('confirmPassword', 'Passwords must match')
    .trim()
    .escape()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        return false;
      }
      return true;
    }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('sign-up-form', {
        title: 'Sign Up',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        errors: errors.array(),
      });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        member: false,
      });
      await user.save();
      res.redirect('/');
    }
  }),
]);

export default router;
