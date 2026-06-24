import { computed, reactive, ref, toRaw, watch } from "vue";
import cloneDeep from "lodash.clonedeep";
import {
  getNestedValue,
  setNestedValue,
  applyState,
  clearState,
  deepEqual,
  debounce,
} from "../helpers";
import type {
  FormikHelpers,
  InputValidationRule,
  NestedPaths,
  NestedValue,
  SetValuesOptions,
  UseFormikOptions,
  IResetOptions,
} from "../types";
import validation from "./validation";

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const useFormik = <T extends object = object>({
  initialValues,
  validationSchema,
  yupSchema,
  zodSchema,
  joiSchema,
  structSchema,
  standardSchema,
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
      standardSchema,
    });
  };

  const isValid = computed(() => Object.keys(errors).length === 0);
  // Compare the reactive proxies directly (not toRaw) so the computed tracks
  // property reads and recomputes when values change. deepEqual only reads
  // properties, so traversing the proxies is correct.
  const isDirty = computed(() => !deepEqual(values, initialValuesRef));

  const setValues = (newValues: Partial<T>, options: SetValuesOptions = {}) => {
    applyState(values, newValues, options);
  };

  const setErrors = (newErrors: ValidationErrors) => {
    applyState(errors, newErrors, { replace: true });
  };

  const setTouched = (newTouched: ValidationErrors) => {
    applyState(touched, newTouched, { replace: true });
  };

  const reset = ({ values: newValues, keepTouched = false }: IResetOptions<T> = {}, e?: Event) => {
    if (e && preventDefault) {
      e.preventDefault();
    }

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

  // Untyped internal writers used by DOM event handlers (field name/value come
  // from the DOM and are inherently untyped). The public setters below add the
  // NestedPaths/NestedValue type-safety on top.
  const setFieldValueRaw = (field: string, value: unknown) => {
    setNestedValue(values as Record<string, unknown>, field, value);
  };

  const setFieldTouchedRaw = (field: string, isTouched?: boolean) => {
    setNestedValue(touched as Record<string, unknown>, field, isTouched);
  };

  const setFieldValue = <K extends NestedPaths<T>>(field: K, value: NestedValue<T, K>) => {
    setFieldValueRaw(field, value as unknown);
  };

  const setFieldTouched = <K extends NestedPaths<T>>(field: K, isTouched?: boolean) => {
    setFieldTouchedRaw(field, isTouched);
  };

  const setSubmitting = (value: boolean) => {
    isSubmitting.value = value;
  };

  let validationRunId = 0;

  // Field-level validators registered by components (e.g. FormInput's `validation`
  // prop, via useField). They run after schema validation and take precedence for
  // their own path. See registerFieldValidation / unregisterFieldValidation.
  const fieldValidators = new Map<string, InputValidationRule>();

  const registerFieldValidation = (field: string, rule: InputValidationRule) => {
    fieldValidators.set(field, rule);
  };

  const unregisterFieldValidation = (field: string) => {
    fieldValidators.delete(field);
  };

  const applyFieldValidators = async (validationErrors: ValidationErrors) => {
    if (fieldValidators.size === 0) return;
    const raw = toRaw(values) as T;
    await Promise.all(
      Array.from(fieldValidators.entries()).map(async ([field, rule]) => {
        const fieldValue = getNestedValue(values as Record<string, unknown>, field);
        const error = await Promise.resolve(rule(fieldValue, raw));
        if (error !== undefined && error !== null && error !== "") {
          setNestedValue(validationErrors as Record<string, unknown>, field, error);
        }
      }),
    );
  };

  const performValidation = async () => {
    const runId = ++validationRunId;
    isValidating.value = true;

    try {
      const validationErrors = await validate();
      // Only pay the extra async tick when field validators are registered, so
      // schema-only validation keeps its original timing.
      if (fieldValidators.size > 0) {
        await applyFieldValidators(validationErrors);
      }

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
              event: e,
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
      setFieldTouchedRaw(fieldName, true);
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
      setFieldValueRaw(fieldName, value);
      setFieldTouchedRaw(fieldName, true);
    }

    // Field-level validation on change is handled by watch
  };

  if (validateOnMount) {
    void performValidation();
  }

  // Create debounced validation if debounce is enabled
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

  const hasFieldError = (field: NestedPaths<T>): boolean => {
    const errorValue = getNestedValue(errors as Record<string, unknown>, field);
    const touchedValue = getNestedValue(touched as Record<string, unknown>, field);
    return Boolean(errorValue && touchedValue);
  };

  const getFieldError = (field: NestedPaths<T>) => {
    if (hasFieldError(field)) {
      return getNestedValue(errors as Record<string, unknown>, field);
    } else {
      return "";
    }
  };

  const getFieldValue = <K extends NestedPaths<T>>(field: K): NestedValue<T, K> | undefined => {
    return getNestedValue(values as Record<string, unknown>, field) as
      | NestedValue<T, K>
      | undefined;
  };

  const getFieldTouched = (field: NestedPaths<T>) => {
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

    // Field-level validation registry (used by components / useField)
    registerFieldValidation,
    unregisterFieldValidation,

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
