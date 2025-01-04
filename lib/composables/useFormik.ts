import { computed, reactive, toRaw, watch, ref } from "vue";
import { ObjectSchema } from "yup";
import { clearReactiveObject, getNestedValue, updateNestedProperty } from "@/helpers";
import { FormikHelpers, ValidationRule } from "@/types";

const useFormik = <T extends object>({
  initialValues,
  validationSchema,
  onSubmit
}: {
  initialValues: T;
  validationSchema?: Partial<Record<keyof T, ValidationRule<T[keyof T]>>> | ObjectSchema<T>;
  onSubmit?: (values: T, helpers: FormikHelpers<T>) => void;
}) => {
  const initialValuesRef = ref({ ...initialValues });
  const yupMode = computed(() => validationSchema instanceof ObjectSchema);

  const validate = (values: T): Partial<Record<keyof T, string>> => {
    const validationErrors: Partial<Record<keyof T, string>> = {};

    if (yupMode.value) {
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
    }

    if (
      !yupMode.value && validationSchema &&
      typeof validationSchema === "object" &&
      Object.keys(validationSchema).length > 0
    ) {
      const schema = validationSchema as Partial<Record<keyof T, ValidationRule<T[keyof T]>>>;
      for (const key in schema) {
        const value = values[key as keyof T];
        const rule = schema[key as keyof T];
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

  const isValid = computed(() => {
    return Object.keys(errors).length === 0;
  });

  const isDirty = computed(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.value);
  });

  const setValues = (newValues: T) => {
    Object.assign(values, newValues);
    Object.assign(errors, validate(newValues));
  };

  const setErrors = (newErrors: Partial<Record<keyof T, string>>) => {
    Object.assign(errors, newErrors);
  };

  const setTouched = (newTouched: Partial<Record<keyof T, boolean>>) => {
    Object.assign(touched, newTouched);
  }

  const reset = ({
    values = initialValues,
  } = {}) => {
    setValues({ ...values });
    initialValuesRef.value = { ...values };
    clearReactiveObject(touched);
  };

  const setFieldValue = (field: keyof T, value: unknown) => {
    updateNestedProperty(values as Record<string, unknown>, field as string, value);
  };

  const setFieldTouched = (field: keyof T, touchedValue: boolean) => {
    updateNestedProperty(touched as Record<string, unknown>, field as string, touchedValue);
  };

  const setSubmitting = (value: boolean) => {
    isSubmitting.value = value;
  };

  const handleSubmit = (e: Event) => {
    if (typeof onSubmit !== "function") {
      return;
    }
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

  const handleFieldBlur = (e: FocusEvent) => {
    const fieldName = (e.target as HTMLInputElement).name as keyof T;
    setFieldTouched(fieldName, true);
  };

  const handleFieldChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const fieldName = target.name as keyof T;
    const value = target.type === "checkbox" ? target.checked : target.value;

    setFieldValue(fieldName, value as T[keyof T]);
    setFieldTouched(fieldName, true);
  };

  watch(
    () => values,
    () => {
      const validationErrors = validate(toRaw(values) as T);

      // Clear existing errors
      Object.keys(errors).forEach(key => {
        delete (errors as Partial<Record<keyof T, string>>)[key as keyof T];
      });

      // Assign new validation errors
      Object.assign(errors, validationErrors);
    },
    { deep: true }
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
    onBlur: handleFieldBlur,
    onChange: handleFieldChange,
  }));

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    fieldHandlers,
    isSubmitting,
    yupMode,
    setValues,
    setErrors,
    setTouched,
    reset,
    setFieldValue,
    setFieldTouched,
    handleFieldBlur,
    handleFieldChange,
    handleSubmit,
    hasFieldError,
    getFieldError,
    getFieldValue,
  };
};

export default useFormik;
