import ConfigurationSource from './config/source';
import Server from './api/server';
import { logger } from '../../client/src/utils/logger';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { initManager } from './core/manager';

async function start() {
    // create connection to DB
    const connection = await createConnection(config.db);
    initManager(connection);

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