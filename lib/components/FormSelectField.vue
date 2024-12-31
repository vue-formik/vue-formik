<template>
  <div class="v-formik--field v-formik--select-field">
    <label v-if="label" :for="name">{{ label }}</label>
    <select
      :id="name"
      :name="name"
      :value="inputValue"
      @input="formik.handleChange"
      @blur="formik.handleBlur"
      :class="{
        'v-formik--input': true,
        'v-formik--input--error': formik.hasFieldError(name),
      }"
      v-bind="inputProps"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="formik.hasFieldError(name)" class="v-formik--error">
      {{ formik.getFieldError(name) }}
    </p>
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
  inputProps?: Record<string, never>;
}>();

const inputValue = computed(() => props.formik.getFieldValue(props.name) as any as string);
</script>
