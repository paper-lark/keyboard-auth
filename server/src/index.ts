import ConfigurationSource from './config/config';
import Server from './api/server';
import { logger } from '../../client/src/utils/logger';
import 'reflect-metadata';

// read configuration
const config = ConfigurationSource.get();

// start server
const server = new Server(config.port);

// wait for system signal
process.once('SIGINT', async () => {
    logger.info({ message: 'Process interrupted, aborting....' });
    await server.shutdown();
    process.exit();
});