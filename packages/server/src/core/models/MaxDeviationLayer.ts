import * as tf from '@tensorflow/tfjs-node';

/**
 * MaxDeviationLayer implements a pseudometric-based layer.
 * Maximum deviation metric is defined as ⍴(x, y) = max_{i}(|x_i - y_i|).
 * Deviation from the ground truth set is defined as the sum of metric value.
 */
export class MaxDeviationLayer extends tf.layers.Layer {
  /**
   * Creates the model.
   * @constructor
   * @param {tf.Tensor2D} gt - Two-dimensional ground truth set used by the model
   */
  constructor(private gt: tf.Tensor2D) {
    super({});

    if (gt.shape[0] === 0 || gt.shape[1] === 0) {
      throw new Error(
        `Expected ground truth dimensions: [*, *], received: [${gt.shape}]`
      );
    }
  }

  public computeOutputShape(
    inputShape: tf.Shape | tf.Shape[]
  ): tf.Shape | tf.Shape[] {
    if (inputShape.length !== 1 || inputShape[0] !== this.gt.shape[1]) {
      throw new Error(
        `Invalid vector dimensions, expected: [*, [${this.gt.shape[1]}], received: ${inputShape}`
      );
    }

    return [inputShape[0]];
  }

  /**
   * Calculates metric value for vectors from the pseudometric space.
   * @param {tf.Tensor} vector - Vectors
   * @returns {tf.Tensor} - Maximum deviation metric value for each vector
   */
  public call(inputs: tf.Tensor): tf.Tensor {
    const expanded = inputs.as1D().expandDims(0);
    return tf
      .sum(tf.max(tf.abs(this.gt.sub(expanded)), [1]))
      .div(this.gt.shape[0]);
  }

  /**
   * Getter for layer class name.
   * @returns {string} - Class name
   */
  public getClassName(): string {
    return 'MaxDeviationLayer';
  }
}
