import { Router } from 'express';
import { authorize, oauthCallback, revoke } from '../controllers/squareController.mjs';
import { isLoggedIn } from "../middleware/isLoggedIn.mjs";

const router = Router();

router.get('/authorize', isLoggedIn, authorize);
router.get('/oauth-callback', isLoggedIn, oauthCallback);
router.get('/revoke', isLoggedIn, revoke);

export default router;
