import { test, expect, describe, vi } from "vitest";
import { useFormik } from "../../../../lib";
import { nextTick } from "vue";

describe("useFormik custom validation", async () => {
  test("should validate form with custom validation schema", async () => {
    const initialValues = {
      contact: ""
    }
    const validationSchema = {
      contact: (value: string) => {
        if (!value) {
          return "Contact is required"
        }
      }
    }
    const {errors} = useFormik({initialValues, validationSchema, onSubmit: vi.fn() })
    expect(errors).toMatchSnapshot()
  })
  test("should validate array field with custom validation schema", async () => {
    const initialValues = {
      contacts: ["", ""]
    }
    const validationSchema = {
      contacts: (value: string[]) => {
        if (value.length === 0) {
          return "Contact is required"
        }
        const errs = []
        for (let i = 0; i < value.length; i++) {
          if (!value[i]) {
            errs[i] = "Contact is required"
            continue
          }
        }
        return errs.length ? errs : undefined
      }
    }
    const {errors} = useFormik({initialValues, validationSchema, onSubmit: vi.fn() })
    expect(errors).toMatchSnapshot()
  })
  test("should validate object field with custom validation schema", async () => {
    const initialValues = {
      address: {
        street: "",
        city: ""
      }
    }
    const validationSchema = {
      address: (value: { street: string; city: string }) => {
        const errs = {}
        if (!value.street) {
          errs["street"] = "Street is required"
        }
        if (!value.city) {
          errs["city"] = "City is required"
        }
        return Object.keys(errs).length ? errs : undefined
      }
    }
    const {errors} = useFormik({initialValues, validationSchema, onSubmit: vi.fn() })
    expect(errors).toMatchSnapshot()
  })

  describe("validation on value update", () => {
    test("should validate form on value update with custom validation schema", async () => {
      const initialValues = {
        contact: ""
      }
      const validationSchema = {
        contact: (value: string) => {
          if (!value) {
            return "Contact is required"
          }
          if(value.length < 3) {
            return "Contact must be at least 3 characters"
          }
        }
      }
      const {errors, setValues} = useFormik({initialValues, validationSchema, onSubmit: vi.fn() })
      expect(errors).toMatchSnapshot()
      setValues({contact: "1"})
      expect(errors).toMatchSnapshot()
      setValues({contact: "123"})
      await nextTick()
      expect(errors).toMatchSnapshot()
    })
    test("should validate array field on value update with custom validation schema", async () => {
      const initialValues = {
        contacts: ["", ""]
      }
      const validationSchema = {
        contacts: (value: string[]) => {
          if (value.length === 0) {
            return "Contact is required"
          }
          const errs = []
          for (let i = 0; i < value.length; i++) {
            if (!value[i]) {
              errs[i] = "Contact is required"
              continue
            }
            if(value[i].length < 3) {
              errs[i] = "Contact must be at least 3 characters"
            }
          }
          return errs.length ? errs : undefined
        }
      }
      const {errors, setValues} = useFormik({initialValues, validationSchema, onSubmit: vi.fn() })
      expect(errors).toMatchSnapshot()
      setValues({contacts: ["1", "12"]})
      expect(errors).toMatchSnapshot()
      setValues({contacts: ["123", "123"]})
      await nextTick()
      expect(errors).toMatchSnapshot()
    })

    test("should validate object field on value update with custom validation schema", async () => {
      const initialValues = {
        address: {
          street: "",
          city: ""
        }
      }
      const validationSchema = {
        address: (value: { street: string; city: string }) => {
          const errs = {}
          if(value.street.length < 3) {
            errs["street"] = "Street must be at least 3 characters"
          }
          if (!value.street) {
            errs["street"] = "Street is required"
          }
          if (!value.city) {
            errs["city"] = "City is required"
          }
          return Object.keys(errs).length ? errs : undefined
        }
      }
      const {errors, setValues} = useFormik({initialValues, validationSchema, onSubmit: vi.fn() })
      await nextTick()
      expect(errors).toMatchSnapshot()
      setValues({address: {street: "1", city: ""}})
      await nextTick()
      expect(errors).toMatchSnapshot()
      setValues({address: {street: "123", city: "1"}})
      await nextTick()
      expect(errors).toMatchSnapshot()
    })
  })
})
