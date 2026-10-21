import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config/index.js';
import authRouter from './routes/auth.js';
import customerRouter from './routes/customers.js';
import dashboardRouter from './routes/dashboard.js';
import matchRouter from './routes/matches.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import activityRouter from './routes/activity.js';
import { errorHandler } from './middleware/errorHandler.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();


// Middleware
const corsOriginOption = (config.corsOrigin === '*')
  ? ((origin, callback) => callback(null, true))
  : config.corsOrigin;


app.use(cors({
  origin: corsOriginOption,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));


if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    service: 'TDC Matchmaker API'
  });
});


// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/customers', customerRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/matches', matchRouter);
app.use('/api/activity', activityRouter);


// 404 Handler for unhandled API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});


// Serve frontend static build if present (e.g. single-service full-stack deployment)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}


// Centralized error handler
app.use(errorHandler);


export default app;