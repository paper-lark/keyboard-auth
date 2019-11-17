import { ArrayUtils } from './ArrayUtils';
import range from 'lodash/range';

describe('ArrayUtils', () => {
  describe('mean', () => {
    it('calculates average', () => {
      const a = [10, 20, 30, 15, 20, 25];
      const expected = 20;
      const actual = ArrayUtils.mean(a);
      expect(actual).toBeCloseTo(expected);
    });

    it('returns zero for an empty array', () => {
      const expected = 0;
      const actual = ArrayUtils.mean([]);
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

  describe('quantiles', () => {
    it('should calculate quantiles when order is 3', () => {
      const values = [1, 4, 2, 6, 6, 6, 8, 2, 3, 5, 4, 2, 2, 3];
      const expected = [7 / 3, 14 / 3];
      const actual = ArrayUtils.quantiles(values, 3);
      range(expected.length).forEach(i =>
        expect(actual[i]).toBeCloseTo(expected[i])
      );
    });

    it('should calculate quantiles when order is 4', () => {
      const values = [1, 2, 3, 6, 2, 2, 2, 2];
      const expected = [2, 2, 2.25];
      const actual = ArrayUtils.quantiles(values, 4);
      range(expected.length).forEach(i =>
        expect(actual[i]).toBeCloseTo(expected[i])
      );
    });

    it('should calculate quantiles when array length is less than the order', () => {
      const values = [1, 2];
      const expected = [1.25, 1.5, 1.75];
      const actual = ArrayUtils.quantiles(values, 4);
      range(expected.length).forEach(i =>
        expect(actual[i]).toBeCloseTo(expected[i])
      );
    });

    it('throws when order is invalid', () => {
      const values = [1, 4, 2, 6, 6, 6, 8];
      expect(() => ArrayUtils.quantiles(values, 1)).toThrowError();
      expect(() => ArrayUtils.quantiles(values, 4.5)).toThrowError();
    });

    it('throws when array is empty', () => {
      expect(() => ArrayUtils.quantiles([], 5)).toThrowError();
    });
  });

  describe('discretize', () => {
    it('should discretize array with quantiles', () => {
      const a = [1, 3, 4, 2, 6, 1, 7, 3];
      const q = [2, 5, 6];
      const expected = [0, 1, 1, 0, 2, 0, 3, 1];
      const actual = ArrayUtils.discretize(a, q);
      expect(actual).toEqual(expected);
    });

    it('throws when quantile array is empty', () => {
      expect(() => ArrayUtils.discretize([1, 2, 3], [])).toThrowError();
    });
  });

  describe('median', () => {
    it('should calculate median correctly when length is odd', () => {
      const values = [0, 0, 5, -10, 10, 20, 4];
      const expected = 4;
      const actual = ArrayUtils.median(values);
      expect(actual).toBeCloseTo(expected);
    });

    it('should calculate median correctly when length is even', () => {
      const values = [0, 0, 5, -10, 10, 20, 4, -100];
      const expected = 2;
      const actual = ArrayUtils.median(values);
      expect(actual).toBeCloseTo(expected);
    });

    it('should calculate median correctly when length is one', () => {
      const values = [10];
      const expected = 10;
      const actual = ArrayUtils.median(values);
      expect(actual).toBeCloseTo(expected);
    });
  });
});
