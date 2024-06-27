import express from 'express';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import expressLayouts from 'express-ejs-layouts';
import indexRouter from './routes/index.js';
import signUpRouter from './routes/sign-up.js';
import logInRouter from './routes/log-in.js';
import messageRouter from './routes/message-board.js';

import './config/passport.js';

const app = express();

const mongoDb = process.env.DATABASE_URL;

mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoDb, collection: 'sessions' }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(expressLayouts);
app.set('views', path.join(import.meta.dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', indexRouter);
app.use('/', signUpRouter);
app.use('/', logInRouter);
app.use('/', messageRouter);

export default app;
