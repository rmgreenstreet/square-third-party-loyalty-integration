import User from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/tokenUtils.mjs';

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

export const login = async (req, res) => {
  res.redirect('/');
};

export const logout = (req, res) => {
  req.logout();
  res.redirect('/');
};
