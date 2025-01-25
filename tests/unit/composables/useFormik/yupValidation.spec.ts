import { describe, vi, test, expect } from "vitest";
import * as Yup from "yup";
import { useFormik } from "../../../../lib";

describe("yupValidation", async () => {
  const onSubmit = vi.fn();

  test("should validate form with validation schema", async () => {
    const initialValues = {
      contact: "",
    };
    const validationSchema = Yup.object().shape({
      contact: Yup.string().required("Contact is required"),
    });
    const { errors } = useFormik({
      initialValues,
      yupSchema: validationSchema,
      onSubmit,
    });
    expect(errors).toMatchSnapshot();
  });
  test("should validate array field with validation schema", async () => {
    const initialValues = {
      contacts: ["", ""],
    };
    const validationSchema = Yup.object().shape({
      contacts: Yup.array().of(Yup.string().required("Contact is required")),
    });
    const { errors } = useFormik({
      initialValues,
      yupSchema: validationSchema,
      onSubmit,
    });
    expect(errors).toMatchSnapshot();
  });
  test("should validate object field with validation schema", async () => {
    const initialValues = {
      contact: {
        code: "",
        number: "",
      },
    };
    const validationSchema = Yup.object().shape({
      contact: Yup.object().shape({
        code: Yup.string().required("Code is required"),
        number: Yup.string().required("Number is required"),
      }),
    });
    const { errors } = useFormik({
      initialValues,
      yupSchema: validationSchema,
      onSubmit,
    });
    expect(errors).toMatchSnapshot();
  });
  test("should validate object array field with validation schema", async () => {
    const initialValues = {
      contacts: [
        { code: "", number: "" },
        { code: "", number: "" },
      ],
    };
    const validationSchema = Yup.object().shape({
      contacts: Yup.array().of(
        Yup.object().shape({
          code: Yup.string().required("Code is required"),
          number: Yup.string().required("Number is required"),
        }),
      ),
    });
    const { errors } = useFormik({
      initialValues,
      yupSchema: validationSchema,
      onSubmit,
    });
    expect(errors).toMatchSnapshot();
  });
});
