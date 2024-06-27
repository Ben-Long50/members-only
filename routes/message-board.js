import express from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { format } from 'date-fns';
import Message from '../models/message.js';

const router = express.Router();

router.get(
  '/message-board',
  asyncHandler(async (req, res) => {
    const messages = await Message.find()
      .sort({ date: 1 })
      .populate('author')
      .exec();

    const memberStatus = req.user.member === true ? 'Member' : 'Guest';

    res.render('message-board', {
      user: req.user,
      memberStatus,
      title: 'Messages',
      messages,
      messageTitle: undefined,
      messageContent: undefined,
      errors: undefined,
    });
  }),
);

router.post('/message-board', [
  body('title', 'Title must not be blank').trim().isLength({ min: 1 }).escape(),
  body('title', 'Title must be 20 characters or less')
    .trim()
    .isLength({ max: 20 })
    .escape(),
  body('content', 'Content must not be blank')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('content', 'Message must be 300 characters or less')
    .trim()
    .isLength({ max: 300 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const date = format(new Date(), 'PP');
    const time = format(new Date(), 'pp');

    if (!errors.isEmpty()) {
      const messages = await Message.find()
        .sort({ date: 1 })
        .populate('author')
        .exec();

      const memberStatus = req.user.member === true ? 'Member' : 'Guest';

      res.render('message-board', {
        user: req.user,
        memberStatus,
        title: 'Messages',
        messages,
        messageTitle: req.body.title,
        messageContent: req.body.content,
        errors: errors.array(),
      });
    } else {
      const message = new Message({
        author: req.user,
        date: `${time} on ${date}`,
        title: req.body.title,
        message: req.body.content,
      });
      await message.save();
      res.redirect('/message-board');
    }
  }),
]);

router.post(
  '/delete',
  asyncHandler(async (req, res, next) => {
    await Message.findByIdAndDelete(req.body.messageId);
    res.redirect('/message-board');
  }),
);
export default router;
