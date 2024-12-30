// Utility function to update nested properties
const updateNestedProperty = (
  object: Record<string, unknown>,
  path: string,
  value: unknown,
): void => {
  const keys = path.split(".");
  keys.reduce<Record<string, unknown>>((acc, key, index) => {
    if (index === keys.length - 1) {
      (acc as Record<string, unknown>)[key] = value;
    } else {
      if (!(acc as Record<string, unknown>)[key]) {
        (acc as Record<string, unknown>)[key] = {};
      }
      return (acc as Record<string, unknown>)[key] as Record<string, unknown>;
    }
    return acc;
  }, object);
};

// eslint-disable-next-line
const getNestedValue = (obj: Record<string, any>, path: string) => {
  return path.split(".").reduce((o, key) => (o ? o[key] : undefined), obj);
};

// eslint-disable-next-line
function clearReactiveObject(obj: Record<string, any>): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value && typeof value === "object") {
        clearReactiveObject(value); // Recursively clear nested objects
      }
      delete obj[key]; // Delete the property
    }
  }
}

export { updateNestedProperty, getNestedValue, clearReactiveObject };
