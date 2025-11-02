import { computed, reactive, ref, toRaw, watch, type UnwrapRef } from "vue";
import cloneDeep from "lodash.clonedeep";
import {
  getNestedValue,
  setNestedValue,
  applyState,
  clearState,
  deepEqual,
  debounce,
} from "@/helpers";
import type {
  FormikHelpers,
  Paths,
  SetValuesOptions,
  UseFormikOptions,
  IResetOptions,
} from "@/types";
import validation from "@/composables/validation";

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
  validateOnChange = true,
  validateOnBlur = true,
  validationDebounce = 0,
  preventDefault = true,
  initialErrors,
  initialTouched,
}: UseFormikOptions<T>) => {
  // Refs for tracking form state
  const isSubmitting = ref(false);
  const isValidating = ref(false);
  const submitCount = ref(0);
  const initialValuesRef = reactive<T>(cloneDeep(initialValues));

  type ValidationErrors = Partial<Record<keyof T, unknown>>;

  // Reactive form state
  const values = reactive<T>(cloneDeep(initialValues));
  const errors = reactive<ValidationErrors>(initialErrors ? cloneDeep(initialErrors) : {});
  const touched = reactive<ValidationErrors>(initialTouched ? cloneDeep(initialTouched) : {});

  const validate = () => {
    return validation(toRaw(values) as T, {
      yupSchema,
      joiSchema,
      zodSchema,
      validationSchema,
      structSchema,
    });
  };

  const isValid = computed(() => Object.keys(errors).length === 0);
  const isDirty = computed(() => !deepEqual(toRaw(values), toRaw(initialValuesRef)));

  const setValues = (newValues: Partial<T>, options: SetValuesOptions = {}) => {
    applyState(values, newValues, options);
  };

  const setErrors = (newErrors: ValidationErrors) => {
    applyState(errors, newErrors, { replace: true });
  };

  const setTouched = (newTouched: ValidationErrors) => {
    applyState(touched, newTouched, { replace: true });
  };

  const reset = ({ values: newValues, keepTouched = false }: IResetOptions<T> = {}) => {
    if (newValues) {
      applyState(initialValuesRef, newValues, { replace: true });
      setValues(newValues, { replace: true });
    } else {
      setValues(toRaw(initialValuesRef) as T, { replace: true });
    }

    if (!keepTouched) {
      clearState(touched);
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

  let validationRunId = 0;

  const performValidation = async () => {
    const runId = ++validationRunId;
    isValidating.value = true;

    try {
      const validationErrors = await validate();

      if (runId === validationRunId) {
        setErrors(validationErrors);
      }

      return validationErrors;
    } catch (error) {
      console.error("Validation error:", error);

      if (runId === validationRunId) {
        setErrors({});
      }

      return {} as ValidationErrors;
    } finally {
      if (runId === validationRunId) {
        isValidating.value = false;
      }
    }
  };

  const handleSubmit = async (e?: Event) => {
    if (typeof onSubmit !== "function") return;

    if (preventDefault && e) {
      e.preventDefault();
    }

    submitCount.value++;
    setSubmitting(true);

    try {
      const validationErrors = await performValidation();

      if (Object.keys(validationErrors).length === 0) {
        await Promise.resolve(
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
          ),
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldBlur = (e: FocusEvent) => {
    const target = e.target as FieldElement;
    const fieldName = target.name;
    if (fieldName) {
      setFieldTouched(fieldName as Paths<T>, true);
    }

    // Trigger field validation on blur if enabled
    if (validateOnBlur) {
      void performValidation();
    }
  };

  const handleFieldChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const fieldName = target.name;

    if (fieldName) {
      setFieldValue(fieldName as Paths<T>, value);
      setFieldTouched(fieldName as Paths<T>, true);
    }

    // Field-level validation on change is handled by watch
  };

  if (validateOnMount) {
    void performValidation();
  }

  // Crea te debounced validation if debounce is enabled
  const debouncedValidation =
    validationDebounce > 0
      ? debounce(() => void performValidation(), validationDebounce)
      : () => void performValidation();

  // Conditional validation on value changes
  if (validateOnChange) {
    watch(
      () => values,
      () => {
        debouncedValidation();
      },
      { deep: true },
    );
  }

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
