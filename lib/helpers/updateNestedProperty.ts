/* eslint-disable @typescript-eslint/no-explicit-any */
type PropertyPath<T> = keyof T | `${keyof T & string}.${string}` | `${keyof T & string}[${number}]${string}`;

/**
 * Updates a nested property in an object using a dot notation path with array support
 * @template T - The type of the object being updated
 * @template V - The type of the value being set
 * @param {T} obj - The object to update
 * @param {PropertyPath<T>} path - The path to the property (e.g., "user.address.street" or "items[0].name")
 * @param {V} value - The value to set
 * @returns {T} - The updated object
 * @throws {Error} - If the path is invalid or the object is null/undefined
 */
const updateNestedProperty = <T extends Record<string, any>, V>(
  obj: T,
  path: PropertyPath<T>,
  value: V
): T => {
  // Input validation
  if (obj == null) {
    throw new Error('Object cannot be null or undefined');
  }

  if (!path) {
    throw new Error('Path cannot be empty');
  }

  // Cache frequently used regex
  const arrayPattern = /^(.*?)\[(\d+)](.*)$/;

  // Helper function to handle single key updates
  const updateSingleKey = (target: any, key: string, val: any): void => {
    target[key] = val;
  };

  // Helper function to ensure array initialization
  const ensureArray = (target: any, key: string, index: number): void => {
    if (!Array.isArray(target[key])) {
      target[key] = [];
    }
    // Extend array if needed
    while (target[key].length <= index) {
      target[key].push({});
    }
  };

  // Helper function for recursive updates
  const updateRecursive = (
    current: any,
    pathSegment: string,
    remainingPath: string,
    finalValue: V
  ): void => {
    const arrayMatch = pathSegment.match(arrayPattern);

    if (arrayMatch) {
      // Handle array access
      const [, key, indexStr, rest] = arrayMatch;
      const index = parseInt(indexStr, 10);

      if (!key) {
        throw new Error(`Invalid array path: ${pathSegment}`);
      }

      ensureArray(current, key, index);

      if (rest || remainingPath) {
        // More nested paths to process
        const nextPath = (rest + (remainingPath ? '.' + remainingPath : '')).replace(/^\./, '');
        if (!current[key][index]) {
          current[key][index] = {};
        }
        updateRecursive(current[key][index], nextPath.split('.')[0], nextPath.split('.').slice(1).join('.'), finalValue);
      } else {
        // Direct array update
        current[key][index] = finalValue;
      }
    } else {
      // Handle object property
      if (remainingPath) {
        // More nested paths to process
        if (!(pathSegment in current)) {
          current[pathSegment] = {};
        }
        updateRecursive(current[pathSegment], remainingPath.split('.')[0], remainingPath.split('.').slice(1).join('.'), finalValue);
      } else {
        // Direct property update
        updateSingleKey(current, pathSegment, finalValue);
      }
    }
  };

  // Start the recursive update process
  const [firstKey, ...restKeys] = path.toString().split('.');
  updateRecursive(obj, firstKey, restKeys.join('.'), value);

  return obj;
};

export default updateNestedProperty;
