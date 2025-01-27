/* eslint-disable @typescript-eslint/no-explicit-any */
import useFormik from "@/composables/useFormik";

interface FormikHelpers<T> {
  reset: () => void;
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  setValues: (values: T) => void;
  setSubmitting: (value: boolean) => void;
}

type ValidationRule<T = any> = (
  value: any,
  values: T,
) =>
  | string
  | string[][]
  | undefined
  | (string | undefined)[]
  | Record<string, string | undefined>
  | Record<string, string | undefined>[];

// Helper type for nested validation rules
type NestedValidationRules<T> = {
  [K in keyof T]: T[K] extends object
    ? ValidationRule<T> | NestedValidationRules<T[K]>
    : ValidationRule<T>;
};

type ObjectValidationSchema<T> = {
  [K in keyof T | string]:
    | ValidationRule<T>
    | NestedValidationRules<T[K]>
    | ((values: T) => Partial<T>);
};

// Support both function and object validation schemas
type CustomValidationSchema<T> = ObjectValidationSchema<T> | ((values: T) => Partial<T>);

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
