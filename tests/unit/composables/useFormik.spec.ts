import {test, expect, describe, vi} from 'vitest'
import { useFormik } from "../../../lib";
import {nextTick} from "vue";
import { FormikHelpers } from "../../../lib/types";

describe("useFormik", async () => {
  const initialValues = {
    name: "Kiran",
    email: "kiran@parajuli.cc",
  }
  const emptyInitialValues = {
    name: "",
    email: "",
  }
  const onSubmit = vi.fn()

  const validationSchema = {
    name: (value: string) => {
      if (!value) {
        return "Name is required"
      }
    },
    email: (value: string) => {
      if (!value) {
        return "Email is required"
      }
      if (!value.includes("@")) {
        return "Invalid email"
      }
    }
  }

  describe("submit", () => {
    test("submitting form should call onSubmit", () => {
      const {handleSubmit} = useFormik({initialValues, onSubmit})
      handleSubmit({preventDefault: vi.fn()})
      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledWith(initialValues, expect.any(Object))
    })
    test("'isSubmitting' should return true when form is submitting", async () => {
      const onSubmit = (_values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
        expect(isSubmitting.value).toBe(true)
        setSubmitting(false)
        expect(isSubmitting.value).toBe(false)
      }

      const { isSubmitting, handleSubmit } = useFormik({ initialValues, onSubmit })
      expect(isSubmitting.value).toBe(false)

      handleSubmit({ preventDefault: vi.fn() })
    })
  })

  test("should initialize form with initial values", () => {
    const {values} = useFormik({initialValues, onSubmit})
    expect(values).toMatchSnapshot()
  })

  test("should validate form with validation schema", async () => {
    const {
      errors,
      touched,
      handleChange,
      handleBlur
    } = useFormik({ initialValues: emptyInitialValues, onSubmit, validationSchema })
    expect(errors).toMatchSnapshot()
    expect(touched).toMatchSnapshot()

    handleChange({ target: { name: "name", value: "Kiran" } })
    handleBlur({ target: { name: "name" } })

    await nextTick()

    expect(errors).toMatchSnapshot()
    expect(touched).toMatchSnapshot()

    handleChange({ target: { name: "email", value: "kiran" } })
    handleBlur({ target: { name: "email" } })

    await nextTick()

    expect(errors).toMatchSnapshot()
    expect(touched).toMatchSnapshot()

    handleChange({ target: { name: "email", value: "kiran@test.com" } })
    handleBlur({ target: { name: "email" } })

    await nextTick()

    expect(errors).toMatchSnapshot()
    expect(touched).toMatchSnapshot()
  })

  test("should set values", () => {
    const { setValues, values } = useFormik({ initialValues, onSubmit })
    setValues({ name: "Updated Name" })
    expect(values).toMatchSnapshot()
  })

  test("should set errors", () => {
    const { setErrors, errors } = useFormik({ initialValues, onSubmit })
    setErrors({ name: "Value must be less than 255 characters" })
    expect(errors).toMatchSnapshot()
  })

  test("should reset form", async () => {
    const { reset, values, touched, setFieldTouched, setFieldValue } = useFormik({ initialValues, onSubmit })

    setFieldTouched("name", true)
    setFieldTouched("email", true)
    setFieldValue("name", "Updated Name")
    setFieldValue("email", "updated@mail.cc")

    await nextTick()

    expect(values).toMatchSnapshot()
    expect(touched).toMatchSnapshot()

    reset()

    await nextTick()

    expect(values).toMatchSnapshot()
    expect(touched).toMatchSnapshot()
  })

  test("should set field value", () => {
    const { setFieldValue, values } = useFormik({ initialValues, onSubmit })
    setFieldValue("name", "Updated Name")
    expect(values).toMatchSnapshot()
  })

  test("should set field touched", () => {
    const { setFieldTouched, touched } = useFormik({ initialValues, onSubmit })
    setFieldTouched("name", true)
    expect(touched).toMatchSnapshot()
  })

  describe("status", () => {
    test("'isValid' should return true when form is valid", async () => {
      const { isValid, handleChange, handleBlur } = useFormik({ initialValues, onSubmit, validationSchema })
      expect(isValid.value).toBe(true)

      handleChange({ target: { name: "email", value: "Kiran" } })
      handleBlur({ target: { name: "email" } })

      await nextTick()

      expect(isValid.value).toBe(false)
    })
    test("'isDirty' should return true when form is dirty", async () => {
      const { isDirty, handleChange, handleBlur, reset } = useFormik({ initialValues, onSubmit, validationSchema })
      expect(isDirty.value).toBe(false)

      handleChange({ target: { name: "email", value: "Kiran" } })
      handleBlur({ target: { name: "email" } })

      await nextTick()

      expect(isDirty.value).toBe(true)

      reset()

      await nextTick()

      expect(isDirty.value).toBe(false)
    })
  })

  describe("field errors", () => {
    test("should return field error", async () => {
      const { getFieldError, setFieldValue, setFieldTouched } = useFormik({ initialValues, onSubmit, validationSchema })
      await nextTick()
      expect(getFieldError("name")).toBe("")

      setFieldValue("name", "")
      setFieldTouched("name", true)

      await nextTick()

      expect(getFieldError("name")).toBe("Name is required")
    })

    test("should return true if field has error", async () => {
      const { hasFieldError, setFieldValue, setFieldTouched } = useFormik({ initialValues, onSubmit, validationSchema })
      await nextTick()
      expect(hasFieldError("name")).toBe(false)

      setFieldValue("name", "")
      setFieldTouched("name", true)

      await nextTick()

      expect(hasFieldError("name")).toBe(true)
    })

    test("should return false if field has no error", async () => {
      const { hasFieldError, setFieldValue, setFieldTouched } = useFormik({ initialValues, onSubmit, validationSchema })
      await nextTick()
      expect(hasFieldError("name")).toBe(false)

      setFieldValue("name", "Kiran")
      setFieldTouched("name", true)

      await nextTick()

      expect(hasFieldError("name")).toBe(false)
    })
  })
})
