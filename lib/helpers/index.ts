const updateNestedProperty = <T extends Record<string, unknown>>(
  object: T,
  path: string,
  value: unknown,
): void => {
  const keys = path.split(".");
  keys.reduce(
    (acc: Record<string, unknown>, key, index) => {
      if (index === keys.length - 1) {
        acc[key] = value;
      } else {
        if (!acc[key] || typeof acc[key] !== "object") {
          acc[key] = {};
        }
        return acc[key] as Record<string, unknown>;
      }
      return acc;
    },
    object as Record<string, unknown>,
  );
};

const getNestedValue = <T, R = unknown>(obj: T, path: string): R | undefined => {
  return path.split(".").reduce((o, key) => {
    if (o && typeof o === "object" && key in o) {
      return (o as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown) as R | undefined;
};

function clearReactiveObject<T>(obj: T): void {
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
