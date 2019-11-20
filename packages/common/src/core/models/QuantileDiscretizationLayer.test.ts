import * as tf from '@tensorflow/tfjs-node';
import { QuantileDiscretizationLayer } from './QuantileDiscretizationLayer';

describe('QuantileDiscretizationLayer', () => {
  it('should calculate result correctly', () => {
    const vector = tf.tensor2d([[0, 0, 0], [1, 2, 3], [5, 6, 7], [10, 4, -5]]);
    const expected = tf.tensor2d([[0, 0, 0], [0, 0, 1], [1, 1, 1], [1, 1, 0]]);

    const model = new QuantileDiscretizationLayer(2);
    const actual = model.apply(vector) as tf.Tensor1D;

    expect(actual.toString()).toEqual(expected.toString());
  });

  it('should calculate result correctly when all feature values are equal', () => {
    const vector = tf.tensor2d([[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]]);
    const expected = tf.tensor2d([[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]);

    const model = new QuantileDiscretizationLayer(2);
    const actual = model.apply(vector) as tf.Tensor1D;

    expect(actual.toString()).toEqual(expected.toString());
  });

  it('should throw error if tensor is not 2D', () => {
    const vector = tf.tensor1d([1, 1, 1]);
    const model = new QuantileDiscretizationLayer(2);
    expect(() => model.apply(vector)).toThrowError();
  });
});
