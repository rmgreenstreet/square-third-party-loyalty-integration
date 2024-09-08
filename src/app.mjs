import "./config/envConfig.mjs"

// Import dependencies
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ejsMate from 'ejs-mate';
import methodOverride from "method-override";

// Import build utils
import connectToMongoose from './utils/connectToMongoose.mjs';
import { winstonLogger, morganLogger } from "./utils/loggingSetup.mjs"

// Import routes
import authRoutes from './routes/authRoutes.mjs';
import squareRoutes from './routes/squareRoutes.mjs';

// Import middleware
import setupMiddleware from './middleware/middlewareSetup.mjs';
import globalErrorHandler from './middleware/globalErrorHandler.mjs';

// Get the resolved path to the file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectToMongoose();

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

// Use the routes
app.use('/', authRoutes);
app.use('/square', squareRoutes);

//Health check route for render.com
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Catch route for any routes not specifically handled
app.all("*", (req, res) => {
  res.status(404).send("Invalid path");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  winstonLogger.debug(`Server running on port ${PORT}`);
});
