import * as tf from '@tensorflow/tfjs-node';
import { QuantileDiscretizationLayer } from './models/QuantileDiscretizationLayer';
import { MaxDeviationLayer } from './models/MaxDeviationLayer';
import { logger } from 'keyboard-auth-common/lib/utils/logger';
import { KeyboardInteraction } from '../typings/common';
import { FeatureExtractor } from '../utils/FeatureExtractor';
import { ArrayUtils } from '../utils/ArrayUtils';
import { Window } from './window';
import noop from 'lodash/noop';

export class AuthenticationModel {
  private static readonly singleFeatures = 37;
  private static readonly digraphFeatures = 100;
  private static readonly numberOfBins = 3;
  private gt: tf.Tensor1D[] = [];

  private static mapWindowToTensor(window: KeyboardInteraction[]): tf.Tensor1D {
    // choose most frequent digraphs and single clicks
    const chosenDigraphs = FeatureExtractor.getDigraphs(window).slice(
      0,
      this.digraphFeatures
    );
    const chosenSingle = FeatureExtractor.getSingle(window).slice(
      0,
      this.singleFeatures
    );

    // extract features
    const digraphFeatures = chosenDigraphs
      .map(feature => [
        ArrayUtils.average(feature.timings.map(t => t.uu)),
        ArrayUtils.average(feature.timings.map(t => t.du))
      ])
      .reduce((acc, val) => [...acc, ...val], []);
    const singleFeatures = chosenSingle.map(feature =>
      ArrayUtils.average(feature.timings)
    );

    // pad features so that tensor always has the same size
    const paddedDigraphFeatures = ArrayUtils.padEnd(
      digraphFeatures,
      0,
      this.digraphFeatures * 2
    );
    const paddedSingleFeatures = ArrayUtils.padEnd(
      singleFeatures,
      0,
      this.singleFeatures
    );

    return tf.tensor1d([...paddedDigraphFeatures, ...paddedSingleFeatures]);
  }

  constructor(gt: KeyboardInteraction[], private maxDeviation: number) {
    const window = new Window(noop, win => {
      this.gt.push(AuthenticationModel.mapWindowToTensor(win));
    });
    gt.forEach(i => window.add(i));
  }

  public getDeviation(window: KeyboardInteraction[]): number {
    return this.calculateDeviation(
      AuthenticationModel.mapWindowToTensor(window)
    );
  }

  public authenticate(window: KeyboardInteraction[]): boolean {
    const deviation = this.getDeviation(window);
    logger.debug(`Deviation=${deviation}`);
    return deviation < this.maxDeviation;
  }

  private calculateDeviation(input: tf.Tensor1D): number {
    const inputTensor = tf.stack([...this.gt, input], 0);
    const discretisized = new QuantileDiscretizationLayer(
      AuthenticationModel.numberOfBins
    ).apply(inputTensor) as tf.Tensor2D;
    // TODO: save quantiles

    const gt = tf.slice(discretisized, [0, 0], [this.gt.length, -1]);
    const test = tf.slice(discretisized, [this.gt.length, 0], [1, -1]);
    const deviation = new MaxDeviationLayer(gt).apply(test);

    return (deviation as tf.Tensor1D).bufferSync().get(0);
  }
}
