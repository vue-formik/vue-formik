<script setup lang="ts">
import useFormik from '@/composables/useFormik.ts'
import * as Yup from "yup"

defineProps<{
  msg: string
}>()

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Email is invalid').required('Email is required'),
  message: Yup.string().required('Message is required'),
})

const vSchema = {
  name: (value: string) => {
    if (!value) {
      return 'Name is required'
    }
  },
  email: (value: string) => {
    if (!value) {
      return 'Email is required'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Email is invalid'
    }
  },
  message: (value: string) => {
    if (!value) {
      return 'Message is required'
    }
  },
}

const formik = useFormik({
  initialValues: {
    name: '',
    email: '',
    message: '',
  },
  validationSchema: vSchema,
  onSubmit: (values) => {
    console.log(values)
  },
})
</script>

<template>
  <div>
    <pre><code>
      {{JSON.stringify({
        errors: formik.errors,
        touched: formik.touched,
        values: formik.values,
    }, null, 2)}}
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
        <textarea
          id="message" name="message"
          @blur="formik.handleBlur"
          @input="formik.handleChange"
        />
      </div>

      <div>
        {{formik.isValid ? 'Form is valid' : 'Form is invalid'}}
        {{formik.isDirty ? 'Form is dirty' : 'Form is pristine'}}
      </div>

      <button
        type="submit"
        :disabled="!formik.isValid || !formik.isDirty"
      >
        Submit
      </button>
    </form>

  </div>
</template>
<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    font-weight: bold;
  }

  input, textarea {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
