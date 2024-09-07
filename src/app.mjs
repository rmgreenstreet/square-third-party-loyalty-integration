import "./config/envConfig.mjs"

// Import dependencies
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

// Import build utils
import connectToMongoose from './utils/connectToMongoose.mjs';
import { winstonLogger, morganLogger } from "./utils/loggingSetup.mjs"

// Import routes
import authRoutes from './routes/authRoutes.mjs';
import squareRoutes from './routes/squareRoutes.mjs';

// Import models
import User from "./models/User.mjs"

import setupMiddleware from './middleware/middlewareSetup.mjs';
import globalErrorHandler from './middleware/globalErrorHandler.mjs';

// Get the resolved path to the file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectToMongoose(1000);

const app = express();

// Set up ejs views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Set up public directory for frontend files
app.use(express.static(path.join(__dirname, "/public")));

// Middleware and routes setup
// Use passport, session, and flash setup
setupMiddleware(app);
// Parse urlEncoded POST requests
app.use(express.urlencoded({ extended: true }));
// Parse JSON POST requests
app.use(express.json());
// Use methodOverride to enable requests like "PUT" or "DELETE"
app.use(methodOverride("_method"));
// Use global error handler
app.use(globalErrorHandler);
// Use Morgan to log all http requests
app.use(morganLogger);
// Use winston logger in all routes, make current user available in routes
app.use((req, res, next) => {
  req.logger = winstonLogger;
  next();
});

// // Initialize Passport and other middlewares
// let sess = {
//   secret: 'keyboard cat',
//   saveUninitialized: true,
//   resave: false,
//   cookie: {}
// };

// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// };

// app.use(session(sess));
// app.use(flash());

// app.use(connectFlash());
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new LocalStrategy({
//   usernameField: "email"
// },
//   User.authenticate()
// ));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// Use the routes
app.use('/', authRoutes);
app.use('/square', squareRoutes);

//Health check route for render.com
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Catch route for any routes not specifically handled
app.all("*", (req, res) => {
  console.log("Invalid path request for", req.path);
  res.status(404).send("Invalid path");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
