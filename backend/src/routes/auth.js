import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginController, logoutController, meController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Rate limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many login attempts, please try again later' },
});

router.post('/login', loginLimiter, loginController);
router.post('/logout', logoutController);
router.get('/me', authenticate, meController);

export default router;
