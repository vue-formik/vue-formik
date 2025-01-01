import { computed, reactive, toRaw, watch, ref } from "vue";
import { ObjectSchema } from "yup";
import { clearReactiveObject, getNestedValue, updateNestedProperty } from "@/helpers";
import { FormikHelpers, ValidationRule } from "@/types";

const useFormik = <T extends object>(options: {
  initialValues: T;
  validationSchema?: Partial<Record<keyof T, ValidationRule<T[keyof T]>>> | ObjectSchema<T>;
  onSubmit: (values: T, helpers: FormikHelpers<T>) => void;
}) => {
  const { initialValues, validationSchema, onSubmit } = options;

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

        if (typeof rule === "function") {
          const error = rule(value);
          if (error) {
            validationErrors[key as keyof T] = error;
          }
        }
      }
    }

    return validationErrors;
  };

  const values = reactive({ ...initialValues });
  const errors = reactive(validate(initialValues));
  const touched = reactive({} as Partial<Record<keyof T, boolean>>);
  const isSubmitting = ref(false);

  const setValues = (newValues: T) => {
    Object.assign(values, newValues);
    Object.assign(errors, validate(newValues));
  };

  const setErrors = (newErrors: Partial<Record<keyof T, string>>) => {
    Object.assign(errors, newErrors);
  };

  const reset = () => {
    setValues({ ...initialValues });
    clearReactiveObject(touched);
  };

  const setFieldValue = (field: string, value: unknown) => {
    updateNestedProperty(values as Record<string, unknown>, field, value);
  };

  const setFieldTouched = (field: string, touchedValue: boolean) => {
    updateNestedProperty(touched as Record<string, unknown>, field, touchedValue);
  };

  const setSubmitting = (value: boolean) => {
    isSubmitting.value = value;
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitting(true);
    onSubmit(
      toRaw(values) as T,
      {
        setErrors,
        reset,
        setValues,
        setSubmitting,
      } as FormikHelpers<T>,
    );
  };

  const handleBlur = (e: FocusEvent) => {
    const fieldName = (e.target as HTMLInputElement).name as keyof T;
    setFieldTouched(fieldName.toString(), true);
  };

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const fieldName = target.name as keyof T;
    const value = target.type === "checkbox" ? target.checked : target.value;

    setFieldValue(fieldName.toString(), value as T[keyof T]);
  };

  const isValid = computed(() => {
    return Object.keys(errors).length === 0;
  });

  const isDirty = computed(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  });

  watch(
    () => values,
    () => {
      const validationErrors = validate(toRaw(values) as T);
      //@ts-expect-error Object.keys(errors) is not iterable
      Object.keys(errors).forEach((key) => delete errors[key]); // Clear existing errors
      Object.assign(errors, validationErrors); // Assign new errors
    },
    { deep: true },
  );

  const hasFieldError = (field: string) => {
    const errorValue = getNestedValue(errors, field);
    const touchedValue = getNestedValue(touched, field);

    return errorValue !== undefined && touchedValue !== undefined && errorValue && !!touchedValue;
  };

  const getFieldError = (field: string) => {
    if (hasFieldError(field)) {
      return getNestedValue(errors, field);
    } else {
      return "";
    }
  };

  const getFieldValue = (field: string) => {
    return getNestedValue(values, field);
  };

  const fieldHandlers = computed(() => ({
    onBlur: handleBlur,
    onChange: handleChange,
  }));

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    fieldHandlers,
    isSubmitting,
    setValues,
    setErrors,
    reset,
    setFieldValue,
    setFieldTouched,
    handleBlur,
    handleChange,
    handleSubmit,
    hasFieldError,
    getFieldError,
    getFieldValue,
  };
};

export default useFormik;
