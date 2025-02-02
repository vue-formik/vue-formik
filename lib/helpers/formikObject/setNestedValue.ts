/* eslint-disable @typescript-eslint/no-explicit-any */
import parseSegment from "@/helpers/formikObject/parseSegment";

function setNestedValue<T extends object, P extends string>(
  obj: T,
  path: P,
  value: NestedValue<T, P>,
): T;

function setNestedValue<T extends object>(obj: T, path: string, value: NestedValue<T, string>): T;

function setNestedValue<T extends object, P extends NestedPaths<T>>(
  obj: T,
  path: P,
  value: NestedValue<T, P>,
): T;

function setNestedValue<T extends object>(obj: T, path: string, value: any): T {
  if (obj == null) {
    console.error("Cannot update null/undefined object");
    return obj;
  }
  if (typeof obj !== "object") {
    console.error("Target must be an object");
    return obj;
  }
  if (!path) {
    console.error("Path cannot be empty");
    return obj;
  }

  const segments = path.split(".");
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
      const hasMoreSegments = i < segments.length - 1;
      const hasMoreIndices = j < indices.length - 1;
      const needsObject = hasMoreSegments || hasMoreIndices;

      if (!Array.isArray(parent[targetKey])) {
        parent[targetKey] = [];
      }

      const arr = [...parent[targetKey]];
      if (idx >= arr.length) {
        const fillValue = needsObject ? {} : undefined;
        const newElements = Array(idx - arr.length + 1).fill(fillValue);
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
      } else if (typeof parent[targetKey] !== "object") {
        parent[targetKey] = nextNeedsArray ? [] : {};
      }

      parent[targetKey] = Array.isArray(parent[targetKey])
        ? [...parent[targetKey]]
        : { ...parent[targetKey] };
      current = parent[targetKey];
    } else {
      parent[targetKey] = value;
    }
  }

  Object.assign(obj, clone);

  return clone as T;
}

export default setNestedValue;
