<template>
  <div class="v-formik--field v-formik--text-field">
    <label v-if="label" :for="name">{{ label }}</label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :value="inputValue"
      @input="formik.handleChange"
      @blur="formik.handleBlur"
      :class="{
        'v-formik--input': true,
        'v-formik--input--error': formik.hasFieldError(name),
      }"
      v-bind="inputProps"
    />
    <p v-if="formik.hasFieldError(name)" class="v-formik--error">
      {{ formik.getFieldError(name) }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import useFormik from "@/composables/useFormik";
import { computed } from "vue";

const props = defineProps<{
  formik: ReturnType<typeof useFormik<never>>;
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  inputProps?: Record<string, never>;
}>();

const inputValue = computed(() => props.formik.getFieldValue(props.name) as never as string);
</script>
