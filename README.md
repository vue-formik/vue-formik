# 🌟Vue-Formik
![example workflow](https://github.com/vue-formik/vue-formik/actions/workflows/ci.yml/badge.svg)
[![GitHub stars](https://img.shields.io/github/stars/vue-formik/vue-formik.svg?style=social&label=Star&maxAge=2592000)](https://github.com/vue-formik/vue-formik/stargazers/)
[![LGPLv3 License](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0.en.html)
[![Npm package version](https://badgen.net/npm/v/vue-formik)](https://npmjs.com/package/vue-formik)
[![Npm package yearly downloads](https://badgen.net/npm/dy/vue-formik)](https://npmjs.com/package/vue-formik)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/vue-formik/vue-formik/compare)
[![Issues](https://img.shields.io/github/issues-raw/vue-formik/vue-formik.svg?maxAge=25000)](https://github.com/vue-formik/vue-formik/issues)


Vue-Formik is a form management library for Vue.js.

Inspired by the powerful [Formik](https://formik.org/) library in React, Vue-Formik brings a simple and flexible way to handle form validation and form state management to Vue.js. 🚀



## 🔥 Key Features
- 📋 **Simplified Form Management**: Handle complex forms with ease using intuitive APIs
- ✅ **Comprehensive Validation**: Seamlessly integrate your own validation logic or use popular libraries (Yup, Zod, Joi, Superstruct)
- 🖼️ **Vue 3 Powered**: Built from the ground up for Vue.js v3 Composition API
- ⚡ **Performance Optimized**: Debounced validation and efficient dirty checking
- 🎯 **TypeScript First**: Full TypeScript support with intelligent autocompletion
- 🔄 **Flexible Configuration**: Control validation timing with validateOnChange, validateOnBlur, and validateOnMount options
- 🎨 **Component Library**: Pre-built form components (FormInput, FormTextArea, FormSelect, etc.)

## 💡 Quick Start

```bash
npm install vue-formik
# or
pnpm add vue-formik
# or
yarn add vue-formik
```

### Basic Example

```vue
<script setup lang="ts">
import { useFormik } from 'vue-formik'

const form = useFormik({
  initialValues: {
    email: '',
    password: ''
  },
  validationSchema: {
    email: (value: string) => {
      if (!value) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email'
    },
    password: (value: string) => {
      if (!value) return 'Password is required'
      if (value.length < 8) return 'Password must be at least 8 characters'
    }
  },
  onSubmit: async (values) => {
    console.log('Form submitted:', values)
  }
})
</script>

<template>
  <form @submit.prevent="form.handleSubmit">
    <input
      v-model="form.values.email"
      @blur="form.handleFieldBlur"
      @change="form.handleFieldChange"
      type="email"
      name="email"
    />
    <span v-if="form.hasFieldError('email')">
      {{ form.getFieldError('email') }}
    </span>

    <input
      v-model="form.values.password"
      @blur="form.handleFieldBlur"
      @change="form.handleFieldChange"
      type="password"
      name="password"
    />
    <span v-if="form.hasFieldError('password')">
      {{ form.getFieldError('password') }}
    </span>

    <button type="submit" :disabled="form.isSubmitting.value">
      Submit
    </button>
  </form>
</template>
```

### Advanced Configuration

```vue
<script setup lang="ts">
import { useFormik } from 'vue-formik'
import * as Yup from 'yup'

const form = useFormik({
  initialValues: {
    name: '',
    email: ''
  },
  yupSchema: Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required')
  }),
  validateOnChange: true,
  validateOnBlur: true,
  validateOnMount: false,
  validationDebounce: 300, // Debounce validation by 300ms
  onSubmit: async (values) => {
    console.log('Submitted:', values)
  }
})
</script>
```

## 📚 Documentation
See the [full documentation](https://vue-formik.netlify.app/) for more information.


## 🤝 Contributing

Want to help shape Vue-Formik? Contributions are welcome!
Check out our CONTRIBUTING.md (link coming soon) for more details.

## 📢 Stay Updated

Follow the project for updates, ✨ new features, bug fixes, and a roadmap for the future!

👨‍💻 Happy Coding! ❤️
