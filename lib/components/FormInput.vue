<template>
  <div
    :class="{
      'vf-field': true,
      [typeClass]: true,
      'vf-field--error': formik.hasFieldError(name),
    }"
  >
    <label v-if="label" :for="name">{{ label }}</label>

    <div class="vf-input">
      <slot name="prepend" />

      <input
        :id="name"
        :name="name"
        :type="type || 'text'"
        :placeholder="placeholder"
        :value="inputValue"
        :readonly="readonly"
        :disabled="disabled"
        @input="handleInput"
        @blur="formik.handleBlur"
        :class="{
          'vf-input--error': formik.hasFieldError(name),
          'vf-input--readonly': readonly,
          'vf-input--disabled': disabled,
        }"
        v-bind="inputProps"
      />

      <slot name="append" />
    </div>

    <p v-if="formik.hasFieldError(name)" class="vf-error">
      {{ formik.getFieldError(name) }}
    </p>

    <slot />
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import useFormik from "@/composables/useFormik";
import { computed } from "vue";

const props = defineProps<{
  formik: ReturnType<typeof useFormik<any>>;
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  inputProps?: Record<string, any>;
  readonly?: boolean;
  disabled?: boolean;
}>();

const inputValue = computed(() => props.formik.getFieldValue(props.name) as any as string);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  props.formik.setFieldValue(props.name, value);
};

const typeClass = computed(() => `vf-${props.type || 'text'}-field`);
</script>
