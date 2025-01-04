/* eslint-disable @typescript-eslint/no-explicit-any */
const getNestedValue = <T extends object>(obj: T, path: string) => {
  if (!obj || typeof obj !== "object") return undefined;

  if (path in obj) {
    return obj[path as keyof T];
  }

  const keys = path.split('.'); // Split the path into keys

  if (keys.length === 1) {
    if (/^.*\[\d+]$/.test(keys[0])) {
      const [key, index] = keys[0].split("[");
      const i = parseInt(index.replace("]", ""), 10);
      const element = obj[key as keyof T];
      if (Array.isArray(element)) {
        return element[i];
      } else {
        return undefined;
      }
    }
    return obj[keys[0] as keyof T];
  }

  return getNestedValue(obj[keys[0] as keyof T] as T, keys.slice(1).join('.')); // Recursively get the nested value
};

const updateNestedProperty = <T extends Record<string, any>>(
  obj: T,
  path: string,
  value: any,
): void => {
  if (!obj || typeof obj !== "object") {
    obj = {} as T;
    obj[path as keyof T] = value;
    return;
  }

  if (path in obj) {
    // update object here
    obj[path as keyof T] = value;
    return;
  }

  const keys = path.split('.');

  if (keys.length === 1) {
    if (/^.*\[\d+]$/.test(keys[0])) {
      const [key, index] = keys[0].split("[");
      if (!Array.isArray(obj[key as keyof T])) {
        obj[key as keyof T] = [];
      }
      const i = parseInt(index.replace("]", ""), 10);

      obj[key as keyof T][i] = value;
      return;
    }
    obj[keys[0] as keyof T] = value;
    return;
  }
  // Split the path into keys
  return updateNestedProperty(getNestedValue(obj, keys[0]), keys.slice(1).join('.'), value); // Recursively get the nested value
};

function clearReactiveObject<T extends object>(obj: T): void {
  if (typeof obj !== "object" || obj === null) {
    return; // Skip non-object or null values
  }

  // Skip unsupported types like Map, Set, WeakMap, WeakSet
  if (
    obj instanceof Map ||
    obj instanceof WeakMap ||
    obj instanceof Set ||
    obj instanceof WeakSet
  ) {
    return;
  }

  // Check for Vue's reactive types and unwrap them if needed
  if ("__v_isRef" in obj || "__v_isReactive" in obj) {
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key as keyof T];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        clearReactiveObject(value); // Recursively clear nested objects
      }
      delete obj[key as keyof T]; // Delete the property
    }
  }
}

export { updateNestedProperty, getNestedValue, clearReactiveObject };
