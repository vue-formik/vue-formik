export interface FormikHelpers<T> {
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  reset: () => void;
  setValues: (values: T) => void;
}

export interface ValidationRule<T> {
  (value: T): string | undefined;
}

export interface IUseFormik<T> {
  initialValues: T;
  validationSchema: Record<keyof T, ValidationRule<T[keyof T]> | Record<string, ValidationRule<unknown>>>;
  onSubmit: (values: T, helpers: FormikHelpers<T>) => void;
}
