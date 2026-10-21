import app from './app.js';
import config from './config/index.js';


const PORT = config.port;
const HOST = config.host;


const server = app.listen(PORT, HOST, () => {
  const hostLabel = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`TDC Matchmaker Server running on http://${hostLabel}:${PORT}`);
  console.log(`Data directory: ${config.dataDir}`);
  console.log(`Allowed CORS origin: ${Array.isArray(config.corsOrigin) ? config.corsOrigin.join(', ') : config.corsOrigin}`);
  console.log(`Environment: ${config.nodeEnv}`);
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





