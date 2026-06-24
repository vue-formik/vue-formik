<template>
  <div
    :class="{
      'vf-field vf-textarea-field': true,
      'vf-field--error': hasError,
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ constructLabel(label, required) }}
    </label>
    <div class="vf-input">
      <slot name="prepend" />
      <textarea
        :id="name"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        @input="field.onInput"
        @blur="field.onBlur"
        :class="{
          'vf-input--disabled': disabled,
          'vf-input--readonly': readonly,
          'vf-input--error': hasError,
        }"
        :readonly="readonly"
        :disabled="disabled"
        :rows="rows"
        :required="required"
        v-bind="inputProps"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="hasError ? name + '-error' : undefined"
        :aria-invalid="hasError ? 'true' : 'false'"
        :aria-required="required ? 'true' : undefined"
        :aria-readonly="readonly ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
      ></textarea>
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
  placeholder?: string;
  rows?: number | string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  inputProps?: Record<keyof HTMLTextAreaElement, never>;
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
