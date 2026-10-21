import dotenv from 'dotenv';
dotenv.config();


function parseCorsOrigin(origin) {
  if (!origin) return 'http://localhost:5173';
  if (origin === '*') return origin;
  if (origin.includes(',')) {
    return origin.split(',').map(s => s.trim()).filter(Boolean);
  }
  return origin.trim();
}


const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'tdc-matchmaker-dev-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  cookieName: 'tdc_session',
  cookieMaxAge: 24 * 60 * 60 * 1000, // 24 hours
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  nodeEnv: process.env.NODE_ENV || 'development',
  dataDir: process.env.DATA_DIR || './data',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  isProduction: process.env.NODE_ENV === 'production',
};


export default config;