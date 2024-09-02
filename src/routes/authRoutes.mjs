import passport from "passport";
import { Router } from 'express';
import { getRegister, postRegister, getLogin, getLogout, getHome } from '../controllers/authController.mjs';
import catchAsync from "../utils/catchAsync.mjs";
import { isLoggedIn } from "../middleware/isLoggedIn.mjs";

const router = Router();

router.get("/", isLoggedIn, getHome);
router.get("/register", getRegister);
router.post('/register', catchAsync(postRegister));
router.get("/login", getLogin);
router.post('/login', passport.authenticate("local", {failureFlash: true, failureRedirect: "/login"}));
router.get('/logout', isLoggedIn, getLogout);

export default router;
