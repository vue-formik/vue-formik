import { ObjectSchema } from "yup";

interface FormikHelpers<T> {
  reset: () => void;
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  setValues: (values: T) => void;
  setSubmitting: (value: boolean) => void;
}

type ValidationRule = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
) =>
  | string
  | undefined
  | (string | undefined)[]
  | Record<string, string | undefined>
  | Record<string, string | undefined>[];

type FormikValidationSchema<T extends object> =
  | ObjectSchema<T>
  | Partial<Record<keyof T, ValidationRule>>;

type FormikOnSubmit<T> = (values: T, helpers: FormikHelpers<T>) => void;
