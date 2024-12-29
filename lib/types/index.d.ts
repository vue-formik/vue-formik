export interface FormikHelpers<T> {
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  reset: () => void;
  setValues: (values: T) => void;
}

export interface ValidationRule<T> {
  (value: T): string | undefined;
}
