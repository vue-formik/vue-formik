import { describe, test, expect } from "vitest";
import { z } from "zod";
import { useFormik } from "@/index";
import { nextTick } from "vue";

describe("useFormik/jodValidation", async () => {

  test("simple form validation", async () => {
    const initialValues = {
      name: "",
      email: "",
    }
    const validationSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
    })

    const formik = useFormik({
      initialValues,
      validationSchema,
      validateOnMount: true,
      mode: "JOD"
    })

    expect(formik.errors).toMatchSnapshot()

    formik.setFieldValue("name", "John")
    formik.setFieldValue("email", "john@ex.com")
    await nextTick()
    expect(formik.errors).toMatchSnapshot()
    expect(formik.isValid.value).toBe(true)
  })

  test("form with array fields", async () => {
    const initialValues = {
      name: "",
      email: "",
      friends: [
        { name: "" },
        { name: "" },
      ]
    }
    const validationSchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      friends: z.array(z.object({
        name: z.string().min(3),
      }))
    })

    const formik = useFormik({
      initialValues,
      validationSchema,
      validateOnMount: true,
      mode: "JOD"
    })

    expect(formik.errors).toMatchSnapshot()

    formik.setFieldValue("name", "John")
    formik.setFieldValue("email", "john@ex.com")
    formik.setFieldValue("friends[0].name", "Jane")
    formik.setFieldValue("friends[1].name", "Doe")
    await nextTick()

    expect(formik.errors).toMatchSnapshot()
    expect(formik.isValid.value).toBe(true)

    formik.setFieldValue("friends[0].name", "J")
    await nextTick()

    expect(formik.errors).toMatchSnapshot()
    expect(formik.isValid.value).toBe(false)
  })
})
