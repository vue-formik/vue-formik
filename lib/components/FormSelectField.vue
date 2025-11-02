<template>
  <div
    :class="{
      'vf-field vf-select-field': true,
      'vf-field--error': fk?.hasFieldError(name),
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ constructLabel(label, required) }}
    </label>
    <div class="vf-input">
      <slot name="prepend" />
      <select
        :id="name"
        :name="name"
        :value="inputValue"
        @change="handleFieldChange"
        @blur="fk?.handleFieldBlur"
        :class="{
          'vf-input--error': fk?.hasFieldError(name),
          'vf-input--disabled': disabled,
        }"
        :disabled="disabled"
        :required="required"
        v-bind="inputProps"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="fk?.hasFieldError(name) ? name + '-error' : undefined"
        :aria-invalid="fk?.hasFieldError(name) ? 'true' : 'false'"
        :aria-required="required ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
      >
        <option v-if="placeholder" disabled value="">
          {{ placeholder }}
        </option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <slot name="append" />
    </div>
    <p v-if="fk?.hasFieldError(name)" class="vf-error" :id="name + '-error'">
      {{ fk?.getFieldError(name) }}
    </p>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Formik } from "@/types";
import useFormikContext from "@/composables/useFormikContext";
import { constructLabel } from "@/helpers";

const props = defineProps<{
  formik?: Formik;
  name: string;
  label?: string;
  options: Array<{ label: string; value: string | number }>;
  placeholder?: string;
  inputProps?: Record<keyof HTMLSelectElement, never>;
  disabled?: boolean;
  required?: boolean;
}>();

const { formik: fk } = useFormikContext(props.formik);

const inputValue = computed(() => fk?.getFieldValue(props.name) as string);

const handleFieldChange = (e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  fk?.setFieldValue(props.name, value);
};
</script>
