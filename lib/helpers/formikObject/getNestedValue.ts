import parseSegment from "@/helpers/formikObject/parseSegment";

/**
 * Safely retrieves a nested value from an object using a dot-notation path with array indices.
 * @param obj The object to traverse.
 * @param path The path to the value (e.g., "a[0].b.c[1]").
 * @returns The value at the path or undefined if not found.
 */
function getNestedValue <T extends object, P extends NestedPaths<T>>(
  obj: T,
  path: P,
): NestedValue<T, P> | undefined;

function getNestedValue <T extends object, P extends string>(
  obj: T,
  path: P,
): NestedValue<T, P> | P;

function getNestedValue <T extends object>(
  obj: T,
  path: string,
): NestedValue<T, string> | undefined;

function getNestedValue <T extends object, P extends string>(
  obj: T,
  path: P,
): NestedValue<T, P> | undefined {
  if (obj == null || typeof obj !== "object") return undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  const segments = path.split(".");

  for (const segment of segments) {
    let parsed;

    try {
      parsed = parseSegment(segment);
      if (!parsed.key) return undefined;
    } catch {
      return undefined;
    }

    current = current[parsed.key];
    if (current == null) return undefined;

    for (const index of parsed.indices) {
      if (!Array.isArray(current) || index < 0 || index >= current.length) return undefined;
      current = current[index];
      if (current == null) return undefined;
    }
  }

  return current as NestedValue<T, P>;
}

export default getNestedValue;
