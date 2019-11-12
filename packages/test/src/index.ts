import ConfigurationSource from './config/config';
import { DatasetExtractor } from './core/DatasetExtractor';
import { logger } from 'keyboard-auth-common/lib/utils/logger';
import { IDataFrame } from 'data-forge';
import noop from 'lodash/noop';
import { InteractionConstructor } from 'keyboard-auth-common/lib/core/interaction';
import { Window } from 'keyboard-auth-common/lib/core/window';
import {
  KeyboardInteraction,
  KeyboardEvent
} from 'keyboard-auth-common/lib/typings/common';
import { AuthenticationModel } from 'keyboard-auth-common/lib/core/auth';
import { Metrics } from 'keyboard-auth-common/lib/core/metrics/Metrics';

function accessModel(
  train: KeyboardInteraction[],
  test: KeyboardInteraction[]
): number[] {
  // run model on test data
  const result: number[] = [];
  const model = new AuthenticationModel(train, 10);
  const auth = (w: KeyboardInteraction[]) => result.push(model.getDeviation(w));
  const window = new Window(noop, auth);
  test.forEach(window.add);
  return result;
}

function splitTestTrainData<T>(data: T[], ratio: number): [T[], T[]] {
  const trainSize = Math.floor(data.length * ratio);
  const train = data.slice(0, trainSize);
  const test = data.slice(trainSize);
  return [train, test];
}

function mapToInteractions(
  df: IDataFrame<number, KeyboardEvent>
): KeyboardInteraction[] {
  const interactions: KeyboardInteraction[] = [];
  const constructor = new InteractionConstructor(i => interactions.push(i));
  df.forEach(constructor.add);
  return interactions;
}

function main() {
  // get configuration
  const config = ConfigurationSource.get();
  logger.info(`Configuration: %j`, config);

  // read all user data
  logger.info(`[1] Reading user data…`);
  const extractor = new DatasetExtractor(config.dataPath, config.featuresFile);
  const userData = new Map<string, KeyboardInteraction[]>();
  let userIds = extractor.getUserIds();
  if (config.debug) {
    // in debug mode we will only use two users
    userIds = userIds.slice(0, 2);
  }
  userIds.forEach(userId => {
    logger.debug(`Reading data for user: ${userId}`);
    const data = extractor.getUserData(userId);
    userData.set(userId, mapToInteractions(data));
  });

  // test classifier
  logger.info(`[2] Testing users…`);
  userIds.forEach(userId => {
    // read user data
    logger.debug(`Preparing data for user: ${userId}`);
    const [train, testOwn] = splitTestTrainData(userData.get(userId)!, 0.7).map(
      v => v.slice(0, config.maxDatasetSize)
    );
    const testOther: KeyboardInteraction[] = [...userData.keys()]
      .filter(key => key !== userId)
      .map(key => userData.get(key)!)
      .reduce((acc, value) => acc.concat(value), [])
      .slice(0, config.maxDatasetSize);

    // calculate deviations on the model
    logger.debug(`Accessing model for user: ${userId}`);
    logger.debug(
      `Using ${testOwn.length} own samples, ${testOther.length} other`
    );
    logger.debug(`Assessing model on own data…`);
    const ownResult = accessModel(train, testOwn);
    logger.debug(`Assessing model on other user data…`);
    const otherResult = accessModel(train, testOther);

    // calculate statistics
    const stats = {
      medianOwn: Metrics.median(ownResult),
      medianOther: Metrics.median(otherResult),
      rocAuc: Metrics.rocAuc(
        [
          ...new Array(ownResult.length).fill(1),
          ...new Array(otherResult.length).fill(0)
        ],
        [...ownResult, ...otherResult]
      )
    };
    logger.info(`Statistics for user ${userId}: %j`, stats);
  });
}

main();
