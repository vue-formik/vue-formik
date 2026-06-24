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
- 🎯 **End-to-end type safety**: `setFieldValue`/`getFieldValue` infer typed paths (incl. `tags[0]`, `address.city`) **and** the value type at that path — autocomplete and compile-time checks for free
- ✅ **Validate with anything**: Yup, Zod, Joi, Superstruct, custom rules — or **any [Standard Schema](https://standardschema.dev)** (Zod, Valibot, ArkType…) via a single adapter
- 🧩 **Familiar Formik API**: `values` / `errors` / `touched` / `handleSubmit` / field arrays — the mental model React developers already know, native to Vue 3
- 🪝 **Headless `useField`**: bind any input (your own or a UI library's) to form state without the bundled components
- 🔁 **Full field-array ops**: `push`, `pop`, `insert`, `remove`, `move`, `swap`, `replace`
- 🦾 **Accessible by default**: ARIA wiring, error live-regions, and focus-to-first-error on submit
- ⚡ **Performance Optimized**: Debounced validation and efficient dirty checking
- 🔄 **Flexible Configuration**: Control validation timing with `validateOnChange`, `validateOnBlur`, `validateOnMount`
- 🎨 **Component Library**: Pre-built form components (FormInput, FormTextArea, FormSelectField, FormContentEditable, FormikForm)

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

### Type-safe field access

When you type your form (or let it be inferred from `initialValues`), field paths and
values are fully typed — including nested objects and array indices:

```ts
import { useFormik } from 'vue-formik'

const form = useFormik({
  initialValues: {
    name: '',
    address: { city: '' },
    tags: [] as string[],
  },
})

form.setFieldValue('address.city', 'Kathmandu') // ✅ ok
form.setFieldValue('tags[0]', 'vue')            // ✅ ok
form.setFieldValue('name', 123)                 // ❌ type error: expected string
form.setFieldValue('nope', 'x')                 // ❌ type error: not a valid path

const city = form.getFieldValue('address.city') // string | undefined
```

### Validate with any Standard Schema

[Standard Schema](https://standardschema.dev) is a shared interface implemented by Zod,
Valibot, ArkType and others. Pass any of them via the single `standardSchema` option:

```ts
import { useFormik } from 'vue-formik'
import * as v from 'valibot' // or zod, arktype, …

const form = useFormik({
  initialValues: { email: '' },
  standardSchema: v.object({ email: v.pipe(v.string(), v.email('Invalid email')) }),
})
```

### Headless `useField`

Bind any input — including third-party UI components — without the bundled components:

```ts
import { useField } from 'vue-formik'

const { value, error, hasError, onInput, onBlur, attrs } = useField('email')
```

### Dynamic lists with `useFieldArray`

```ts
import { useFieldArray } from 'vue-formik'

const fa = useFieldArray(form)
fa.push('tags', 'new')
fa.insert('tags', 0, 'first')
fa.move('tags', 0, 2)
fa.swap('tags', 1, 3)
fa.remove('tags', 2)
fa.replace('tags', 0, 'updated')
```

## 📚 Documentation
See the [full documentation](https://vue-formik.netlify.app/) for more information.

> **v0.3.0 note:** `setFieldValue` / `setFieldTouched` / `getFieldValue` are now strictly
> typed via `NestedPaths`/`NestedValue`. If you were passing dynamically-built field-name
> strings, cast them (`name as NestedPaths<typeof values>`) or type the form explicitly.


## 🤝 Contributing

Want to help shape Vue-Formik? Contributions are welcome!
Check out our CONTRIBUTING.md (link coming soon) for more details.

## 📢 Stay Updated

Follow the project for updates, ✨ new features, bug fixes, and a roadmap for the future!

👨‍💻 Happy Coding! ❤️
