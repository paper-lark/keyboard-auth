import { ArrayUtils } from './ArrayUtils';
import range from 'lodash/range';

describe('ArrayUtils', () => {
  describe('average', () => {
    it('calculates average', () => {
      const a = [10, 20, 30, 15, 20, 25];
      const expected = 20;
      const actual = ArrayUtils.average(a);
      expect(actual).toBeCloseTo(expected);
    });

    it('returns zero for an empty array', () => {
      const expected = 0;
      const actual = ArrayUtils.average([]);
      expect(actual).toBeCloseTo(expected);
    });
  });

  describe('padEnd', () => {
    it('pads array at the end', () => {
      const a = [10, 20, 30];
      const expected = [10, 20, 30, 0, 0];
      const actual = ArrayUtils.padEnd(a, 0, 5);
      expect(actual).toEqual(expected);
    });

    it('does nothing when array is already of the required length', () => {
      const a = [10, 20, 30];
      const expected = [10, 20, 30];
      const actual = ArrayUtils.padEnd(a, 0, 3);
      expect(actual).toEqual(expected);
    });
  });

  describe('shuffle', () => {
    it('shuffles array', () => {
      const a = [1, 5, 4, 3, 2];
      const actual = ArrayUtils.shuffle(a);
      expect(actual.sort()).toEqual(a.sort());
    });
  });

  describe('groupBy', () => {
    it('groups array by value in ascending order', () => {
      const weights = [4, 4, 4, 2, 1, 9];
      const indices = range(weights.length);
      const expected = [[4], [3], [0, 1, 2], [5]];
      const actual = ArrayUtils.groupBy(indices, i => weights[i]);
      expect(actual).toEqual(expected);
    });
  });
});
