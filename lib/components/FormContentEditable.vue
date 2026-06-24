<template>
  <div
    :class="{
      'vf-field': true,
      'vf-content-editable-field': true,
      'vf-field--error': hasError,
      'vf-field--disabled': disabled,
      'vf-field--readonly': readonly,
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ constructLabel(label, required) }}
    </label>
    <div class="vf-input">
      <slot name="prepend" />
      <div
        :id="name"
        role="textbox"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="hasError ? name + '-error' : undefined"
        :aria-invalid="hasError ? 'true' : 'false'"
        :aria-required="required ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-readonly="readonly ? 'true' : undefined"
        :contenteditable="!disabled && !readonly"
        :class="{
          'vf-input--error': hasError,
          'vf-input--placeholder': !hasValue,
          'vf-input--disabled': disabled,
          'vf-input--readonly': readonly,
        }"
        v-bind="contentProps"
        @input="handleInput"
        @blur="field.onBlur"
        @focus="handleFocus"
        :tabindex="disabled ? -1 : 0"
      >
        <span v-if="!hasValue">{{ placeholder }}</span
        >{{ inputValue }}
      </div>
      <slot name="append" />
    </div>
    <p v-if="hasError" class="vf--error" :id="name + '-error'" role="alert" aria-live="assertive">
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
  formik: Formik;
  name: string;
  label?: string;
  placeholder?: string;
  contentProps?: Record<keyof HTMLDivElement, never>;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  validation?: InputValidationRule;
}>();

const field = useField(() => props.name, {
  formik: props.formik,
  validation: () => props.validation,
});

const inputValue = computed(() => (field.value.value ?? "") as string);
const hasValue = computed(() => inputValue.value.trim().length > 0);
const hasError = field.hasError;
const getError = field.error;

const handleInput = (e: Event) => {
  if (props.disabled || props.readonly) return;
  field.setValue((e.target as HTMLElement).innerText);
};

const handleFocus = (e: Event) => {
  if (props.disabled || props.readonly || hasValue.value) return;
  (e.target as HTMLElement).innerHTML = ""; // Clear placeholder on focus
};
</script>
