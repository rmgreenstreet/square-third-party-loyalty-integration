import { Router } from 'express';
import { authorize, oauthCallback, revoke } from '../controllers/squareController.mjs';

const router = Router();

router.get('/authorize', authorize);
router.get('/oauth-callback', oauthCallback);
router.get('/revoke', revoke);

export default router;
