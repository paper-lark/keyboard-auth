import process from 'process';
import { logger } from './utils/logger';
import { KeyUpEvent, KeyDownEvent, KeyLogger } from './utils/io';
import ConfigurationSource from './config/config';
import Authenticator from './api/server';

// get configuration
const config = ConfigurationSource.get();
const auth = new Authenticator(config);

// initialize io hooks
function onKeyDown(event: KeyDownEvent) {
    logger.info(`Key is pressed: ${JSON.stringify(event)}`);
    auth.sendKeyboardEvent(event);
}
function onKeyUp(event: KeyUpEvent) {
    logger.info(`Key is released: ${JSON.stringify(event)}`);
    auth.sendKeyboardEvent(event);
}
const keyLogger = new KeyLogger(onKeyDown, onKeyUp);

// wait for system signal
process.on('SIGINT', () => {
    logger.info({ message: 'Process interrupted, aborting....' });
    keyLogger.destruct();
    auth.shutdown();
    process.exit();
});