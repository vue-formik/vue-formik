<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import useFormik from "@/composables/useFormik";

defineProps<{
  formik: ReturnType<typeof useFormik<any>>;
}>()
</script>
<template>
  <form @submit="formik.handleSubmit">
    <slot />
  </form>
</template>
