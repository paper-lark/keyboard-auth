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
}
