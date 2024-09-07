import session from 'express-session';
import connectFlash from 'connect-flash';
import passport from 'passport';
import LocalStrategy from 'passport-local';

import User from '../models/User.mjs'; 
import { winstonLogger } from '../utils/loggingSetup.mjs';

export default function setupMiddleware(app) {
  // Session configuration
  let sess = {
    secret: 'keyboard cat',
    saveUninitialized: true,
    resave: false,
    cookie: {}
  };

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // Trust first proxy
    sess.cookie.secure = true; // Serve secure cookies
  }

  app.use(session(sess));
  app.use(connectFlash());

  // Middleware to make flash messages and user info available in all routes
  app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    req.logger = winstonLogger;
    next();
  });

  // Initialize Passport and other middleware
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  User.authenticate()));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
}
