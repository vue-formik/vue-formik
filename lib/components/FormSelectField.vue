<template>
  <div
    :class="{
      'vf-field vf-select-field': true,
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
      <select
        :id="name"
        :name="name"
        :value="inputValue"
        @change="handleChange"
        @blur="formik.handleBlur"
        :class="{
          'vf-input--error': formik.hasFieldError(name),
          'vf-input--disabled': disabled,
        }"
        :disabled="disabled"
        v-bind="inputProps"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="formik.hasFieldError(name) ? name + '-error' : undefined"
        :aria-invalid="formik.hasFieldError(name) ? 'true' : 'false'"
        :aria-required="inputProps?.required ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
      >
        <option v-if="placeholder" disabled value="">
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <slot name="append" />
    </div>
    <p
      v-if="formik.hasFieldError(name)"
      class="vf-error"
      :id="name + '-error'"
    >
      {{ formik.getFieldError(name) }}
    </p>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import useFormik from "@/composables/useFormik";

const props = defineProps<{
  formik: ReturnType<typeof useFormik<any>>;
  name: string;
  label?: string;
  options: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  inputProps?: Record<string, any>;
  disabled?: boolean;
}>();

const inputValue = computed(() => props.formik.getFieldValue(props.name) as string);

const handleChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  props.formik.setFieldValue(props.name, value);
};
</script>
