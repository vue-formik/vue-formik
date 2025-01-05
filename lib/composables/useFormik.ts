import { computed, reactive, toRaw, watch, ref } from "vue";
import { ObjectSchema } from "yup";
import { clearReactiveObject, getNestedValue, updateNestedProperty } from "@/helpers";
import type { FormikHelpers, FormikOnSubmit, FormikValidationSchema } from "@/types";

const useFormik = <T extends object>({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnMount = true,
  preventDefault = true,
}: {
  initialValues: T;
  validateOnMount?: boolean;
  preventDefault?: boolean;
  onSubmit?: FormikOnSubmit<T>;
  validationSchema?: FormikValidationSchema<T>;
}) => {
  const isSubmitting = ref(false);
  const initialValuesRef = ref({ ...initialValues });

  const validate = (values: T): Partial<Record<keyof T, unknown>> => {
    const validationErrors: Partial<Record<keyof T, unknown>> = {};

    if (
      typeof validationSchema === "object" &&
      (validationSchema instanceof ObjectSchema ||
        ("type" in validationSchema && validationSchema.type === "object"))
    ) {
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
    } else if (typeof validationSchema === "object" && Object.keys(validationSchema).length > 0) {
      for (const key in validationSchema) {
        const value = values[key as keyof T];
        const rules = validationSchema[key as keyof T];

        if (typeof rules === "function") {
          const error = rules(value);
          if (error) {
            validationErrors[key as keyof T] = error;
          }
        }
      }
    }
    return validationErrors;
  };

  const values = reactive({ ...initialValues });
  const errors = reactive<Partial<Record<keyof T, unknown>>>({});
  const touched = reactive<Partial<Record<keyof T, unknown>>>({});

  const isValid = computed(() => {
    return Object.keys(errors).length === 0;
  });

  const isDirty = computed(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.value);
  });

  const setValues = (newValues: Partial<T>) => {
    Object.assign(values, newValues);
  };

  const setErrors = (newErrors: object) => {
    Object.assign(errors, newErrors);
  };

  const setTouched = (newTouched: object) => {
    Object.assign(touched, newTouched);
  };

  const reset = ({
    values,
  }: {
    values?: Partial<T>;
  } = {}) => {
    if (!values) {
      values = { ...initialValuesRef.value };
    }
    setValues({ ...values });
    Object.assign(initialValuesRef.value, values);
    clearReactiveObject(touched);
  };

  const setFieldValue = (field: string, value: unknown) => {
    updateNestedProperty(values as Record<string, unknown>, field as string, value);
  };

  const setFieldTouched = (field: string, touchedValue: boolean) => {
    updateNestedProperty(touched as Record<string, unknown>, field as string, touchedValue);
  };

  const setSubmitting = (value: boolean) => {
    isSubmitting.value = value;
  };

  const handleSubmit = (e: Event) => {
    if (typeof onSubmit !== "function") {
      return;
    }
    if (preventDefault && e) {
      e.preventDefault();
    }
    setSubmitting(true);
    onSubmit(
      toRaw(values) as T,
      {
        reset,
        setErrors,
        setValues,
        setSubmitting,
      } as FormikHelpers<T>,
    );
  };

  const handleFieldBlur = (e: FocusEvent) => {
    const fieldName = (e.target as HTMLInputElement).name;
    setFieldTouched(fieldName, true);
  };

  const handleFieldChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;

    setFieldValue(target.name, value as T[keyof T]);
    setFieldTouched(target.name, true);
  };

  const performCheck = () => {
    const validationErrors = validate(toRaw(values) as T);

    // Clear existing errors
    Object.keys(errors).forEach((key) => {
      delete (errors as Partial<Record<keyof T, string>>)[key as keyof T];
    });

    // Assign new validation errors
    Object.assign(errors, validationErrors);
  };

  if (validateOnMount) {
    performCheck();
  }

  watch(
    () => values,
    () => {
      performCheck();
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
    setSubmitting,
  };
};

export default useFormik;
