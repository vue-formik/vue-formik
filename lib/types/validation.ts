import type { AllowedAny, MaybePromise } from "./common";
import type { DotNotationKeys } from "./paths";

export type ValidationResult<T = AllowedAny> =
  | string
  | undefined
  | string[]
  | undefined[]
  | { [K in keyof T]?: ValidationResult<T[K]> }
  | (T extends Array<AllowedAny> ? Array<ValidationResult<T[number]>> : never);

export type ValidationRule<TValue = AllowedAny, TForm = AllowedAny> = (
  value: TValue,
  values: TForm,
) => MaybePromise<ValidationResult<TValue>>;

export type InputValidationRule<TValue = AllowedAny, TForm = AllowedAny> = (
  value: TValue,
  values?: TForm,
) => MaybePromise<ValidationResult<TValue>>;

export type NestedValidationRules<T> = {
  [K in keyof T]: T[K] extends object
    ? ValidationRule<T[K], T> | NestedValidationRules<T[K]>
    : ValidationRule<T[K], T>;
};

export type ObjectValidationSchema<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? ValidationRule<T[K], T> | NestedValidationRules<U>
    : T[K] extends object
      ? ValidationRule<T[K], T> | NestedValidationRules<T[K]>
      : ValidationRule<T[K], T>;
};

export type DotBasedValidationSchema<T> = Partial<{
  [key in Exclude<DotNotationKeys<T>, keyof T>]: ValidationRule<AllowedAny, T>;
}>;

export type CustomValidationSchema<T> =
  | ObjectValidationSchema<T>
  | ((values: T) => MaybePromise<Partial<Record<keyof T, string | Record<string, string>>>>)
  | DotBasedValidationSchema<T>;
