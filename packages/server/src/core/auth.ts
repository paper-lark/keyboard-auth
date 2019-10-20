import * as tf from '@tensorflow/tfjs-node';
import { QuantileDiscretizationLayer } from './models/QuantileDiscretizationLayer';
import { AverageLayer } from './models/AverageLayer';
import { MaxDeviationLayer } from './models/MaxDeviationLayer';
import { KeyboardInteraction } from './window';
import { logger } from 'keyboard-auth-common/lib/utils/logger';

export class AuthenticationModel {
  private static readonly singleFeatures = 37;
  private static readonly digraphFeatures = 100;
  private static readonly numberOfBins = 3;
  private gt: tf.Tensor2D;
  // FIXME: use model

  private static mapInteractionsToTensor(
    window: KeyboardInteraction[]
  ): tf.Tensor2D {
    // FIXME: select 37 clicks and 100 digraphs
    return tf.zeros([
      window.length,
      this.singleFeatures + this.digraphFeatures
    ]);
  }

  constructor(gt: KeyboardInteraction[], private maxDeviation: number) {
    this.gt = new QuantileDiscretizationLayer(
      AuthenticationModel.numberOfBins
    ).apply(AuthenticationModel.mapInteractionsToTensor(gt)) as tf.Tensor2D;
  }

  public authenticate(window: KeyboardInteraction[]): boolean {
    const deviationValue = this.calculateDeviation(
      AuthenticationModel.mapInteractionsToTensor(window)
    );
    logger.debug(`Deviation is ${deviationValue}`);
    return deviationValue < this.maxDeviation;
  }

  private calculateDeviation(input: tf.Tensor2D): number {
    const discretisized = new QuantileDiscretizationLayer(
      AuthenticationModel.numberOfBins
    ).apply(input);

    const averaged = new AverageLayer().apply(discretisized);
    const deviation = new MaxDeviationLayer(this.gt).apply(averaged);

    return (deviation as tf.Tensor1D).bufferSync().get(0);
  }
}
