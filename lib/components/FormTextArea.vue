<template>
  <div
    :class="{
      'vf-field vf-textarea-field': true,
      'vf-field--error': fk?.hasFieldError(name),
    }"
  >
    <label v-if="label" :for="name" :id="name + '-label'">
      {{ constructLabel(label, required) }}
    </label>
    <div class="vf-input">
      <slot name="prepend" />
      <textarea
        :id="name"
        :name="name"
        :placeholder="placeholder"
        :value="inputValue"
        @input="handleInput"
        @blur="fk?.handleFieldBlur"
        :class="{
          'vf-input--disabled': disabled,
          'vf-input--readonly': readonly,
          'vf-input--error': fk?.hasFieldError(name),
        }"
        :readonly="readonly"
        :disabled="disabled"
        :rows="rows"
        :required="required"
        v-bind="inputProps"
        :aria-labelledby="label ? name + '-label' : undefined"
        :aria-describedby="fk?.hasFieldError(name) ? name + '-error' : undefined"
        :aria-invalid="fk?.hasFieldError(name) ? 'true' : 'false'"
        :aria-required="required ? 'true' : undefined"
        :aria-readonly="readonly ? 'true' : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
      ></textarea>
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
import { Formik } from "@/types";
import useFormikContext from "@/composables/useFormikContext";
import { constructLabel } from "@/helpers";

const props = defineProps<{
  formik?: Formik;
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number | string;
  readonly?: boolean;
  disabled?: boolean;
  required?: boolean;
  inputProps?: Record<keyof HTMLTextAreaElement, never>;
}>();

const { formik: fk } = useFormikContext(props.formik)

const inputValue = computed(() => fk?.getFieldValue(props.name) as string);

const handleInput = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value;
  fk?.setFieldValue(props.name, value);
};
</script>
