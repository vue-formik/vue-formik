import { computed, onScopeDispose, toValue, watch, type MaybeRefOrGetter } from "vue";
import type { Formik, InputValidationRule } from "../types";
import useFormikContext from "./useFormikContext";

export interface UseFieldOptions {
  /** Explicit formik instance; falls back to the injected one when omitted. */
  formik?: Formik;
  /** Field-level validation rule, merged into the form's validation for this field. */
  validation?: MaybeRefOrGetter<InputValidationRule | undefined>;
}

/**
 * Headless binding for a single form field. Resolves the formik instance from a
 * prop or injection and exposes a reactive value, error/touched state, ready-made
 * event handlers, and a11y attributes — so any input (custom UI library components
 * included) can be wired to vue-formik without the bundled components.
 */
export function useField(name: MaybeRefOrGetter<string>, options: UseFieldOptions = {}) {
  const { formik: fk } = useFormikContext(options.formik);

  const fieldName = () => toValue(name);

  const value = computed<unknown>({
    get: () => fk?.getFieldValue(fieldName()),
    set: (v) => fk?.setFieldValue(fieldName(), v),
  });

  const hasError = computed(() => Boolean(fk?.hasFieldError(fieldName())));
  const error = computed(() => fk?.getFieldError(fieldName()));
  const touched = computed(() => fk?.getFieldTouched(fieldName()));

  const setValue = (v: unknown) => fk?.setFieldValue(fieldName(), v);
  const setTouched = (isTouched = true) => fk?.setFieldTouched(fieldName(), isTouched);

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setValue(target.type === "checkbox" ? target.checked : target.value);
  };
  const onChange = onInput;
  const onBlur = (e: FocusEvent) => fk?.handleFieldBlur(e);

  const attrs = computed(() => ({
    id: fieldName(),
    name: fieldName(),
    "aria-invalid": hasError.value ? "true" : "false",
    "aria-describedby": hasError.value ? `${fieldName()}-error` : undefined,
  }));

  // Register/sync the field-level validation rule with the form.
  if (fk) {
    let registered: string | null = null;
    const unregister = () => {
      if (registered) {
        fk.unregisterFieldValidation(registered);
        registered = null;
      }
    };
    watch(
      [fieldName, () => toValue(options.validation)],
      ([name, rule]) => {
        unregister();
        if (rule) {
          fk.registerFieldValidation(name, rule);
          registered = name;
        }
      },
      { immediate: true },
    );
    onScopeDispose(unregister);
  }

  return {
    formik: fk,
    value,
    error,
    touched,
    hasError,
    attrs,
    setValue,
    setTouched,
    onInput,
    onChange,
    onBlur,
  };
}

export default useField;
