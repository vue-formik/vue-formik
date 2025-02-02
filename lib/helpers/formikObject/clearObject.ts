/* eslint-disable @typescript-eslint/no-explicit-any */
function clearObject<T extends object>(
  obj: T,
  options: {
    preservePrototype?: boolean;
    deep?: boolean;
    preserveEmpty?: boolean;
    exclude?: Set<string>;
  } = {},
): void {
  if (!obj || typeof obj !== "object") return;

  const {
    preservePrototype = true,
    deep = true,
    preserveEmpty = false,
    exclude = new Set(),
  } = options;

  if (
    obj instanceof Map ||
    obj instanceof Set ||
    obj instanceof WeakMap ||
    obj instanceof WeakSet ||
    isNode(obj) ||
    isVueReactive(obj)
  ) {
    handleSpecialObject(obj);
    return;
  }

  const shouldExclude = (path: string): boolean => exclude.has(path);

  function isNode(value: any): boolean {
    return (
      typeof window !== "undefined" && value && typeof value === "object" && "nodeType" in value
    );
  }

  function isVueReactive(value: any): boolean {
    return !!value && ("__v_isRef" in value || "__v_isReactive" in value);
  }

  function isPreservedType(value: any): boolean {
    return (
      value instanceof Map ||
      value instanceof Set ||
      value instanceof WeakMap ||
      value instanceof WeakSet ||
      isNode(value) ||
      isVueReactive(value)
    );
  }

  const clearProperties = (
    target: any,
    parentPath = "",
    visited: WeakSet<object> = new WeakSet(),
  ): void => {
    if (!target || typeof target !== "object" || visited.has(target)) return;
    visited.add(target);

    if (Object.isFrozen(target)) return;

    const prototype = Object.getPrototypeOf(target);

    const properties = [
      ...Object.getOwnPropertyNames(target),
      ...Object.getOwnPropertySymbols(target),
    ];

    for (const prop of properties) {
      const currentPath = parentPath ? `${parentPath}.${String(prop)}` : String(prop);
      if (shouldExclude(currentPath)) continue;

      const descriptor = Object.getOwnPropertyDescriptor(target, prop);
      if (!descriptor?.configurable) continue;

      const value = target[prop];
      if (value && typeof value === "object") {
        if (isPreservedType(value)) {
          handleSpecialObject(value);
          continue;
        }

        if (value === target) {
          delete target[prop];
          continue;
        }

        if (Array.isArray(value)) {
          if (preserveEmpty) {
            value.length = 0;
          } else {
            delete target[prop];
          }
          continue;
        }

        if (deep) {
          clearProperties(value, currentPath, visited);
          if (!preserveEmpty && Object.keys(value).length === 0) {
            delete target[prop];
          }
        }
        continue;
      }

      try {
        delete target[prop];
      } catch (e) {
        console.warn(`Could not delete property ${String(prop)}:`, e);
      }
    }

    // Restore prototype if preservePrototype is true
    if (preservePrototype) {
      Object.setPrototypeOf(target, prototype);
    }
  };

  try {
    clearProperties(obj);
  } catch (e) {
    console.warn("Error during object clearing:", e);
  }
}

const specialHandlers = {
  Map: (obj: Map<any, any>) => obj.clear(),
  Set: (obj: Set<any>) => obj.clear(),
} as const;

function handleSpecialObject(obj: any): void {
  const handler = specialHandlers[obj.constructor.name as keyof typeof specialHandlers];
  handler?.(obj);
}

export default clearObject;
