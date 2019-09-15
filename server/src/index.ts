import ConfigurationSource from './config/config';
import Server from './api/server';
import { logger } from '../../client/src/utils/logger';

// read configuration
const config = ConfigurationSource.get();

// start server
const server = new Server(config.port);

// wait for system signal
process.on('SIGINT', async () => {
    logger.info({ message: 'Process interrupted, aborting....' });
    await server.shutdown();
    process.exit();
});