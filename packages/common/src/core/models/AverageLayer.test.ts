import * as tf from '@tensorflow/tfjs-node';
import { AverageLayer } from './AverageLayer';

describe('AverageLayer', () => {
  it('should calculate metric correctly', () => {
    const vector = tf.tensor2d([[0, 2, 3], [2, 2, 3], [3, 6, 7], [5, 4, -5]]);
    const expected = tf.tensor1d([5 / 2, 7 / 2, 2]);

    const model = new AverageLayer();
    const actual = model.apply(vector) as tf.Tensor1D;

    expect(actual.toString()).toEqual(expected.toString());
  });
});
