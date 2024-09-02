import { isAuthorized } from "../utils/squareUtils.mjs"
import User from "../models/User.mjs";

export const getHome = async (req, res) => {
  try {
    const squareAuthorization = await isAuthorized(req.user);
    res.render("index", squareAuthorization);
  } catch (error) {
    console.log(error);
    req.flash("error", "There was an error verifying Square Integration");
    res.status(500).redirect("/login");
  }
};

export const getRegister = async (req, res) => {
  if (req.user) {
    req.flash = "You are already logged in";
    res.redirect('/');
  };
  res.render("users/register");
};

export const postRegister = async (req, res) => {
  try {
    const { email, password } = req.body;
    const newUser = new User({email});
    // passport-local register and login logic
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, err => {
      if(err) {
        return next(err);
      }
    });
    res.redirect('/');
  } catch (error) {
    console.log(error);
    req.flash("error", `There was an error creating your account: ${error.message}`);
    res.status(500).redirect("/register");
  }
};

export const getLogin = async (req, res) => {
  try {
    if (req.user) {
      res.redirect('/');
    } else {
      res.render("users/login");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  };
};

export const getLogout = (req, res) => {
  req.logout(function (err) {
    if (err) {
        return next(err);
    }
    req.flash('success', 'You are now logged out');
    res.redirect('/login');
});
};
