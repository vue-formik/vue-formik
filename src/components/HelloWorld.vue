<script setup lang="ts">
import useFormik from '@/composables/useFormik.ts'
import * as Yup from "yup"

defineProps<{
  msg: string
}>()

const formik = useFormik({
  initialValues: {
    name: '',
    email: '',
    message: '',
  },
  validationSchema: Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Email is invalid').required('Email is required'),
    message: Yup.string().required('Message is required'),
  }),
  // validationSchema: {
  //   name: (value) => {
  //     if (!value) {
  //       return 'Name is required'
  //     }
  //   },
  //   email: (value) => {
  //     if (!value) {
  //       return 'Email is required'
  //     }
  //
  //     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
  //       return 'Email is invalid'
  //     }
  //   },
  //   message: (value) => {
  //     if (!value) {
  //       return 'Message is required'
  //     }
  //   },
  // },
  onSubmit: (values) => {
    console.log(values)
  },
})
</script>

<template>
  <div>
    <pre><code>
      {{
     JSON.stringify({
        values: formik.values,
        errors: formik.errors,
        // touched: formik.touched,
        // isValid: formik.isValid,
    }, null, 2) }}
    </code></pre>

    <form @submit.prevent="formik.handleSubmit">
      <div>
        <label for="name">What’s your name?</label>
        <input
          type="text" id="name" name="name"
          @blur="formik.handleBlur"
          @input="formik.handleChange"
        />
      </div>
      <div>
        <label for="email">What’s your email?</label>
        <input type="email" id="email" name="email"
               @blur="formik.handleBlur"
               @input="formik.handleChange"
        />
      </div>
      <div>
        <label for="message">What’s your message?</label>
        <textarea id="message" name="message"
                  @blur="formik.handleBlur"
                  @input="formik.handleChange"
        ></textarea>
      </div>

      <button type="submit">Submit</button>
    </form>

  </div>
</template>
