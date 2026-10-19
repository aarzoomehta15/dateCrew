import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { matchmakerRepo } from '../repositories/jsonRepository.js';

/**
 * Authentication middleware — verifies JWT from HttpOnly cookie.
 * Attaches the matchmaker profile to req.user on success.
 */
export async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[config.cookieName];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const matchmaker = await matchmakerRepo.findById(decoded.id);
    if (!matchmaker) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Attach user info (without password hash) to request
    const { passwordHash, ...user } = matchmaker;
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired' });
    }
    return res.status(401).json({ error: 'Invalid session' });
  }
}
