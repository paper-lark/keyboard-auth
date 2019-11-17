import { ConfigurationSource } from './config/config';
import Server from './api/server';
import { logger } from 'keyboard-auth-common/lib/utils/logger';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { initManager } from './core/manager';

async function start() {
  // create connection to DB
  try {
    const connection = await createConnection(config.db);
    initManager(connection);
  } catch (e) {
    logger.error(`Failed to initialize session manager: `, e);
    process.exit(1);
  }

  // start server
  const server = new Server(config.port);

  // wait for system signal
  process.once('SIGINT', async () => {
    logger.info({ message: 'Process interrupted, aborting....' });
    await server.shutdown();
    process.exit();
  });
}

// read configuration
const config = ConfigurationSource.get();

// start application
start();
