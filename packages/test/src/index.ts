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
import { ArrayUtils } from 'keyboard-auth-common/lib/utils/ArrayUtils';

type UserTestStats = {
  medianTrain: number;
  medianOwn: number;
  medianOther: number;
  rocAuc: number;
};

function accessModel(
  train: KeyboardInteraction[],
  test: KeyboardInteraction[]
): number[] {
  // run model on test data
  const result: number[] = [];
  const model = new AuthenticationModel(train, -550);
  const auth = (w: KeyboardInteraction[]) => result.push(model.getDecision(w));
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
    // in debug mode we will only use a subset of users
    userIds = [
      '02a7de3838',
      '7108e57eb2',
      '0181822d4e',
      '75ca32de55',
      '0f3ac5bb14',
      '96d871061f',
      '8cff916a1e',
      '6790b680de',
      '22f4143c05',
      '8bc4f1c24f'
    ];
  }
  userIds = ArrayUtils.shuffle(userIds).slice(0, 50);
  userIds.forEach(userId => {
    logger.debug(`Reading data for user: ${userId}`);
    const data = extractor.getUserData(userId);
    userData.set(userId, mapToInteractions(data));
  });

  // test classifier
  logger.info(`[2] Testing users…`);
  const stats: UserTestStats[] = [];
  userIds.forEach((userId, i) => {
    // read user data
    logger.debug(`Preparing data for user ${userId}`);
    const [train, testOwn] = splitTestTrainData(userData.get(userId)!, 0.8).map(
      (v, i) =>
        i === 0
          ? v.slice(0, 2 * config.maxDatasetSize)
          : v.slice(0, config.maxDatasetSize)
    );
    const testOther: KeyboardInteraction[] = [...userData.keys()]
      .filter(key => key !== userId)
      .map(key => userData.get(key)!)
      .reduce((acc, value) => acc.concat(value), [])
      .slice(0, config.maxDatasetSize);

    // calculate deviations on the model
    logger.debug(`Accessing model for user ${userId}: %j`, {
      train: train.length,
      test: testOwn.length
    });
    const trainResult = accessModel(train, train);
    const ownResult = accessModel(train, testOwn);
    const otherResult = accessModel(train, testOther);

    // calculate statistics
    const userStats = {
      medianTrain: ArrayUtils.median(trainResult),
      medianOwn: ArrayUtils.median(ownResult),
      medianOther: ArrayUtils.median(otherResult),
      rocAuc: Metrics.rocAuc(
        [
          ...new Array(ownResult.length).fill(1),
          ...new Array(otherResult.length).fill(0)
        ],
        [...ownResult, ...otherResult]
      )
    };
    logger.info(`Statistics for user ${userId}: %j`, userStats);
    stats.push(userStats);
    if (i % 5 === 0 && global.gc) {
      global.gc();
      logger.debug(`Garbage collected`);
    }
  });

  // print final statistics
  const groupedStats = stats.reduce<{ [k in keyof UserTestStats]: number[] }>(
    (acc, v) => ({
      medianOther: [...acc.medianOther, v.medianOther],
      medianOwn: [...acc.medianOwn, v.medianOwn],
      medianTrain: [...acc.medianTrain, v.medianTrain],
      rocAuc: [...acc.rocAuc, v.rocAuc]
    }),
    {
      medianOther: [],
      medianOwn: [],
      medianTrain: [],
      rocAuc: []
    }
  );
  const finalStats = Object.keys(groupedStats)
    .map(k => [k, ArrayUtils.median(groupedStats[k])])
    .reduce((acc, pair) => ({ ...acc, [pair[0]]: pair[1] }), {});
  logger.info(`Final statistics: %j`, finalStats);
  logger.info(JSON.stringify(stats));
}

main();
