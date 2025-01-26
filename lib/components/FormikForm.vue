<script setup lang="ts">
import { Formik, IResetOptions } from "@/types";
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
    @submit="() => fk?.handleSubmit()"
    @reset="() => fk?.reset(resetOptions)"
    v-bind="$attrs"
  >
    <slot />
  </form>
</template>
