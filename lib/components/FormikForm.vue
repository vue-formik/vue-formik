<script setup lang="ts">
import { Formik } from "@/types";
import useFormikContext from "@/composables/useFormikContext";

const props = defineProps<{
  formik?: Formik;
}>();

const { formik: fk } = useFormikContext(props.formik);
</script>
<template>
  <form
    class="vf-form"
    v-bind="$attrs"
    @submit="fk?.handleSubmit"
  >
    <slot />
  </form>
</template>
