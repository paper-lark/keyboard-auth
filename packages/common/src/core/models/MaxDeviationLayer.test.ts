import * as tf from '@tensorflow/tfjs-node';
import { MaxDeviationLayer } from './MaxDeviationLayer';
import range from 'lodash/range';

describe('MaxDeviationLayer', () => {
  it('should calculate metric correctly', () => {
    const gt = tf.tensor2d([
      [14, 43, 15, 21, 45],
      [12, 32, 43, 76, 13],
      [98, 23, 75, 12, 85]
    ]);
    const vectors = [
      tf.tensor1d([54, 23, 52, 10, 42]),
      tf.tensor1d([12, 32, 53, 19, 23]),
      tf.tensor1d([65, 29, 54, 17, 62])
    ];
    const expected = [210, 254, 214];

    const model = new MaxDeviationLayer(gt);
    range(vectors.length).forEach(i => {
      const actual = (model.apply(vectors[i]) as tf.Tensor1D).bufferSync();
      expect(actual.get(0)).toEqual(expected[i]);
    });
  });

  it('should throw error when ground truth is empty', () => {
    const gt = tf.tensor2d([[]]);
    expect(() => new MaxDeviationLayer(gt)).toThrowError();
  });

  it('should throw error when vector dimensions do not correlate with the ground truth ones', () => {
    const gt = tf.tensor2d([[0, 0, 0, 0], [1, 2, 3, 4], [5, 6, 7, 8]]);
    const vector = tf.tensor1d([1, 1, 2]);

    const model = new MaxDeviationLayer(gt);
    expect(() => model.apply(vector)).toThrowError();
  });
});
