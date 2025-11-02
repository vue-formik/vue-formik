<script setup lang="ts">
import type { Formik, IResetOptions } from "@/types";
import useFormikContext from "@/composables/useFormikContext";

const props = defineProps<{
  formik?: Formik;
  resetOptions?: IResetOptions<Formik["values"]>;
}>();

const { formik: fk } = useFormikContext(props.formik);
</script>
<template>
  <form
    class="vf-form"
    @submit="(e) => fk?.handleSubmit(e)"
    @reset="(e) => fk?.reset(resetOptions, e)"
    v-bind="$attrs"
  >
    <slot />
  </form>
</template>
