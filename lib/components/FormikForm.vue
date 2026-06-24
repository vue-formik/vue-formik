<script setup lang="ts">
import { ref } from "vue";
import type { Formik, IResetOptions } from "../types";
import useFormikContext from "../composables/useFormikContext";

const props = withDefaults(
  defineProps<{
    formik?: Formik;
    resetOptions?: IResetOptions<Formik["values"]>;
    /** Move focus to the first invalid field after a failed submit. */
    focusOnError?: boolean;
  }>(),
  { focusOnError: true },
);

const { formik: fk } = useFormikContext(props.formik);
const formEl = ref<HTMLFormElement | null>(null);

const onSubmit = async (e: Event) => {
  await fk?.handleSubmit(e);
  if (!props.focusOnError) return;
  // After validation, focus the first invalid control so keyboard/screen-reader
  // users are taken straight to the problem.
  const firstInvalid = formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]');
  firstInvalid?.focus();
};
</script>
<template>
  <form
    ref="formEl"
    class="vf-form"
    @submit="onSubmit"
    @reset="(e) => fk?.reset(resetOptions, e)"
    v-bind="$attrs"
  >
    <slot />
  </form>
</template>
