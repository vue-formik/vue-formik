/**
 * Efficiently clears all properties from an object, handling Vue reactive objects and collections
 * @template T - Type of the object being cleared
 * @param {T} obj - The object to clear
 * @returns {void}
 */
function clearReactiveObject<T extends object>(obj: T): void {
  // Skip non-objects, null, and collections
  if (
    obj === null ||
    typeof obj !== 'object' ||
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof WeakMap ||
    obj instanceof WeakSet
  ) {
    return;
  }

  // Skip Vue reactive wrappers
  if ('__v_isRef' in obj || '__v_isReactive' in obj) {
    return;
  }

  // Use Object.keys for better performance than for...in
  Object.keys(obj).forEach(key => {
    const value = obj[key as keyof T];

    // Recursively clear nested plain objects (not arrays)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      clearReactiveObject(value);
    }

    // Use delete operator for properties
    delete obj[key as keyof T];
  });
}

export default clearReactiveObject;
