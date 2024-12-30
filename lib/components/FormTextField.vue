<template>
  <div class="v-formik--field v-formik--text-field">
    <label v-if="label" :for="name">{{ label }}</label>
    <input
      :id="name"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :value="formik.getFieldValue"
      v-on="formik.fieldHandlers"
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
defineProps<{
  // eslint-disable-next-line
  formik: any;
  name: string;
  label?: string;
  type: string;
  placeholder: string;
  value: string;
  inputProps?: Record<string, never>;
}>();
</script>

<style lang="scss">
.v-formik {
  &--field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  &--input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    font-size: 1rem;

    &--error {
      border-color: red;
    }
  }
  &--error {
    color: red;
    font-size: 0.875rem;
  }
}
</style>
