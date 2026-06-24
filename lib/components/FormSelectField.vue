<template>
  <div
    :class="{
      'vf-field vf-select-field': true,
      'vf-field--error': hasError,
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ constructLabel(label, required) }}
    </label>
    <div class="vf-input">
      <slot name="prepend" />
      <select
        :id="name"
        :name="name"
        :value="inputValue"
        @change="field.onChange"
        @blur="field.onBlur"
        :class="{
          'vf-input--error': hasError,
          'vf-input--disabled': disabled,
        }"
        :disabled="disabled"
        :required="required"
        v-bind="inputProps"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="hasError ? name + '-error' : undefined"
        :aria-invalid="hasError ? 'true' : 'false'"
        :aria-required="required ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
      >
        <option v-if="placeholder" disabled value="">
          {{ placeholder }}
        </option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <slot name="append" />
    </div>
    <p v-if="hasError" class="vf-error" :id="name + '-error'" role="alert" aria-live="assertive">
      {{ getError }}
    </p>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Formik, InputValidationRule } from "../types";
import useField from "../composables/useField";
import { constructLabel } from "../helpers";

const props = defineProps<{
  formik?: Formik;
  name: string;
  label?: string;
  options: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  inputProps?: Record<keyof HTMLSelectElement, never>;
  disabled?: boolean;
  required?: boolean;
  validation?: InputValidationRule;
}>();

const field = useField(() => props.name, {
  formik: props.formik,
  validation: () => props.validation,
});

const inputValue = computed(() => (field.value.value ?? "") as string);
const hasError = field.hasError;
const getError = field.error;
</script>
