import range from 'lodash/range';

export class Metrics {
  /**
   * Calculates ROC AUC score
   * Read more: http://www.machinelearning.ru/wiki/index.php?title=Кривая_ошибок
   * @param {number[]} gt – ground truth classes, 0 or 1
   * @param {number[]} pred – predicted value, high for positive class and low for negative
   * @returns {number} – ROC AUC value
   */
  public static rocAuc(gt: number[], pred: number[]): number {
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

    // order predictions in descending order
    const idx = range(gt.length);
    idx.sort((a, b) => {
      if (pred[a] === pred[b]) {
        // negative class should go before positive
        return gt[a] > gt[b] ? 1 : -1;
      }
      // larger value should go before smaller
      return pred[a] < pred[b] ? 1 : -1;
    });

    // calculate ROC AUC score
    let score = 0;
    let tpr = 0;
    const negativeInc = 1 / negativeCount;
    const positiveInc = 1 / positiveCount;
    idx.forEach(i => {
      if (gt[i] === 0) {
        score += negativeInc * tpr;
      } else {
        tpr += positiveInc;
      }
    });

    return score;
  }

  /**
   * Calculates median value.
   * @param {number[]} values – array of values
   * @returns {number} – median value from the array
   */
  public static median(values: number[]): number {
    if (values.length === 0) {
      return 0;
    }

    const sorted = [...values].sort((a, b) => Number(a > b) - Number(a < b));
    const half = (values.length - 1) / 2;
    if ((values.length - 1) % 2 === 1) {
      return (sorted[Math.ceil(half)] + sorted[Math.floor(half)]) / 2;
    }
    return sorted[Math.floor(half)];
  }
}
