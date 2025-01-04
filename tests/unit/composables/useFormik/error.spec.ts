import { describe, test, expect, beforeAll } from "vitest";
import { useFormik } from "../../../../lib";
import * as Yup from "yup";
import { nextTick } from "vue";

describe("useFormik error", async () => {
  const initialValues = {
    name: "",
    email: ""
  }
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("This field is required")
      .max(10, "Max 10 characters"),
    email: Yup.string()
      .required("This field is required.")
      .email("Invalid email")
  })

  test("reactivity on values changes", async () => {
    const { errors, setFieldValue } = useFormik({ initialValues, validationSchema })

    await nextTick()
    expect(errors).toMatchSnapshot()
    setFieldValue("email", "kiran")
    await nextTick()
    expect(errors).toMatchSnapshot()
  })

  describe("getFieldError", async () => {
    describe("string errors", async () => {
      const { getFieldError, setFieldValue, setFieldTouched } = useFormik({ initialValues, validationSchema })
      beforeAll(() => {
        setFieldTouched("name", true)
      })


      test("returns error message", async () => {
        expect(getFieldError("name")).toBe("This field is required")
      })

      test("returns empty if no error", async () => {
        setFieldValue("name", "kiran")
        await nextTick()
        expect(getFieldError("name")).toBe("")
      })
    })

    describe("errors in array/object fields", async () => {
      describe("yup validation", () => {
        const { getFieldError, setFieldValue, setFieldTouched, errors, touched } = useFormik({
          initialValues: {
            names: ["", ""],
            contacts: [
              { code: "", number: "" },
            ]
          },
          validationSchema: Yup.object().shape({
            names: Yup.array().of(Yup.string().required("This is a required field")),
            contacts: Yup.array().of(
              Yup.object().shape({
                code: Yup.string().required("Code is required"),
                number: Yup.string().required("Number is required")
              })
            )
          })
        })

        beforeAll(() => {
          setFieldTouched("names[0]", true)
          setFieldTouched("names[1]", true)

          setFieldTouched("contacts[0].code", true)
          setFieldTouched("contacts[0].number", true)
        })

        test("returns error message", async () => {
          expect(getFieldError("names[0]")).toBe("This is a required field")
        })

        test("returns empty if no error", async () => {
          setFieldValue("names[0]", "kiran")
          await nextTick()
          expect(getFieldError("names[0]")).toBe("")
        })

        test("returns error message for nested fields", async () => {
          expect(getFieldError("contacts[0].code")).toBe("Code is required")
        })
      })
    })
  })
})
