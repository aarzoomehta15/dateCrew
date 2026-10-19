import app from './app.js';
import config from './config/index.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 TDC Matchmaker Server running on http://localhost:${PORT}`);
  console.log(`📦 Data directory: ${config.dataDir}`);
  console.log(`🌐 Allowed CORS origin: ${config.corsOrigin}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default server;
