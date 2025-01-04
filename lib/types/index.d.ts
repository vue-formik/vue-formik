export interface FormikHelpers<T> {
  reset: () => void;
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  setValues: (values: T) => void;
  setSubmitting: (value: boolean) => void;
}

type ValidationRule<T> = (
  value: T,
) => string | undefined | (string | undefined)[] | Record<string, string | undefined>;
