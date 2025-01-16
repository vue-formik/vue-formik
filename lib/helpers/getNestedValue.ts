/* eslint-disable @typescript-eslint/no-explicit-any */
type NestedPaths<T> = T extends object ? {
  [K in keyof T]: K extends string | number
    ? `${K}` | `${K}.${NestedPaths<T[K]>}` | (T[K] extends (infer U)[] ? `${K}[${number}]` | `${K}[${number}].${NestedPaths<U>}` : never)
    : never;
}[keyof T] : never;

type NestedValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? NestedValue<T[K], R>
      : K extends `${infer A}[${infer I}]`
        ? A extends keyof T
          ? T[A] extends (infer U)[]
            ? NestedValue<U, R>
            : undefined
          : undefined
        : undefined
    : P extends `${infer A}[${infer I}]`
      ? A extends keyof T
        ? T[A] extends (infer U)[]
          ? U
          : undefined
        : undefined
      : undefined;

/**
 * Gets a nested value from an object using a dot notation path with array support
 * @template T - The type of the object to get from
 * @template P - The type of the path string
 * @param {T} obj - The object to get the value from
 * @param {P} path - The path to the value (e.g., "user.address.street" or "items[0].name")
 * @returns {NestedValue<T, P> | undefined} - The value at the path or undefined if not found
 */
const getNestedValue = <T extends object, P extends NestedPaths<T>>(
  obj: T,
  path: P
): NestedValue<T, P> | undefined => {
  // Early return for invalid inputs
  if (obj == null) {
    return undefined;
  }

  // Cache regex pattern
  const arrayPattern = /^(.*?)\[(\d+)](.*)$/;

  // Direct property access optimization
  if (path in obj) {
    return obj[path as unknown as keyof T] as NestedValue<T, P>;
  }

  // Helper function to safely get array element
  const getArrayElement = (arr: any[], index: number): any | undefined => {
    return index >= 0 && index < arr.length ? arr[index] : undefined;
  };

  // Helper function for parsing path segments
  const parsePathSegment = (segment: string): { key: string; index?: number; rest?: string } => {
    const match = segment.match(arrayPattern);
    if (match) {
      const [, key, indexStr, rest] = match;
      return {
        key: key || '',
        index: parseInt(indexStr, 10),
        rest: rest || undefined
      };
    }
    return { key: segment };
  };

  // Helper function for recursive value retrieval
  const getValueRecursive = (current: any, pathSegment: string, remainingPath?: string): any => {
    const { key, index, rest } = parsePathSegment(pathSegment);

    let nextValue: any;

    if (index !== undefined) {
      // Handle array access
      const arr = current[key];
      if (!Array.isArray(arr)) {
        return undefined;
      }
      nextValue = getArrayElement(arr, index);
    } else {
      // Handle object property
      nextValue = current[key];
    }

    if (nextValue === undefined) {
      return undefined;
    }

    // Handle remaining path
    if (rest || remainingPath) {
      const nextPath = (rest ? rest : '') + (remainingPath ? '.' + remainingPath : '');
      return nextPath.startsWith('.')
        ? getValueRecursive(nextValue, nextPath.slice(1))
        : getValueRecursive(nextValue, nextPath);
    }

    return nextValue;
  };

  // Split path and start recursive process
  const [firstKey, ...restKeys] = path.split('.');
  return getValueRecursive(obj, firstKey, restKeys.join('.')) as NestedValue<T, P>;
};

export default getNestedValue;
