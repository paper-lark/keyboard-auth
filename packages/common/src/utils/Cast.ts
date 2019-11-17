/**
 * Namespace defines a set of utilities for runtime type checking.
 * These are useful when a values is received from an external source, such as a file or API.
 */
export namespace Cast {
  type UnknownObject = {
    [key: string]: unknown;
  };

  export function toObject(x: unknown): UnknownObject {
    if (x instanceof Object) {
      return x as UnknownObject;
    }
    throw new Error(
      `Type assertion failed: ${JSON.stringify(x)} is not an object`
    );
  }

  export function toBoolean(x: unknown): boolean {
    if (typeof x === 'boolean') {
      return x;
    }
    throw new Error(
      `Type assertion failed: ${JSON.stringify(x)} is not a boolean`
    );
  }

  export function toNumber(x: unknown): number {
    if (typeof x === 'number') {
      return x;
    }
    throw new Error(
      `Type assertion failed: ${JSON.stringify(x)} is not a number`
    );
  }

  export function toString(x: unknown): string {
    if (typeof x === 'string') {
      return x;
    }
    throw new Error(
      `Type assertion failed: ${JSON.stringify(x)} is not a string`
    );
  }
}
