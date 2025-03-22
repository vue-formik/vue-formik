/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type AllowedAny = any;

import useFormik from "@/composables/useFormik";

interface FormikHelpers<T> {
  reset: () => void;
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  setValues: (values: T) => void;
  setSubmitting: (value: boolean) => void;
}

type ValidationResult<T = AllowedAny> =
  | string
  | undefined
  | string[]
  | undefined[]
  | { [K in keyof T]?: ValidationResult<T[K]> }
  | (T extends Array<AllowedAny> ? Array<ValidationResult<T[number]>> : never);

type ValidationRule<TValue = AllowedAny, TForm = AllowedAny> = (
  value: TValue,
  values: TForm,
) => ValidationResult<TValue>;

type InputValidationRule<TValue = AllowedAny, TForm = AllowedAny> = (
  value: TValue,
  values?: TForm,
) => ValidationResult<TValue>;

type NestedValidationRules<T> = {
  [K in keyof T]: T[K] extends object
    ? ValidationRule<T[K], T> | NestedValidationRules<T[K]>
    : ValidationRule<T[K], T>;
};

type ObjectValidationSchema<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? ValidationRule<T[K], T> | NestedValidationRules<U>
    : T[K] extends object
      ? ValidationRule<T[K], T> | NestedValidationRules<T[K]>
      : ValidationRule<T[K], T>;
};

type DotNotationKeys<T> = {
  [K in keyof T & string]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? `${K}[${number}]` | `${K}[${number}].${DotNotationKeys<U>}`
      : `${K}` | `${K}.${DotNotationKeys<T[K]>}`
    : `${K}`;
}[keyof T & string];

type DotBasedValidationSchema<T> = Partial<{
  [key in Exclude<DotNotationKeys<T>, keyof T>]: ValidationRule<AllowedAny, T>;
}>;

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

type Paths<T> = T extends object
  ? { [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${Paths<T[K]>}`}` }[keyof T]
  : never;

export type {
  AllowedAny,
  FormikHelpers,
  ValidationRule,
  ValidationResult,
  NestedValidationRules,
  CustomValidationSchema,
  FormikOnSubmit,
  AnyFormValues,
  Formik,
  IResetOptions,
  InputValidationRule,
  DotNotationKeys,
  Paths,
};
