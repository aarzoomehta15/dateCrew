import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listActivity } from '../controllers/activityController.js';

const router = Router();

router.get('/', authenticate, listActivity);

export default router;
