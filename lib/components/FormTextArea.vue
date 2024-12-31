<template>
  <div class="v-formik--field v-formik--text-area">
    <label v-if="label" :for="name">{{ label }}</label>
    <textarea
      :id="name"
      :name="name"
      :placeholder="placeholder"
      :value="inputValue"
      v-on="formik.fieldHandlers"
      :class="{
        'v-formik--input': true,
        'v-formik--input--error': formik.hasFieldError(name),
      }"
      :rows="rows"
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
  formik: ReturnType<typeof useFormik<any>>;
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  rows?: number | string;
  inputProps?: Record<string, never>;
}>();

const inputValue = computed(() => props.formik.getFieldValue(props.name) as any as string);
</script>
