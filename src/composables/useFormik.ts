import { computed, reactive, toRaw, watch } from 'vue'

interface FormikHelpers<T> {
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  reset: () => void;
  setValues: (values: T) => void;
}

interface ValidationRule<T> {
  (value: T): string | undefined;
}

interface IUseFormik<T> {
  initialValues: T;
  validationSchema: Record<keyof T, ValidationRule<T[keyof T]> | Record<string, ValidationRule<unknown>>>;
  onSubmit: (values: T, helpers: FormikHelpers<T>) => void;
}

// Utility function to update nested properties
const updateNestedProperty = (
  object: Record<string, unknown>,
  path: string,
  value: unknown
): void => {
  const keys = path.split('.');
  keys.reduce<Record<string, unknown>>((acc, key, index) => {
    if (index === keys.length - 1) {
      (acc as Record<string, unknown>)[key] = value;
    } else {
      if (!(acc as Record<string, unknown>)[key]) {
        (acc as Record<string, unknown>)[key] = {};
      }
      return (acc as Record<string, unknown>)[key] as Record<string, unknown>;
    }
    return acc;
  }, object);
};

// Validation function
const validate = <T>(
  values: T,
  schema: IUseFormik<T>['validationSchema']
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {}; // Clear errors before starting validation

  for (const key in schema) {
    const value = values[key as keyof T];
    const rule = schema[key as keyof T] as ValidationRule<T[keyof T]>;

    if (typeof rule === 'function') {
      const error = rule(value);
      if (error) {
        errors[key as keyof T] = error;
      }
    }
  }

  return errors; // Only return the new validation results
};

const useFormik = <T extends object>({
  initialValues,
  validationSchema,
  onSubmit,
}: IUseFormik<T>) => {
  const values = reactive(initialValues);
  const errors = reactive(validate(initialValues, validationSchema));
  const touched = reactive({} as Partial<Record<keyof T, boolean | Record<string, boolean>>>);

  const setValues = (newValues: T) => {
    Object.assign(values, newValues); // Safely copy values into reactive object
    Object.assign(errors, validate(newValues, validationSchema)); // Validate updated values
  };

  const setErrors = (newErrors: T) => {
    Object.assign(errors, newErrors);
  };

  const reset = () => {
    Object.assign(values, initialValues);
    Object.assign(errors, validate(initialValues, validationSchema));
  };

  const setFieldValue = (field: string, value: unknown) => {
    updateNestedProperty(values as Record<string, unknown>, field, value);
  };

  const setFieldTouched = (field: string, touchedValue: boolean) => {
    updateNestedProperty(touched as Record<string, unknown>, field, touchedValue);
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit(
      toRaw(values) as T,
      {
        setErrors,
        reset,
        setValues,
      } as FormikHelpers<T>
    );
  };

  const handleBlur = (e: FocusEvent) => {
    const fieldName = (e.target as HTMLInputElement).name as keyof T;
    setFieldTouched(fieldName.toString(), true);
  }
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const fieldName = target.name as keyof T;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setFieldValue(fieldName.toString(), value);
  }

  const isValid = computed(() => {
    return Object.keys(errors).length === 0;
  })

  const isDirty = computed(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  })

  watch(
    () => values,
    () => {
      const validationErrors = validate(toRaw(values) as T, validationSchema);
      //@ts-expect-error Object.keys(errors) is not iterable
      Object.keys(errors).forEach((key) => delete errors[key]); // Clear existing errors
      Object.assign(errors, validationErrors); // Assign new errors
    },
    { deep: true }
  );

  return {
    values,
    errors,
    touched,
    setValues,
    reset,
    setFieldValue,
    setFieldTouched,
    handleBlur,
    handleChange,
    handleSubmit,
    isValid,
    isDirty
  };
};

export default useFormik;
