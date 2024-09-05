if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(({ config }) => { 
    config() // Load environment variables
  });
}; 

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectFlash from 'connect-flash';
import passport from "passport";
import LocalStrategy from "passport-local";
import ejsMate from 'ejs-mate';
import methodOverride from "method-override";
import flash from "connect-flash";
import winston from "winston";
import { Loggly } from "winston-loggly-bulk";

import connectToMongoose from './utils/connectToMongoose.mjs';

import authRoutes from './routes/authRoutes.mjs';
import squareRoutes from './routes/squareRoutes.mjs';

import User from "./models/User.mjs"

// Get the resolved path to the file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware and routes setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));

// Initialize Passport and other middlewares
var sess = {
  secret: 'keyboard cat',
  saveUninitialized: true,
  resave: false,
  cookie: {}
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
};

app.use(session(sess));
app.use(flash());

app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: "email"
},
  User.authenticate()
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user;
  next();
});

await connectToMongoose(1000);

// Use the routes
app.use('/', authRoutes);
app.use('/square', squareRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.all("*", (req, res) => {
  console.log("Invalid path request for", req.path);
  res.status(404).send("Invalid path");
})

// Error handling and other middlewares

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
