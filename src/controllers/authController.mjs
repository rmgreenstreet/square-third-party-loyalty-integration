import { winstonLogger as logger } from "../utils/loggingSetup.mjs";
import { isSquareAuthorized } from "../utils/squareUtils.mjs"
import User from "../models/User.mjs";
import ApplicationError from "../models/ApplicationError.mjs";

export const getHome = async (req, res) => {
  logger.debug("Entering getHome controller");
  try {
    const squareAuthorization = await isSquareAuthorized(req.user);
    logger.info("Square Authorization checked", { squareAuthorization, user: req.user._id })
    res.render("index", { squareAuthorization });
  } catch (err) {
    next(new ApplicationError("There was an issue verifying Square Integration", { name: "SquareAuthError", err }));
  }
};

export const getRegister = async (req, res) => {
  logger.debug("Entering getRegister controller");
  if (req.user) {
    logger.debug("User is logged in, redirecting to Home");
    req.flash = "You are already logged in";
    res.redirect('/');
  };
  logger.debug("No user logged in, rendering Register page");
  res.render("users/register");
};

export const postRegister = async (req, res) => {
  logger.debug("Entering postRegister controller");
  try {
    const { email, password } = req.body;
    const newUser = new User({ email });
    // passport-local register and login logic
    const registeredUser = await User.register(newUser, password);
    logger.info("User successfully registered", { user: registeredUser.id })
    // Convert req.login to a Promise
    await new Promise((resolve, reject) => {
      req.login(registeredUser, err => {
        if (err) {
          return reject(err); // Propagate the error to the catch block
        }
        resolve();
      });
    });
    res.redirect('/');
  } catch (err) {
    next(new ApplicationError(`There was an error creating your account: ${err.message}`, { name: "RegistrationError", err }));
  }
};

export const getLogin = async (req, res) => {
  logger.debug("Entering getLogin controller");
  try {
    if (req.user) {
      logger.debug("Logged in user found, redirecting Home");
      res.redirect('/');
    } else {
      logger.debug("No logged in user found, redirecting to login");
      res.render("users/login");
    }
  } catch (err) {
    next(new ApplicationError("There was an error loading the login page", { name: "LoginError", err }));
  };
};

export const getLogout = (req, res) => {
  logger.debug("Entering getLogout controller");
  req.logout(function (err) {
    if (err) {
      return next(new ApplicationError("There was an issue logging out", { name: "LogoutError", err }));
    }
    logger.info("Logging out user", { user: req.user.id });
    req.flash('success', 'You are now logged out');
    res.redirect('/login');
  });
};
