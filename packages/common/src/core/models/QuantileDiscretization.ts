import { ArrayUtils } from '../../utils/ArrayUtils';

/**
 * QuantileDiscretizationLayer implements a quantile discretization layer.
 * Each feature value is replaces with the corresponding bin number.
 * The number of vectors in the output is the same as in the input.
 */
export class QuantileDiscretization {
  private readonly binsUpperLimit: number[][]; // quantiles for each feature
  constructor(gt: number[][], bins: number) {
    // feature * values
    this.binsUpperLimit = gt.reduce<number[][]>(
      (acc, feature) => [...acc, ArrayUtils.quantiles(feature, bins)],
      []
    );
  }

  public apply(a: number[][]): number[][] {
    // feature * values
    return a.reduce<number[][]>(
      (acc, feature, i) => [
        ...acc,
        ArrayUtils.discretize(feature, this.binsUpperLimit[i])
      ],
      []
    );
  }
}
