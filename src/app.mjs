import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import connectFlash from 'connect-flash';
import passport from 'passport';
import ejsMate from 'ejs-mate';
import authRoutes from './routes/authRoutes.mjs';
import squareRoutes from './routes/squareRoutes.mjs';

// Get the resolved path to the file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Conditionally load dotenv only in development
if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(({ config }) => {
    config(); // Load environment variables
  });
}

// Middleware and routes setup
app.use(express.urlencoded({ extended: true }));

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

app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());

// Use the routes
app.use('/', authRoutes);
app.use('/square', squareRoutes);

// Error handling and other middlewares

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
