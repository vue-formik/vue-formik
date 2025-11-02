import { describe, vi, test, expect } from "vitest";
import * as Yup from "yup";
import { nextTick } from "vue";
import { useFormik } from "@/index";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

describe("yupValidation", () => {
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
    await flush();
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
    await flush();
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
    await flush();
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
    await flush();
    expect(errors).toMatchSnapshot();
  });
});
