import range from 'lodash/range';
import assert from 'assert';

export namespace ArrayUtils {
  // Calculates mean of the given array
  export function mean(a: number[]): number {
    if (a.length === 0) {
      // prevent zero division
      return 0;
    }
    const sum = a.reduce((acc, value) => acc + value, 0);
    return sum / a.length;
  }

  export function padEnd<T>(a: T[], value: T, len: number): T[] {
    return [...a, ...Array(len).fill(value)].slice(0, len);
  }

  // Shuffle array using Fisher–Yates algorithm
  // Read more: https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
  export function shuffle<T>(a: T[]) {
    let result = [...a];
    let counter = result.length;
    while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      result[counter], (result[index] = result[index]), result[counter];
    }
    return result;
  }

  // Groups array entries by the specified criteria
  export function groupBy<T>(arr: T[], value: (a: T) => number): Array<T[]> {
    const temp = [...arr];
    temp.sort(
      (a, b) => Number(value(a) > value(b)) - Number(value(a) < value(b))
    );
    const groups: Array<T[]> = [];
    let currentGroup: T[] = [];
    temp.forEach((v, index) => {
      if (index === 0 || value(v) !== value(temp[index - 1])) {
        // element of the new group
        index !== 0 && groups.push(currentGroup);
        currentGroup = [v];
      } else {
        // element of the current group
        currentGroup.push(v);
      }
    });
    currentGroup.length > 0 && groups.push(currentGroup);

    return groups;
  }

  // Calculates quantiles of the specified order in the array
  export function quantiles(a: number[], order: number): number[] {
    assert.ok(a.length > 0, 'Cannot calculate quantiles for an empty array');
    assert.ok(
      order >= 2 && Number.isInteger(order),
      `Cannot calculate quantiles of ${order} order`
    );

    const temp = [...a].sort((b, c) => Number(b > c) - Number(b < c));
    return range(1, order).map(i => {
      const idx = (i / order) * (a.length - 1);
      const leftIdx = Math.floor(idx);
      if (leftIdx !== idx && leftIdx + 1 < a.length) {
        const frac = idx - leftIdx;
        return temp[leftIdx] * (1 - frac) + temp[leftIdx + 1] * frac;
      }
      return temp[leftIdx];
    });
  }

  // Returns array of discretized values using specified quantiles
  export function discretize(a: number[], quantile: number[]): number[] {
    assert.ok(
      quantile.length > 0,
      'Quantile array is empty, cannot discretize'
    );

    const idx = range(a.length).sort(
      (i, j) => Number(a[i] > a[j]) - Number(a[i] < a[j])
    );
    let currentQuantile = 0;
    const binForIdx = idx.map(i => {
      while (
        currentQuantile < quantile.length &&
        a[i] > quantile[currentQuantile]
      ) {
        currentQuantile++;
      }
      return currentQuantile;
    });
    const result = new Array(a.length).fill(0);
    idx.forEach((i, j) => (result[i] = binForIdx[j]));
    return result;
  }

  // Calculates median of the array
  export function median(a: number[]): number {
    return quantiles(a, 2)[0];
  }
}
