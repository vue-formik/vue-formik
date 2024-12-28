import { computed, reactive, toRaw, watch } from 'vue'
import { ObjectSchema } from 'yup'
import type { FormikHelpers, IUseFormik, ValidationRule } from '@/types'
import { getNestedValue, updateNestedProperty } from '@/helpers'

const useFormik = <T extends object>({
  initialValues,
  validationSchema,
  onSubmit,
}: IUseFormik<T>) => {
  const validate = (values: T): Partial<Record<keyof T, string>> => {
    const validationErrors: Partial<Record<keyof T, string>> = {};

    if (validationSchema instanceof ObjectSchema) {
      try {
        const vSchema = validationSchema as ObjectSchema<T>;
        vSchema.validateSync(values, { abortEarly: false });
      } catch (e) {
        const err = e as never as { inner: { path: string; message: string }[] };
        if (typeof err === "object" && Array.isArray(err?.inner)) {
          err.inner.forEach((error) => {
            validationErrors[error.path as keyof T] = error.message;
          });
        }
      }
    } else {
      for (const key in validationSchema) {
        const value = values[key as keyof T];
        const rule = validationSchema[key as keyof T] as ValidationRule<T[keyof T]>;

        if (typeof rule === 'function') {
          const error = rule(value);
          if (error) {
            validationErrors[key as keyof T] = error;
          }
        }
      }
    }

    return validationErrors;
  };

  const values = reactive(initialValues);
  const errors = reactive(validate(initialValues));
  const touched = reactive({} as Partial<Record<keyof T, boolean | Record<string, boolean>>>);

  const setValues = (newValues: T) => {
    Object.assign(values, newValues); // Safely copy values into reactive object
    Object.assign(errors, validate(newValues)); // Validate updated values
  };

  const setErrors = (newErrors: T) => {
    Object.assign(errors, newErrors);
  };

  const reset = () => {
    Object.assign(values, initialValues);
    Object.assign(errors, validate(initialValues));
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
      const validationErrors = validate(toRaw(values) as T);
      //@ts-expect-error Object.keys(errors) is not iterable
      Object.keys(errors).forEach((key) => delete errors[key]); // Clear existing errors
      Object.assign(errors, validationErrors); // Assign new errors
    },
    { deep: true }
  );


  const hasFieldError = (field: string) => {
    const errorValue = getNestedValue(errors, field);
    const touchedValue = getNestedValue(touched, field);
    return (errorValue !== undefined && !!touchedValue);
  }

  const getFieldError = (field: string) => {
    if (hasFieldError(field)) {
      return errors[field as keyof typeof errors];
    } else {
      return '';
    }
  }

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
    hasFieldError,
    getFieldError,
    isValid,
    isDirty
  };
};

export default useFormik;
