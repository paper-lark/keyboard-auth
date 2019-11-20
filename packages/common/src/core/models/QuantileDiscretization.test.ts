import { QuantileDiscretization } from './QuantileDiscretization';

describe('QuantileDiscretization', () => {
  it('should discretize features based on the ground truth', () => {
    const gt = [[1, 2, 3, 6, 2, 2, 2, 2], [6, 5, 4, 4, 4, 4, 2, 3]];
    const values = [[1, 2, 3, 3, 6, 6], [7, 4, 3, 4, 3, 4]];
    const expected = [[0, 0, 3, 3, 3, 3], [3, 1, 0, 1, 0, 1]];
    const discretization = new QuantileDiscretization(gt, 4);
    const actual = discretization.apply(values);
    expect(actual).toEqual(expected);
  });

  it('should discretize when all feature values are equal', () => {
    const gt = [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]];
    const expected = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const discretization = new QuantileDiscretization(gt, 4);
    const actual = discretization.apply(gt);
    expect(actual).toEqual(expected);
  });
});
