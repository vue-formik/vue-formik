const updateNestedProperty = <T extends Record<string, unknown>>(
  object: T,
  path: string,
  value: unknown
): void => {
  const keys = path.split(".");
  keys.reduce((acc: Record<string, unknown>, key, index) => {
    if (index === keys.length - 1) {
      acc[key] = value;
    } else {
      if (!acc[key] || typeof acc[key] !== "object") {
        acc[key] = {};
      }
      return acc[key] as Record<string, unknown>;
    }
    return acc;
  }, object as Record<string, unknown>);
};

const getNestedValue = <T, R = unknown>(
  obj: T,
  path: string
): R | undefined => {
  return path.split(".").reduce((o, key) => {
    if (o && typeof o === "object" && key in o) {
      return (o as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown) as R | undefined;
};

function clearReactiveObject<T extends Record<string, unknown>>(obj: T): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        clearReactiveObject(value as Record<string, unknown>); // Recursively clear nested objects
      }
      delete obj[key]; // Delete the property
    }
  }
}

export { updateNestedProperty, getNestedValue, clearReactiveObject };
