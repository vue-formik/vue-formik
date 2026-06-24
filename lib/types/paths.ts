/**
 * Dot- and bracket-notation key paths for an object type.
 * Used by the dot-based validation schema. For extracting the value type at a
 * path, see the NestedPaths/NestedValue types in ./nestedPath.
 */
export type DotNotationKeys<T> = {
  [K in keyof T & string]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? `${K}[${number}]` | `${K}[${number}].${DotNotationKeys<U>}`
      : `${K}` | `${K}.${DotNotationKeys<T[K]>}`
    : `${K}`;
}[keyof T & string];

/**
 * Dot-notation paths for an object type, including paths into nested objects.
 */
export type Paths<T> = T extends object
  ? { [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}` }[keyof T]
  : never;
