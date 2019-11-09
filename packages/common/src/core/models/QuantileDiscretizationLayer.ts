import * as tf from '@tensorflow/tfjs-node';
import _ from 'lodash';
import { LayerArgs } from '@tensorflow/tfjs-layers/dist/engine/topology';
import { logger } from '../../utils/logger';

/**
 * QuantileDiscretizationLayer implements a quantile discretization layer.
 * Each feature value is replaces with the corresponding bin number.
 * The number of vectors in the output is the same as in the input.
 */
export class QuantileDiscretizationLayer extends tf.layers.Layer {
  constructor(private bins: number, args?: LayerArgs) {
    super(args || {});
    if (!Number.isInteger(bins) || bins <= 0) {
      throw new Error(
        `Number of bins must be a positive integer, specified: ${bins}`
      );
    }
  }

  public computeOutputShape(
    inputShape: tf.Shape | tf.Shape[]
  ): tf.Shape | tf.Shape[] {
    logger.debug(`Shape in discretization: ${JSON.stringify(inputShape)}`);
    if (inputShape.length !== 2) {
      throw new Error(
        `Invalid vector dimensions, expected: [*, *], received: ${JSON.stringify(
          inputShape
        )}`
      );
    }
    return inputShape;
  }

  public call(inputs: tf.Tensor): tf.Tensor {
    const m = inputs.shape[0];
    const n = inputs.shape[1];

    // discretisize each feature
    const discretisizedFeatures: Array<number[]> = [];
    _.range(0, n).forEach(j => {
      // sort feature values
      const feature = tf.slice(inputs, [0, j], [-1, 1]);
      const { indices } = feature.as1D().topk(m, true); // sorted in the descending order
      const idxBuffer = (indices as tf.Tensor1D).bufferSync();
      const featureBuffer = (feature as tf.Tensor1D).bufferSync();

      // discretisize each feature value
      let currentBin = 0;
      const elementsInBin = m / this.bins;
      const discretisizedValues: number[] = Array.from({ length: m }, () => 0);
      let previousValue: number | null = null;
      _.range(0, m).forEach(i => {
        const currentIndex = idxBuffer.get(m - i - 1);
        const currentValue = featureBuffer.get(currentIndex);
        if (
          // time to switch to the next bucket
          i >= (currentBin + 1) * elementsInBin &&
          // equal values should appear in one bucket
          previousValue !== currentValue
        ) {
          // proceed to the next bin
          currentBin++;
        }
        previousValue = currentValue;
        discretisizedValues[currentIndex] = currentBin;
      });
      discretisizedFeatures.push(discretisizedValues);
    });

    return tf.tensor2d(discretisizedFeatures).transpose();
  }

  public getClassName(): string {
    return 'QuantileDiscretizationLayer';
  }
}
