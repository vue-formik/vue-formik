/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectSchema } from "yup";

interface FormikHelpers<T> {
  reset: () => void;
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  setValues: (values: T) => void;
  setSubmitting: (value: boolean) => void;
}

type ValidationRule = (
  value: any,
) =>
  | string
  | undefined
  | (string | undefined)[]
  | Record<string, string | undefined>
  | Record<string, string | undefined>[];

type CustomValidationSchema<T> = Partial<Record<keyof T, ValidationRule>>;

type FormikValidationSchema<T> = ObjectSchema<T> | CustomValidationSchema<T>;

type FormikOnSubmit<T> = (values: T, helpers: FormikHelpers<T>) => void;
