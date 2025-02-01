import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { useFormik } from "@/index";
import { Formik } from "@/types";
import { nextTick } from "vue";

describe("useFormik touched", async () => {
  const initialValues = {
    name: "",
    addresses: [""],
    contacts: [{ code: "", number: "" }],
  };
  let formik: Formik;
  beforeEach(() => {
    formik = useFormik({
      initialValues,
      validationSchema: {
        name: (value) => {
          if (!value) {
            return "Name is required";
          }
        },
        addresses: (value) => {
          if (!value) {
            return "Address is required";
          }
        },
        contacts: (values) => {
          if (!values?.length) {
            return "Contact is required";
          }

          const errors: typeof values = [];
          values.forEach((value, index) => {
            if (!value.code) {
              errors[index] = { ...errors[index], code: "Code is required" };
            }
            if (!value.number) {
              errors[index] = { ...errors[index], number: "Number is required" };
            }
            if (value.number.length < 10) {
              errors[index] = { ...errors[index], number: "Number must be at least 10 characters" };
            }
          });

          return errors.length ? errors : undefined;
        },
      },
    });
  });
  afterEach(() => {
    formik.reset();
  });
  test("should initialize with and empty object", () => {
    expect(formik.touched).toEqual({});
  });
  test("should set touched field", () => {
    formik.setFieldTouched("name", true);
    expect(formik.touched).toEqual({ name: true });
  });
  test("should set touched array field", () => {
    formik.setFieldTouched("addresses[0]", true);
    expect(formik.touched).toEqual({ addresses: [true] });
  });
  test("should set touched array field next item", () => {
    formik.setFieldTouched("addresses[1]", true);
    expect(formik.touched).toEqual({ addresses: [undefined, true] });
  });
  test("should set touched nested field", () => {
    formik.setFieldTouched("contacts[0].code", true);
    expect(formik.touched).toEqual({ contacts: [{ code: true }] });
  });
  test("should set touched nested field next item", async () => {
    formik.setFieldTouched("contacts[1].number", true);
    expect(formik.touched).toEqual({
      contacts: [{}, { number: true }],
    });
    formik.setFieldValue("contacts[1].number", "123");
    await nextTick();
    expect(formik.getFieldError("contacts[1].number")).toEqual(
      "Number must be at least 10 characters",
    );
    expect(formik.hasFieldError("contacts[1].number")).toBe(true);
    expect(formik.hasFieldError("contacts[0].number")).toBe(false);
    expect(formik.hasFieldError("contacts[0].code")).toBe(false);
  });
});
