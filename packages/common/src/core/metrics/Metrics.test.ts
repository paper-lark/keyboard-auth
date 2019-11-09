import { Metrics } from './Metrics';

describe('Metrics', () => {
  describe('ROC AUC', () => {
    it('should throw error when arrays have different length', () => {
      const gt: number[] = [10];
      const pred: number[] = [];
      expect(() => Metrics.rocAuc(gt, pred)).toThrowError();
    });

    it('should throw error when a class is missing', () => {
      const gt: number[] = [1, 1, 1, 1];
      const pred: number[] = [10, 10, 20, 30];
      expect(() => Metrics.rocAuc(gt, pred)).toThrowError();
    });

    it('should calculate score when positive class has higher predictions', () => {
      const gt: number[] = [1, 0, 0, 1];
      const pred: number[] = [20, 5, 4, 30];
      const expected = 1;
      const actual = Metrics.rocAuc(gt, pred);
      expect(actual).toBeCloseTo(expected);
    });

    it('should calculate score when positive class has lower predictions', () => {
      const gt: number[] = [0, 1, 1, 0];
      const pred: number[] = [20, 5, 4, 30];
      const expected = 0;
      const actual = Metrics.rocAuc(gt, pred);
      expect(actual).toBeCloseTo(expected);
    });

    it('should calculate score when predictions are inseparable', () => {
      const gt: number[] = [1, 0, 0, 1];
      const pred: number[] = [2, 5, 4, 30];
      const expected = 0.5;
      const actual = Metrics.rocAuc(gt, pred);
      expect(actual).toBeCloseTo(expected);
    });

    it('should calculate score when all predictions have the same value', () => {
      const gt: number[] = [0, 1, 1, 0];
      const pred: number[] = [2, 2, 2, 2];
      const expected = 0;
      const actual = Metrics.rocAuc(gt, pred);
      expect(actual).toBeCloseTo(expected);
    });
  });

  describe('Median', () => {
    it('should calculate median correctly when length is odd', () => {
      const values = [0, -1, 5, -10, 10, 20, 4];
      const expected = 4;
      const actual = Metrics.median(values);
      expect(actual).toBeCloseTo(expected);
    });

    it('should calculate median correctly when length is even', () => {
      const values = [0, -1, 5, -10, 10, 20, 4, -100];
      const expected = 2;
      const actual = Metrics.median(values);
      expect(actual).toBeCloseTo(expected);
    });

    it('should calculate median correctly when length is one', () => {
      const values = [10];
      const expected = 10;
      const actual = Metrics.median(values);
      expect(actual).toBeCloseTo(expected);
    });
  });
});
