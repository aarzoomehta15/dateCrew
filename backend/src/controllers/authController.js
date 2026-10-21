import { login, getCookieOptions } from '../services/auth/authService.js';
import { loginSchema } from '../validators/schemas.js';
import config from '../config/index.js';


export async function loginController(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login(email, password);


    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }


    res.cookie(config.cookieName, result.token, getCookieOptions());
    return res.json({ user: result.user, token: result.token });
  } catch (err) {
    next(err);
  }
}


export async function logoutController(req, res) {
  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    path: '/',
  });
  return res.json({ message: 'Logged out successfully' });
}


export async function meController(req, res) {
  return res.json({ user: req.user });
}