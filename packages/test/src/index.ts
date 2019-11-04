import ConfigurationSource from './config/config';
import { DatasetExtractor } from './core/DatasetExtractor';
import { logger } from 'keyboard-auth-common/lib/utils/logger';

// get configuration
const config = ConfigurationSource.get();

// read user data
// FIXME: read all users data
const extractor = new DatasetExtractor(config.dataPath, config.featuresFile);
const userIds = extractor.getUserIds();
const userData = extractor.getUserData(userIds[0]);
logger.info(`User ${userIds[0]} data:\n ${userData.head(5).toString()}`);

// test classifier
// FIXME: implement
