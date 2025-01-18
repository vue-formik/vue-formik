<template>
  <div
    :class="{
      'vf-field': true,
      'vf-content-editable-field': true,
      'vf-field--error': fk?.hasFieldError(name),
      'vf-field--disabled': disabled,
      'vf-field--readonly': readonly,
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ constructLabel(label, required) }}
    </label>
    <div class="vf-input">
      <slot name="prepend" />
      <div
        :id="name"
        role="textbox"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="fk?.hasFieldError(name) ? name + '-error' : undefined"
        :aria-invalid="fk?.hasFieldError(name) ? 'true' : 'false'"
        :aria-required="required ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-readonly="readonly ? 'true' : undefined"
        :contenteditable="!disabled && !readonly"
        :class="{
          'vf-input--error': fk?.hasFieldError(name),
          'vf-input--placeholder': !hasValue,
          'vf-input--disabled': disabled,
          'vf-input--readonly': readonly,
        }"
        v-bind="contentProps"
        @input="handleInput"
        @blur="fk?.handleFieldBlur"
        @focus="handleFocus"
        :tabindex="disabled ? -1 : 0"
      >
        <span v-if="!hasValue">{{ placeholder }}</span
        >{{ inputValue }}
      </div>
      <slot name="append" />
    </div>
    <p v-if="fk?.hasFieldError(name)" class="vf--error" :id="name + '-error'">
      {{ fk?.getFieldError(name) }}
    </p>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { Formik } from "@/types";
import useFormikContext from "@/composables/useFormikContext";
import { constructLabel } from "@/helpers";

const props = defineProps<{
  formik: Formik;
  name: string;
  label?: string;
  placeholder?: string;
  contentProps?: Record<keyof HTMLDivElement, never>;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
}>();

const { formik: fk } = useFormikContext(props.formik)

const inputValue = computed(() => fk?.getFieldValue(props.name) as string);
const hasValue = computed(() => inputValue.value.trim().length > 0);

const handleInput = (e: Event) => {
  if (props.disabled || props.readonly) return;
  const value = (e.target as HTMLElement).innerText;
  fk?.setFieldValue(props.name, value);
};

const handleFocus = (e: Event) => {
  if (props.disabled || props.readonly || hasValue.value) return;
  (e.target as HTMLElement).innerHTML = ""; // Clear placeholder on focus
};
</script>
