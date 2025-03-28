/* eslint-disable @typescript-eslint/no-explicit-any */

type NestedPaths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends (infer U)[]
          ?
              | `${K}`
              | `${K}[${number}]`
              | `${K}[${number}]${NestedArrayPaths<U>}`
              | `${K}.${NestedPaths<T[K]>}`
          : `${K}` | `${K}.${NestedPaths<T[K]>}`
        : never;
    }[keyof T]
  : never;

type NestedArrayPaths<U> = U extends (infer V)[]
  ? `[${number}]` | `[${number}]${NestedArrayPaths<V>}`
  : U extends object
    ? `[${number}].${NestedPaths<U>}`
    : never;

type NestedValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}[${infer I}]${infer Rest}`
    ? K extends keyof T
      ? T[K] extends (infer U)[] | undefined
        ? I extends `${number}`
          ? NestedValue<Exclude<U, undefined>, Rest extends `.${infer R}` ? R : Rest>
          : never
        : never
      : K extends ""
        ? T extends (infer U)[] | undefined
          ? I extends `${number}`
            ? NestedValue<Exclude<U, undefined>, Rest extends `.${infer R}` ? R : Rest>
            : never
          : never
        : never
    : P extends `${infer K}.${infer Rest}`
      ? K extends keyof T
        ? NestedValue<T[K], Rest>
        : T extends Record<string, any>
          ? any
          : never
      : any;
