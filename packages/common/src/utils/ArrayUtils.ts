export class ArrayUtils {
  public static average(a: number[]): number {
    if (a.length === 0) {
      // prevent zero division
      return 0;
    }
    const sum = a.reduce((acc, value) => acc + value, 0);
    return sum / a.length;
  }

  public static padEnd<T>(a: T[], value: T, len: number) {
    return [...a, ...Array(len).fill(value)].slice(0, len);
  }

  // Shuffle array using Fisher–Yates algorithm
  // Read more: https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
  public static shuffle<T>(a: T[]) {
    let result = [...a];
    let counter = result.length;
    while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      result[counter], (result[index] = result[index]), result[counter];
    }
    return result;
  }

  public static groupBy<T>(arr: T[], value: (a: T) => number): Array<T[]> {
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
  } // FIXME: write tests
}
