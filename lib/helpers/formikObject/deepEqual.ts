/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Performs a deep equality comparison between two values.
 * Handles objects, arrays, primitives, dates, and null/undefined.
 * More efficient than JSON.stringify for comparing objects.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if the values are deeply equal, false otherwise
 *
 * @example
 * ```typescript
 * deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }) // true
 * deepEqual([1, 2, 3], [1, 2, 3]) // true
 * deepEqual({ a: 1 }, { a: 1, b: 2 }) // false
 * ```
 */
function deepEqual(a: any, b: any, visitedA = new WeakSet(), visitedB = new WeakSet()): boolean {
  // Same reference or both null/undefined
  if (a === b) return true;

  // One is null/undefined, the other is not
  if (a == null || b == null) return false;

  // Different types
  if (typeof a !== typeof b) return false;

  // Primitives (string, number, boolean, symbol, bigint)
  if (typeof a !== "object") return false;

  // Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], visitedA, visitedB)) return false;
    }
    return true;
  }

  // Regular objects
  if (typeof a === "object" && typeof b === "object") {
    // Check for circular references
    if (visitedA.has(a) || visitedB.has(b)) return true;

    // Add to visited sets
    visitedA.add(a);
    visitedB.add(b);

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key], visitedA, visitedB)) return false;
    }

    return true;
  }

  return false;
}

export default deepEqual;
