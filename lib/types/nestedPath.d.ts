/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generates all valid dot-notation paths for an object type, supporting nested properties and array indices.
 *
 * @template T - The object type to generate paths for
 *
 * @example
 * ```typescript
 * type User = {
 *   name: string;
 *   address: { city: string; zip: number };
 *   tags: string[];
 *   contacts: { email: string; phones: string[] }[];
 * };
 *
 * type UserPaths = NestedPaths<User>;
 * // "name" | "address" | "address.city" | "address.zip" | "tags" | "tags[number]" |
 * // "contacts" | "contacts[number]" | "contacts[number].email" | "contacts[number].phones[number]"
 * ```
 */
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

/**
 * Generates bracket-notation paths for array elements, supporting nested arrays and object properties.
 * Used internally by NestedPaths to handle array indexing patterns.
 *
 * @template U - The array element type
 *
 * @example
 * ```typescript
 * type Phones = string[];
 * type PhonesArrayPaths = NestedArrayPaths<Phones>;
 * // `[${number}]`
 *
 * type Contacts = { email: string; phones: string[] }[];
 * type ContactsArrayPaths = NestedArrayPaths<Contacts>;
 * // `[${number}]` | `[${number}].${"email" | "phones" | "phones[number]"}`
 *
 * type Matrix = number[][];
 * type MatrixArrayPaths = NestedArrayPaths<Matrix>;
 * // `[${number}]` | `[${number}][${number}]`
 * ```
 */
type NestedArrayPaths<U> = U extends (infer V)[]
  ? `[${number}]` | `[${number}]${NestedArrayPaths<V>}`
  : U extends object
    ? `[${number}].${NestedPaths<U>}`
    : never;

/**
 * Extracts the value type at a given path within an object type.
 *
 * @template T - The object type to extract from
 * @template P - The path string (must be a valid NestedPaths<T>)
 *
 * @example
 * ```typescript
 * type User = {
 *   name: string;
 *   address: { city: string; zip: number };
 *   tags: string[];
 *   contacts: { email: string; phones: string[] }[];
 * };
 *
 * type Name = NestedValue<User, "name">;              // string
 * type City = NestedValue<User, "address.city">;      // string
 * type Zip = NestedValue<User, "address.zip">;        // number
 * type Tag = NestedValue<User, "tags[0]">;            // string
 * type Email = NestedValue<User, "contacts[0].email">; // string
 * type Phone = NestedValue<User, "contacts[0].phones[1]">; // string
 * ```
 */
type NestedValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}[${infer I}]${infer Rest}`
    ? K extends keyof T
      ? T[K] extends (infer U)[] | undefined
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
