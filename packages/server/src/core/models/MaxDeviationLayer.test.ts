import * as tf from '@tensorflow/tfjs-node';
import { MaxDeviationLayer } from './MaxDeviationLayer';

describe('MaxDeviationLayer', () => {
  it('should calculate metric correctly', () => {
    const gt = tf.tensor2d([
      [0, 0, 0, 0],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [10, 4, -5, -1]
    ]);
    const vector = tf.tensor1d([1, 1, 2, 3]);
    const expected = 18 / 4;

    const model = new MaxDeviationLayer(gt);
    const actual = (model.apply(vector) as tf.Tensor1D).bufferSync();

    expect(actual.get(0)).toEqual(expected);
  });

  it('should throw error when ground truth is empty', () => {
    const gt = tf.tensor2d([[]]);
    expect(() => new MaxDeviationLayer(gt)).toThrowError();
  });

  it('should throw error when vector dimensions do not correlate with the ground truth ones', () => {
    const gt = tf.tensor2d([
      [0, 0, 0, 0],
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [10, 4, -5, -1]
    ]);
    const vector = tf.tensor1d([1, 1, 2]);

    const model = new MaxDeviationLayer(gt);
    expect(() => model.apply(vector)).toThrowError();
  });
});
