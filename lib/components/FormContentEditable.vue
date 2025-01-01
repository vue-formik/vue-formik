<template>
  <div
    :class="{
      'vf-field': true,
      'vf-content-editable-field': true,
      'vf-field--error': formik.hasFieldError(name),
      'vf-field--disabled': disabled,
      'vf-field--readonly': readonly,
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ label }}
    </label>
    <div class="vf-input">
      <div
        :id="name"
        role="textbox"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="formik.hasFieldError(name) ? name + '-error' : undefined"
        :aria-invalid="formik.hasFieldError(name) ? 'true' : 'false'"
        :aria-required="contentProps?.required ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-readonly="readonly ? 'true' : undefined"
        :contenteditable="!disabled && !readonly"
        :class="{
          'vf-input--error': formik.hasFieldError(name),
          'vf-input--placeholder': !hasValue,
          'vf-input--disabled': disabled,
          'vf-input--readonly': readonly,
        }"
        v-bind="contentProps"
        @input="handleInput"
        @blur="formik.handleBlur"
        @focus="handleFocus"
        :tabindex="disabled ? -1 : 0"
      >
        <span v-if="!hasValue">{{ placeholder }}</span
        >{{ inputValue }}
      </div>
    </div>
    <p v-if="formik.hasFieldError(name)" class="vf--error" :id="name + '-error'">
      {{ formik.getFieldError(name) }}
    </p>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed } from "vue";
import useFormik from "@/composables/useFormik";

const props = defineProps<{
  formik: ReturnType<typeof useFormik<any>>;
  name: string;
  label?: string;
  placeholder?: string;
  contentProps?: Record<string, any>;
  disabled?: boolean;
  readonly?: boolean;
}>();

const inputValue = computed(() => props.formik.getFieldValue(props.name) as string);
const hasValue = computed(() => inputValue.value.trim().length > 0);

const handleInput = (e: Event) => {
  if (props.disabled || props.readonly) return;
  const value = (e.target as HTMLElement).innerText;
  props.formik.setFieldValue(props.name, value);
};

const handleFocus = (e: Event) => {
  if (props.disabled || props.readonly || hasValue.value) return;
  (e.target as HTMLElement).innerHTML = ""; // Clear placeholder on focus
};
</script>
