<template>
  <div
    :class="{
      'vf-field vf-textarea-field': true,
      'vf-field--error': formik.hasFieldError(name),
    }"
  >
    <label
      v-if="label"
      :for="name"
      :id="name + '-label'"
    >
      {{ label }}
    </label>
    <div class="vf-input">
      <slot name="prepend" />
      <textarea
        :id="name"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        @input="handleInput"
        @blur="formik.handleBlur"
        :class="{
          'vf-input--disabled': disabled,
          'vf-input--readonly': readonly,
          'vf-input--error': formik.hasFieldError(name),
        }"
        :readonly="readonly"
        :disabled="disabled"
        :rows="rows"
        v-bind="inputProps"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="formik.hasFieldError(name) ? name + '-error' : undefined"
        :aria-invalid="formik.hasFieldError(name) ? 'true' : 'false'"
        :aria-required="inputProps?.required ? 'true' : undefined"
        :aria-readonly="readonly ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
      ></textarea>
      <slot name="append" />
    </div>
    <p v-if="formik.hasFieldError(name)" class="vf-field__error" :id="name + '-error'">
      {{ formik.getFieldError(name) }}
    </p>
    <slot />
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
  rows?: number | string;
  readonly?: boolean;
  disabled?: boolean;
  inputProps?: Record<string, any>;
}>();

const inputValue = computed(() => props.formik.getFieldValue(props.name) as string);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value;
  props.formik.setFieldValue(props.name, value);
};
</script>
