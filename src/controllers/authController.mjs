import { isAuthorized } from "../utils/squareUtils.mjs"

export const home = async (req, res) => {
  try {
    if (req.user) {
      const isAuthorized = await isAuthorized(req.user);
      res.render("index", isAuthorized);
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

export const getRegister = async (req, res) => {
  if (req.user) {
    req.flash = "You are already logged in";
    res.redirect('/');
  };
  res.render("/users/register");
};

export const postRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    // passport-local register and login logic
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
  };
};

export const postLogin = async (req, res) => {
  // passport-local login logic
};

export const logout = (req, res) => {
  req.logout();
  res.redirect('/');
};
