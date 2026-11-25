const app = require('./app');
const env = require('./config/env');
const connectDatabase = require('./config/database');

const startServer = async () => {
  // 1. Connect to MongoDB Atlas
  console.log('🔄 Connecting to MongoDB...');
  await connectDatabase();

  // 2. Start HTTP server
  const server = app.listen(env.PORT, () => {
    console.log('====================================================');
    console.log(`🏭 AYUSH CREATION PRODUCTION BACKEND STARTED!`);
    console.log(`📡 Environment:  ${env.NODE_ENV}`);
    console.log(`🌐 Server Port:   http://localhost:${env.PORT}`);
    console.log(`🩺 Health API:    http://localhost:${env.PORT}/api/v1/health`);
    console.log(`🏢 Company:       Ayush Creation (Mumbai / Navi Mumbai)`);
    console.log('====================================================');
  });

  // 3. Graceful Shutdown Handlers
  const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log('🔌 HTTP server closed.');
      process.exit(0);
    });

    // Force shutdown if taking more than 10 seconds
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
