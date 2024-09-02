import { Router } from 'express';
import { getRegister, postRegister, getLogin, postLogin, logout, home } from '../controllers/authController.mjs';

const router = Router();

router.get("/", home);
router.get("/register", getRegister);
router.post('/register', postRegister);
router.get("/login", getLogin);
router.post('/login', postLogin);
router.get('/logout', logout);

export default router;
