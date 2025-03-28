import { computed, reactive, toRaw, watch, ref, type UnwrapRef } from "vue";
import { clearObject, getNestedValue, setNestedValue, deepClone } from "@/helpers";
import type { FormikHelpers, Paths } from "@/types";
import { ObjectSchema as YupSchema } from "yup";
import { ObjectSchema as JoiSchema } from "joi";
import { ZodType } from "zod";
import { CustomValidationSchema, FormikOnSubmit, IResetOptions } from "@/types";
import validation from "@/composables/validation";
import { Struct } from "superstruct";

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const useFormik = <T extends object>({
  initialValues,
  validationSchema,
  yupSchema,
  zodSchema,
  joiSchema,
  structSchema,
  onSubmit,
  validateOnMount = true,
  preventDefault = true,
}: {
  initialValues: T;
  validateOnMount?: boolean;
  preventDefault?: boolean;
  onSubmit?: FormikOnSubmit<T>;
  yupSchema?: YupSchema<T>;
  joiSchema?: JoiSchema<T>;
  zodSchema?: ZodType<T>;
  structSchema?: Struct<T>;
  validationSchema?: CustomValidationSchema<T>;
}) => {
  // Refs for tracking form state
  const isSubmitting = ref(false);
  const isValidating = ref(false);
  const submitCount = ref(0);
  const initialValuesRef = reactive<T>(deepClone(initialValues));

  const validate = () => {
    return validation(toRaw(values) as T, {
      yupSchema,
      joiSchema,
      zodSchema,
      validationSchema,
      structSchema,
    });
  };

  // Reactive form state
  const values = reactive<T>({ ...deepClone(initialValues) });
  const errors = reactive<Partial<Record<keyof T, unknown>>>({});
  const touched = reactive<Partial<Record<keyof T, unknown>>>({});

  const isValid = computed(() => Object.keys(errors).length === 0);
  const isDirty = computed(() => JSON.stringify(values) !== JSON.stringify(initialValuesRef));

  const setValues = (newValues: Partial<T>) => {
    Object.assign(values, newValues);
  };

  const setErrors = (newErrors: Partial<Record<keyof T, unknown>>) => {
    clearObject(errors);
    Object.assign(errors, newErrors);
  };

  const setTouched = (newTouched: Partial<Record<keyof T, unknown>>) => {
    clearObject(touched);
    Object.assign(touched, newTouched);
  };

  const reset = ({ values: newValues, keepTouched = false }: IResetOptions<T> = {}) => {
    if (newValues) {
      setValues(Object.assign(initialValuesRef, deepClone(newValues)));
      Object.assign(initialValuesRef, deepClone(newValues));
    } else {
      setValues(deepClone(initialValuesRef));
    }

    if (!keepTouched) {
      clearObject(touched);
    }

    submitCount.value = 0;
  };

  const setFieldValue = <K extends Paths<T>>(field: K, value: unknown) => {
    setNestedValue(values as Record<string, unknown>, field, value);
  };

  const setFieldTouched = <K extends Paths<T>>(field: K, isTouched?: boolean) => {
    setNestedValue(touched as Record<string, unknown>, field, isTouched);
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
      const validationErrors = validate();
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
    // @ts-expect-error - validate the type of target
    setFieldTouched(target.name, true);
  };

  const handleFieldChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;

    // @ts-expect-error - validate the type of target
    setFieldValue(target.name, value);
    // @ts-expect-error - validate the type of target
    setFieldTouched(target.name, true);
  };

  const performValidation = () => {
    isValidating.value = true;
    const validationErrors = validate();
    clearObject(errors);
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
