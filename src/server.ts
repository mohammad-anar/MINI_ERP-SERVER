/* eslint-disable no-console */
import colors from 'colors';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import http from 'http';
import { seedSuperAdmin } from './DB/seedAdmin';
import { socketHelper } from './helpers/socketHelper';
import { errorLogger, logger } from './shared/logger';

// ─── Uncaught exception — must exit immediately ────────────────────────────
process.on('uncaughtException', error => {
  errorLogger.error('💥 UncaughtException detected:', error);
  process.exit(1);
});

// ─── Main bootstrap ────────────────────────────────────────────────────────
let server: ReturnType<typeof app.listen> | null = null;

const startKeepAlive = (port: number) => {
  const intervalMs = (14 * 60 + 50) * 1000; // 14:50 min in milliseconds = 890000ms
  const pingUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}/`;

  setInterval(() => {
    logger.info(`Self-pinging to keep server active: ${pingUrl}`);
    http.get(pingUrl, (res) => {
      logger.info(`Keep-alive ping successful (Status: ${res.statusCode})`);
    }).on('error', (err) => {
      errorLogger.error('Keep-alive self-ping failed:', err);
    });
  }, intervalMs);
};

const main = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(config.database_url);
    logger.info(colors.green('🚀 Database connected successfully'));

    // 2. Seed Super Admin (idempotent)
    await seedSuperAdmin();

    // 3. Start HTTP server
    const port = Number(config.port) || 5000;
    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Server listening on port ${port} [${config.node_env}]`)
      );
      // Start keep-alive self-ping interval (14:50 min)
      startKeepAlive(port);
    });

    // 4. Attach Socket.IO
    socketHelper.init(server);
    logger.info(colors.cyan('🔌 Socket.IO initialised'));
  } catch (error) {
    errorLogger.error(colors.red('❌ Server startup failed:'), error);
    process.exit(1);
  }
};

main();

// ─── Unhandled promise rejections ──────────────────────────────────────────
process.on('unhandledRejection', error => {
  errorLogger.error('💥 UnhandledRejection detected:', error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// ─── Graceful shutdown (SIGTERM / Docker / PM2) ────────────────────────────
process.on('SIGTERM', () => {
  logger.info(colors.magenta('🛑 SIGTERM received — shutting down gracefully'));
  if (server) {
    server.close(() => {
      logger.info('✅ HTTP server closed');
      mongoose.connection.close().then(() => {
        logger.info('✅ Database connection closed');
        process.exit(0);
      });
    });
  }
});
