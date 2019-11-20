import range from 'lodash/range';
import { ArrayUtils } from '../../utils/ArrayUtils';

export namespace Metrics {
  /**
   * Calculates ROC AUC score
   * Read more: http://www.machinelearning.ru/wiki/index.php?title=Кривая_ошибок
   * @param {number[]} gt – ground truth classes, 0 or 1
   * @param {number[]} pred – predicted value, high for positive class and low for negative
   * @returns {number} – ROC AUC value
   */
  export function rocAuc(gt: number[], pred: number[]): number {
    // check lengths
    if (gt.length !== pred.length) {
      throw new Error(`Ground truth and prediction lengths should be the same`);
    }
    // calculate class representatives count
    const [positiveCount, negativeCount] = gt.reduce(
      (acc, current) => [acc[0] + current, acc[1] + 1 - current],
      [0, 0]
    );

    // validate class counts
    if (positiveCount === 0) {
      throw new Error(`Cannot calculate ROC AUC without positive samples`);
    }
    if (negativeCount === 0) {
      throw new Error(`Cannot calculate ROC AUC without negative samples`);
    }

    // group by predictions
    const groups = ArrayUtils.groupBy(range(gt.length), i => pred[i])
      .reverse()
      .reduce((groupsAcc, idx) => {
        const newGroup = idx.reduce(
          (acc, i) => ({
            positive: acc.positive + gt[i],
            negative: acc.negative + 1 - gt[i]
          }),
          {
            positive: 0,
            negative: 0
          }
        );
        return [...groupsAcc, newGroup];
      },      new Array<{ positive: number; negative: number }>());

    // calculate ROC AUC score
    let tpr = 0;
    const negativeInc = 1 / negativeCount;
    const positiveInc = 1 / positiveCount;
    return groups.reduce((score, g) => {
      const newScore =
        score +
        g.negative * negativeInc * tpr +
        0.5 * g.negative * negativeInc * g.positive * positiveInc;
      tpr += g.positive * positiveInc;
      return newScore;
    },                   0);
  }
}
