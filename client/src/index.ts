import process from 'process';
import { logger } from './utils/logger';
import { KeyUpEvent, KeyDownEvent, KeyLogger } from './utils/io';
import ConfigurationSource from './config/config';
import Authenticator from './api/server';
import lockSystem from 'lock-system';

// get configuration
const config = ConfigurationSource.get();
const auth = new Authenticator(config, lockSystem);
// FIXME: do not crash when failed to connect to server

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