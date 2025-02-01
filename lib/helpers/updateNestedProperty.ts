/* eslint-disable @typescript-eslint/no-explicit-any */

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

type NestedValue<T, P extends string> =
  P extends keyof T
    ? T[P]
    : P extends `${infer K}[${infer I}]${infer Rest}`
      ? K extends keyof T
        ? T[K] extends (infer U)[]
          ? I extends `${number}`
            ? NestedValue<U, Rest extends `.${infer R}` ? R : Rest>
            : never
          : never
        : K extends ''
          ? T extends (infer U)[]
            ? I extends `${number}`
              ? NestedValue<U, Rest extends `.${infer R}` ? R : Rest>
              : never
            : never
          : never
      : P extends `${infer K}.${infer Rest}`
        ? K extends keyof T
          ? NestedValue<T[K], Rest>
          : never
        : never;

const updateNestedProperty = <T extends object, P extends NestedPaths<T>>(
  obj: T,
  path: P,
  value: NestedValue<T, P>
): T => {
  if (obj == null) throw new Error("Cannot update null/undefined object");
  if (typeof obj !== 'object') throw new Error("Target must be an object");
  if (!path) throw new Error("Path cannot be empty");

  const segments = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let current: any = clone;

  for (let i = 0; i < segments.length; i++) {
    const isLast = i === segments.length - 1;
    const segment = segments[i];
    const { key, indices } = parseSegment(segment);

    if (!key) throw new Error(`Invalid path segment: ${segment}`);

    let parent = current;
    let targetKey: string | number = key;

    for (let j = 0; j < indices.length; j++) {
      const idx = indices[j];
      const isFinalIndex = j === indices.length - 1;
      const hasMoreSegments = i < segments.length - 1;
      const hasMoreIndices = j < indices.length - 1;
      const needsObject = hasMoreSegments || hasMoreIndices;

      if (parent[targetKey] === undefined) {
        parent[targetKey] = [];
      }
      if (!Array.isArray(parent[targetKey])) {
        throw new Error(`Expected array at '${targetKey}'`);
      }

      const arr = [...parent[targetKey]];
      if (idx >= arr.length) {
        const elementsToAdd = idx - arr.length + 1;
        const newElements = Array(elementsToAdd).fill(needsObject ? {} : undefined);
        arr.push(...newElements);
      }

      if (arr[idx] === undefined && needsObject) {
        arr[idx] = {};
      }

      parent[targetKey] = arr;
      parent = arr;
      targetKey = idx;
    }

    if (!isLast) {
      const nextSegment = segments[i + 1];
      const nextNeedsArray = parseSegment(nextSegment).indices.length > 0;

      if (parent[targetKey] === undefined || parent[targetKey] === null) {
        parent[targetKey] = nextNeedsArray ? [] : {};
      } else if (typeof parent[targetKey] !== 'object') {
        parent[targetKey] = nextNeedsArray ? [] : {};
      }

      const nextValue = Array.isArray(parent[targetKey])
        ? [...parent[targetKey]]
        : { ...parent[targetKey] };

      parent[targetKey] = nextValue;
      current = parent[targetKey];
    } else {
      parent[targetKey] = value;
    }
  }

  // update the original object with the new value
  Object.assign(obj, clone);

  return clone as T;
};

const parseSegment = (segment: string): { key: string; indices: number[] } => {
  const parts = segment.split(/[[\]]/g).filter(Boolean);
  if (!parts.length) throw new Error(`Invalid path segment: ${segment}`);

  const key = parts[0];
  const indices = parts.slice(1).map(p => {
    const index = parseInt(p, 10);
    if (isNaN(index)) throw new Error(`Invalid array index: ${p}`);
    if (index < 0) throw new Error(`Negative array index: ${index}`);
    return index;
  });

  return { key, indices };
};

export default updateNestedProperty;
