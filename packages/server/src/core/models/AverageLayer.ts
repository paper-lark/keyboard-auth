import * as tf from '@tensorflow/tfjs-node';
import { logger } from 'keyboard-auth-common/lib/utils/logger';

/**
 * AverageLayer calculates average value of each feature in the window.
 * Input is a 2D tensor of size (m, n).
 * Output is a 1D tensor of size (n).
 */
export class AverageLayer extends tf.layers.Layer {
  constructor() {
    super({});
  }

  public computeOutputShape(
    inputShape: tf.Shape | tf.Shape[]
  ): tf.Shape | tf.Shape[] {
    logger.debug(`Shape in average: ${JSON.stringify(inputShape)}`);
    if (inputShape.length !== 2) {
      throw new Error(
        `Invalid vector dimensions, expected: [*, *], received: ${JSON.stringify(
          inputShape
        )}`
      );
    }
    return [(inputShape as tf.Shape)[1]];
  }

  public call(inputs: tf.Tensor): tf.Tensor {
    const m = inputs.shape[0];
    return tf.div(tf.sum(inputs, 0), m);
  }

  public getClassName(): string {
    return 'AverageLayer';
  }
}
