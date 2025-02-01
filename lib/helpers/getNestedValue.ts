/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Type to generate all possible nested paths in an object, including arrays.
 */
type NestedPaths<T> = T extends object
  ? {
    [K in keyof T]: K extends string
      ? T[K] extends (infer U)[]
        ?
        | `${K}`
        | `${K}[${number}]`
        | `${K}[${number}]${NestedArrayPaths<U>}`
        | `${K}.${NestedPaths<T[K]>}`
        :
        | `${K}`
        | `${K}.${NestedPaths<T[K]>}`
      : never;
  }[keyof T]
  : never;

type NestedArrayPaths<U> = U extends (infer V)[]
  ? `[${number}]` | `[${number}]${NestedArrayPaths<V>}`
  : U extends object
    ? `[${number}].${NestedPaths<U>}`
    : never;

/**
 * Type to extract the nested value type given a path.
 */
type NestedValue<T, P extends string> =
  P extends keyof T
    ? T[P]
    : P extends `${infer K}[${infer I}]${infer Rest}`
      ? K extends keyof T
        ? T[K] extends (infer U)[]
          ? I extends `${number}`
            ? NestedValue<U, Rest extends `.${infer R}` ? R : Rest>
            : undefined
          : undefined
        : K extends ''
          ? T extends (infer U)[]
            ? I extends `${number}`
              ? NestedValue<U, Rest extends `.${infer R}` ? R : Rest>
              : undefined
            : undefined
          : undefined
      : P extends `${infer K}.${infer Rest}`
        ? K extends keyof T
          ? NestedValue<T[K], Rest>
          : undefined
        : undefined;

/**
 * Safely retrieves a nested value from an object using a dot-notation path with array indices.
 * @param obj The object to traverse.
 * @param path The path to the value (e.g., "a[0].b.c[1]").
 * @returns The value at the path or undefined if not found.
 */
const getNestedValue = <T extends object, P extends NestedPaths<T>>(
  obj: T,
  path: P,
): NestedValue<T, P> | undefined => {
  if (obj == null || typeof obj !== 'object') return undefined;

  let current: any = obj;
  const segments = path.split('.');

  for (const segment of segments) {
    const parsed = parseSegment(segment);
    if (!parsed.key) return undefined;

    current = current[parsed.key];
    if (current == null) return undefined;

    for (const index of parsed.indices) {
      if (!Array.isArray(current) || index < 0 || index >= current.length) return undefined;
      current = current[index];
      if (current == null) return undefined;
    }
  }

  return current as NestedValue<T, P>;
};

/**
 * Parses a path segment into its key and array indices.
 */
const parseSegment = (segment: string): { key: string; indices: number[] } => {
  const parts = segment.split(/[[\]]/g).filter(Boolean);
  if (!parts.length) return { key: '', indices: [] };

  const key = parts[0];
  const indices = parts.slice(1).map(p => {
    const index = parseInt(p, 10);
    return isNaN(index) ? -1 : index;
  });

  if (indices.some(i => i < 0)) return { key: '', indices: [] };
  return { key, indices };
};

export default getNestedValue;
