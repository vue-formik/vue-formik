<template>
  <div
    :class="{
      'vf-field': true,
      [typeClass]: true,
      'vf-field--error': hasError,
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ constructLabel(label, required) }}
    </label>

    <div class="vf-input">
      <slot name="prepend" />

      <input
        :id="name"
        :name="name"
        :type="type || 'text'"
        :placeholder="placeholder"
        :value="inputValue"
        :readonly="readonly"
        :required="required"
        :disabled="disabled"
        @input="field.onInput"
        @blur="field.onBlur"
        :class="{
          'vf-input--error': hasError,
          'vf-input--readonly': readonly,
          'vf-input--disabled': disabled,
        }"
        v-bind="inputProps"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="hasError ? name + '-error' : undefined"
        :aria-invalid="hasError ? 'true' : 'false'"
        :aria-required="required ? 'true' : undefined"
        :aria-readonly="readonly ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
      />

      <slot name="append" />
    </div>

    <template v-if="hasError">
      <p
        v-if="typeof getError === 'string'"
        class="vf-error"
        :id="name + '-error'"
        role="alert"
        aria-live="assertive"
      >
        {{ getError }}
      </p>
      <template v-else-if="Array.isArray(getError)">
        <ul class="vf-error" :id="name + '-error'" role="alert" aria-live="assertive">
          <li v-for="(error, index) in getError" :key="index">
            {{ error }}
          </li>
        </ul>
      </template>
    </template>

    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { Formik, InputValidationRule } from "../types";
import useField from "../composables/useField";
import { constructLabel } from "../helpers";

type InputProps = Record<keyof HTMLInputElement, never>;

const props = defineProps<{
  formik?: Formik;
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  inputProps?: InputProps;
  validation?: InputValidationRule;
}>();

const field = useField(() => props.name, {
  formik: props.formik,
  validation: () => props.validation,
});

const inputValue = computed(() => (field.value.value ?? "") as string);

const typeClass = computed(() => `vf-${props.type || "text"}-field`);

const hasError = field.hasError;
const getError = field.error;
</script>
