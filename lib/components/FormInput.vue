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
        @input="handleInput"
        @blur="fk?.handleFieldBlur"
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
      <p v-if="typeof getError === 'string'" class="vf-error" :id="name + '-error'">
        {{ getError }}
      </p>
      <template v-else-if="Array.isArray(getError)">
        <ul class="vf-error" :id="name + '-error'">
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
import { Formik, InputValidationRule } from "@/types";
import useFormikContext from "@/composables/useFormikContext";
import { constructLabel } from "@/helpers";

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

const { formik: fk } = useFormikContext(props.formik);

const inputValue = computed(() => fk?.getFieldValue(props.name) as string);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  fk?.setFieldValue(props.name, value);
};

const typeClass = computed(() => `vf-${props.type || "text"}-field`);

const hasError = computed(() => fk?.hasFieldError(props.name));
const getError = computed(() => fk?.getFieldError(props.name));
</script>
