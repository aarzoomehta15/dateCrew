import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config/index.js';
import { matchmakerRepo } from '../../repositories/jsonRepository.js';

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(matchmaker) {
  return jwt.sign(
    { id: matchmaker.id, email: matchmaker.email, role: matchmaker.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: config.cookieMaxAge,
    path: '/',
  };
}

export async function login(email, password) {
  const matchmaker = await matchmakerRepo.findOne({ email });
  if (!matchmaker) {
    return { success: false, error: 'Invalid email or password' };
  }

  const valid = await verifyPassword(password, matchmaker.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid email or password' };
  }

  const token = generateToken(matchmaker);
  const { passwordHash, ...user } = matchmaker;
  return { success: true, token, user };
}
