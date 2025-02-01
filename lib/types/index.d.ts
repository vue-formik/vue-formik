/* eslint-disable @typescript-eslint/no-explicit-any */
import useFormik from "@/composables/useFormik";

interface FormikHelpers<T> {
  reset: () => void;
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  setValues: (values: T) => void;
  setSubmitting: (value: boolean) => void;
}

// Basic validation error types
type ValidationResult<T = any> =
  | string
  | undefined
  | string[]
  | undefined[]
  | { [K in keyof T]?: ValidationResult<T[K]> }
  | (T extends Array<any> ? Array<ValidationResult<T[number]>> : never);

// Enhanced validation rule with automatic type inference
type ValidationRule<TValue = any, TForm = any> = (
  value: TValue,
  values: TForm
) => ValidationResult<TValue>;

// Helper type for nested validation rules with proper type inference
type NestedValidationRules<T> = {
  [K in keyof T]: T[K] extends object
    ? ValidationRule<T[K], T> | NestedValidationRules<T[K]>
    : ValidationRule<T[K], T>;
};

// Enhanced object validation schema with proper type inference
type ObjectValidationSchema<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? ValidationRule<T[K], T> | NestedValidationRules<U>
    : T[K] extends object
      ? ValidationRule<T[K], T> | NestedValidationRules<T[K]>
      : ValidationRule<T[K], T>;
};

// Recursive type to infer dot-based keys
type DotNotationKeys<T> = {
  [K in keyof T & string]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? `${K}[${number}]` | `${K}[${number}].${DotNotationKeys<U>}`
      : `${K}` | `${K}.${DotNotationKeys<T[K]>}`
    : `${K}`;
}[keyof T & string];

type DotBasedValidationSchema<T> = Partial<{
  [key in Exclude<DotNotationKeys<T>, keyof T>]: ValidationRule<any, T>;
}>;

// Support both function and object validation schemas
type CustomValidationSchema<T> =
  | ObjectValidationSchema<T>
  | ((values: T) => Partial<Record<keyof T, string | Record<string, string>>>)
  | DotBasedValidationSchema<T>;

type FormikOnSubmit<T> = (values: T, helpers: FormikHelpers<T>) => void;

interface AnyFormValues {
  [key: string]: unknown;
}
type Formik = ReturnType<typeof useFormik<AnyFormValues>>;

type IResetOptions<T> = {
  values?: Partial<T>;
  keepTouched?: boolean;
};

export type {
  FormikHelpers,
  ValidationRule,
  NestedValidationRules,
  CustomValidationSchema,
  FormikOnSubmit,
  AnyFormValues,
  Formik,
  IResetOptions,
};
