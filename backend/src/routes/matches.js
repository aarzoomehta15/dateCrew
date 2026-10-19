import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { sendMatch, listSentMatches, updateSentMatchStatus, getMatchExplanation } from '../controllers/matchController.js';

const router = Router();

router.get('/', authenticate, listSentMatches);
router.post('/send', authenticate, sendMatch);
router.post('/explain', authenticate, getMatchExplanation);
router.patch('/:id/status', authenticate, updateSentMatchStatus);

export default router;
