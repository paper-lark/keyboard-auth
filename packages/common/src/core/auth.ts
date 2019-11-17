import * as tf from '@tensorflow/tfjs-node';
import { MaxDeviationLayer } from './models/MaxDeviationLayer';
import { KeyboardInteraction } from '../typings/common';
import { FeatureExtractor } from '../utils/FeatureExtractor';
import { ArrayUtils } from '../utils/ArrayUtils';
import { Window } from './window';
import noop from 'lodash/noop';
import range from 'lodash/range';
import { QuantileDiscretization } from './models/QuantileDiscretization';

export class AuthenticationModel {
  private readonly discretization: QuantileDiscretization;
  private readonly gt: tf.Tensor2D;
  private readonly maxDeviation: number;
  private readonly singleFeatures: number;
  private readonly digraphFeatures: number;

  constructor(
    gt: KeyboardInteraction[],
    params: {
      maxDeviation: number;
      singleFeatures: number;
      digraphFeatures: number;
      discretizationBins: number;
    }
  ) {
    // fill in parameters
    this.maxDeviation = params.maxDeviation;
    this.singleFeatures = params.singleFeatures;
    this.digraphFeatures = params.digraphFeatures;

    // create multidimensional feature
    const intervals = this.getIntervals(gt);
    const multiFeatures = range(
      this.singleFeatures + 2 * this.digraphFeatures
    ).map(() => intervals);
    // const multiFeatures = this.getFeatures(gt);
    this.discretization = new QuantileDiscretization(
      multiFeatures,
      params.discretizationBins
    );

    // calculate ground truth vectors
    const gtVectors: tf.Tensor1D[] = [];
    const window = new Window(noop, win => {
      gtVectors.push(tf.tensor1d(this.discretize(this.getFeatures(win))));
    });
    gt.forEach(v => window.add(v));
    this.gt = tf.stack(gtVectors, 0) as tf.Tensor2D;
  }

  public getDecision(window: KeyboardInteraction[]): number {
    // deviation is negated so that positive class has a smaller value than the negative one
    return -this.calculateDeviation(
      tf.tensor1d(this.discretize(this.getFeatures(window)))
    );
  }

  public authenticate(window: KeyboardInteraction[]): boolean {
    const deviation = this.getDecision(window);
    return deviation < this.maxDeviation;
  }

  private calculateDeviation(input: tf.Tensor1D): number {
    const deviation = new MaxDeviationLayer(this.gt).apply(input);
    return (deviation as tf.Tensor1D).bufferSync().get(0);
  }

  private getIntervals(window: KeyboardInteraction[]): number[] {
    const chosenDigraphs = FeatureExtractor.getDigraphs(window).slice(
      0,
      this.digraphFeatures
    );
    const chosenSingle = FeatureExtractor.getSingle(window).slice(
      0,
      this.singleFeatures
    );
    const digraphFeatures = chosenDigraphs
      .map(feature => [
        ...feature.timings.map(t => t.uu),
        ...feature.timings.map(t => t.du)
      ])
      .reduce((acc, val) => [...acc, ...val], []);
    const singleFeatures = chosenSingle
      .map(feature => feature.timings)
      .reduce((acc, val) => [...acc, ...val], []);
    return [...digraphFeatures, ...singleFeatures];
  }

  /**
   * Calculate multidimensional feature vector
   * @param window – window of interactions
   * @returns – feature vector where for each feature there is an array of its values
   */
  private getFeatures(window: KeyboardInteraction[]): number[][] {
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
        feature.timings.map(t => t.uu),
        feature.timings.map(t => t.du)
      ])
      .reduce((acc, val) => [...acc, ...val], [])
      .sort((a, b) => {
        const aMean = ArrayUtils.mean(a);
        const bMean = ArrayUtils.mean(b);
        return Number(aMean < bMean) - Number(aMean > bMean);
      }); // sort in the descending order
    const singleFeatures = chosenSingle
      .map(feature => feature.timings)
      .sort((a, b) => {
        const aMean = ArrayUtils.mean(a);
        const bMean = ArrayUtils.mean(b);
        return Number(aMean < bMean) - Number(aMean > bMean);
      }); // sort in the descending order

    // pad features so that tensor always has the same size
    const paddedDigraphFeatures: number[][] = ArrayUtils.padEnd(
      digraphFeatures,
      [0],
      this.digraphFeatures * 2
    );
    const paddedSingleFeatures: number[][] = ArrayUtils.padEnd(
      singleFeatures,
      [0],
      this.singleFeatures
    );
    return [...paddedDigraphFeatures, ...paddedSingleFeatures];
  }

  /**
   * Discretize features.
   * @param features – feature vector where for each feature there is an array of its values
   * @returns – mean values for each feature
   */
  private discretize(features: number[][]): number[] {
    return this.discretization
      .apply(features.map(f => [ArrayUtils.mean(f)]))
      .map(v => v[0]);
  }
}
