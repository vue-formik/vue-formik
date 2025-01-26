import { computed, reactive, toRaw, watch, ref, type UnwrapRef } from "vue";
import { clearReactiveObject, getNestedValue, updateNestedProperty } from "@/helpers";
import type { FormikHelpers } from "@/types";
import { ObjectSchema as YupSchema } from "yup";
import { ObjectSchema as JoiSchema } from "joi";
import { ZodType } from "zod";
import { CustomValidationSchema, FormikOnSubmit } from "@/types";
import deepClone from "@/helpers/deepClone";

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const useFormik = <T extends object>({
  initialValues,
  validationSchema,
  yupSchema,
  zodSchema,
  joiSchema,
  onSubmit,
  validateOnMount = true,
  preventDefault = true,
}: {
  initialValues: T;
  validateOnMount?: boolean;
  preventDefault?: boolean;
  onSubmit?: FormikOnSubmit<T>;
  yupSchema?: YupSchema<T>;
  joiSchema?: JoiSchema;
  zodSchema?: ZodType<T>;
  validationSchema?: CustomValidationSchema<T>;
}) => {
  // Refs for tracking form state
  const isSubmitting = ref(false);
  const isValidating = ref(false);
  const submitCount = ref(0);
  const initialValuesRef = reactive<T>(deepClone(initialValues));

  const validate = (values: T): Partial<Record<keyof T, unknown>> => {
    const validationErrors: Partial<Record<keyof T, unknown>> = {};

    if (!yupSchema && !joiSchema && !zodSchema && !validationSchema) {
      return validationErrors;
    }

    if (zodSchema) {
      const result = zodSchema.safeParse(values);
      if (!result.success) {
        result.error.errors.forEach(({ path, message }) => {
          updateNestedProperty(
            validationErrors as Record<string, unknown>,
            path.join("."),
            message,
          );
        });
      }
    } else if (joiSchema) {
      const { error: e } = joiSchema.validate(values, { abortEarly: false });
      const err = e as {
        details?: Array<{
          message: string;
          context: {
            label: string;
          };
        }>;
      };
      if (err?.details?.length) {
        err.details.forEach(({ context, message }) => {
          updateNestedProperty(validationErrors as Record<string, unknown>, context.label, message);
        });
      }
    } else if (yupSchema) {
      try {
        yupSchema.validateSync(values, { abortEarly: false });
      } catch (e) {
        const err = e as { inner?: Array<{ path: string; message: string }> };
        if (err?.inner?.length) {
          err.inner.forEach(({ path, message }) => {
            updateNestedProperty(validationErrors as Record<string, unknown>, path, message);
          });
        }
      }
    } else if (validationSchema && typeof validationSchema === "object") {
      Object.entries(validationSchema).forEach(([key, rules]) => {
        if (typeof rules === "function") {
          const value = getNestedValue(values as Record<string, unknown>, key);
          const error = rules(value);
          if (error) {
            updateNestedProperty(validationErrors as Record<string, unknown>, key, error);
          }
        }
      });
    } else {
      console.error("Invalid validation schema provided");
    }

    return validationErrors;
  };

  // Reactive form state
  const values = reactive<T>({ ...deepClone(initialValues) });
  const errors = reactive<Partial<Record<keyof T, unknown>>>({});
  const touched = reactive<Partial<Record<keyof T, unknown>>>({});

  // Computed properties for form state
  const isValid = computed(() => Object.keys(errors).length === 0);
  const isDirty = computed(() => {
    // console.log("values", values);
    // console.log("initialValuesRef", initialValuesRef);
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef);
  });

  const setValues = (newValues: Partial<T>) => {
    Object.assign(values, newValues);
  };

  const setErrors = (newErrors: Partial<Record<keyof T, unknown>>) => {
    clearReactiveObject(errors);
    Object.assign(errors, newErrors);
  };

  const setTouched = (newTouched: Partial<Record<keyof T, unknown>>) => {
    clearReactiveObject(touched);
    Object.assign(touched, newTouched);
  };

  const reset = ({
    values: newValues,
    keepTouched = false,
  }: {
    values?: Partial<T>;
    keepTouched?: boolean;
  } = {}) => {
    if (newValues) {
      setValues(Object.assign(initialValuesRef, deepClone(newValues)));
      Object.assign(initialValuesRef, deepClone(newValues));
    } else {
      setValues(deepClone(initialValuesRef));
    }

    if (!keepTouched) {
      clearReactiveObject(touched);
    }

    submitCount.value = 0;
  };

  const setFieldValue = (field: string, value: unknown) => {
    updateNestedProperty(values as Record<string, unknown>, field, value);
  };

  const setFieldTouched = (field: string, isTouched?: boolean) => {
    updateNestedProperty(touched as Record<string, unknown>, field, isTouched);
  };

  const setSubmitting = (value: boolean) => {
    isSubmitting.value = value;
  };

  const handleSubmit = (e?: Event) => {
    if (typeof onSubmit !== "function") return;

    if (preventDefault && e) {
      e.preventDefault();
    }

    submitCount.value++;
    setSubmitting(true);
    isValidating.value = true;

    try {
      const validationErrors = validate(toRaw(values) as T);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        onSubmit(
          toRaw(values) as T,
          {
            reset,
            setErrors,
            setValues,
            setSubmitting,
            setTouched,
            setFieldValue,
            setFieldTouched,
          } as FormikHelpers<T>,
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      isValidating.value = false;
    }
  };

  const handleFieldBlur = (e: FocusEvent) => {
    const target = e.target as FieldElement;
    setFieldTouched(target.name, true);
  };

  const handleFieldChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;

    setFieldValue(target.name, value);
    setFieldTouched(target.name, true);
  };

  const performValidation = () => {
    isValidating.value = true;
    const validationErrors = validate(toRaw(values) as T);
    clearReactiveObject(errors);
    Object.assign(errors, validationErrors);
    isValidating.value = false;
  };

  if (validateOnMount) {
    performValidation();
  }

  // Debounced validation on value changes
  watch(
    () => values,
    () => {
      performValidation();
    },
    { deep: true },
  );

  const hasFieldError = (field: string): boolean => {
    const errorValue = getNestedValue(errors as Record<string, unknown>, field);
    const touchedValue = getNestedValue(touched as Record<string, unknown>, field);
    return Boolean(errorValue && touchedValue);
  };

  const getFieldError = (field: string) => {
    if (hasFieldError(field)) {
      return getNestedValue(errors as Record<string, unknown>, field);
    } else {
      return "";
    }
  };

  const getFieldValue = <K extends keyof UnwrapRef<T>>(field: K | string) => {
    return getNestedValue(values as Record<string, unknown>, field as string);
  };

  const getFieldTouched = (field: string) => {
    return getNestedValue(touched as Record<string, unknown>, field);
  };

  const fieldHandlers = computed(() => ({
    onBlur: handleFieldBlur,
    onChange: handleFieldChange,
  }));

  return {
    // Form State
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    isValidating,
    submitCount,

    // Field Handlers
    fieldHandlers,

    // State Setters
    setValues,
    setErrors,
    setTouched,
    setFieldValue,
    setFieldTouched,
    setSubmitting,

    // Form Actions
    reset,
    handleSubmit,

    // Field Event Handlers
    handleFieldBlur,
    handleFieldChange,

    // Field State Getters
    hasFieldError,
    getFieldError,
    getFieldValue,
    getFieldTouched,
  };
};

export default useFormik;
