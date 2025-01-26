/* eslint-disable @typescript-eslint/no-explicit-any */
import useFormik from "@/composables/useFormik";

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

type FormikOnSubmit<T> = (values: T, helpers: FormikHelpers<T>) => void;

interface AnyFormValues {
  [key: string]: unknown;
}
type Formik = ReturnType<typeof useFormik<AnyFormValues>>;

type IResetOptions<T> = {
  values?: Partial<T>;
  keepTouched?: boolean;
}
