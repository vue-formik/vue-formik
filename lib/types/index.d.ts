/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectSchema as YupSchema } from "yup";
import { ObjectSchema as JoiSchema } from "joi";

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
  | string[][]
  | undefined
  | (string | undefined)[]
  | Record<string, string | undefined>
  | Record<string, string | undefined>[];

type CustomValidationSchema<T> = Partial<Record<keyof T | string, ValidationRule>>;

type FormikValidationSchema<T> = YupSchema<T> | JoiSchema<T> | CustomValidationSchema<T>;

type FormikOnSubmit<T> = (values: T, helpers: FormikHelpers<T>) => void;

type FormikMode = "YUP" | "JOI" | "JOD" | "CUSTOM";
