import { describe, test, expect } from "vitest";
import Joi from "joi";
import { useFormik } from "@/index";
import { nextTick } from "vue";

describe("joiValidation", async () => {
  const initialValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
  const validationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });

  test("validate simple form", async () => {
    const formik = useFormik({
      initialValues,
      validationSchema,
      validateOnMount: true,
      mode: "JOI",
    });

    await nextTick();
    expect(formik.errors).toMatchSnapshot();

    formik.setFieldValue("name", "John Doe");
    formik.setFieldValue("email", "john@example.com");
    formik.setFieldValue("password", "password");
    formik.setFieldValue("confirmPassword", "password");

    await nextTick();
    expect(formik.errors).toMatchSnapshot();
    expect(formik.isValid.value).toBe(true);

    formik.setFieldValue("confirmPassword", "password123");
    await nextTick();
    expect(formik.errors).toMatchSnapshot();
    expect(formik.isValid.value).toBe(false);
  });

  test("validate form with array fields", async () => {
    const initialValues = {
      name: "",
      skills: [""],
    }
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      skills: Joi.array().items(Joi.string().required()).required(),
    });

    const formik = useFormik({
      initialValues,
      validationSchema,
      validateOnMount: true,
      mode: "JOI",
    });

    await nextTick();
    expect(formik.errors).toMatchSnapshot();

    formik.setFieldValue("name", "John Doe");
    formik.setFieldValue("skills", ["Vue", "React"]);

    await nextTick();
    expect(formik.errors).toMatchSnapshot();

    formik.setFieldValue("skills", ["Vue", ""]);
    await nextTick();
    expect(formik.errors).toMatchSnapshot();
  });

  test("validate form with object fields", async () => {
    const initialValues = {
      name: "",
      address: {
        city: "",
        country: "",
      },
    }
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      address: Joi.object({
        city: Joi.string().required(),
        country: Joi.string().required(),
      }).required(),
    });

    const formik = useFormik({
      initialValues,
      validationSchema,
      validateOnMount: true,
      mode: "JOI",
    });

    await nextTick();
    expect(formik.errors).toMatchSnapshot();

    formik.setFieldValue("name", "John Doe");
    formik.setFieldValue("address.city", "New York");
    formik.setFieldValue("address.country", "USA");

    await nextTick();
    expect(formik.errors).toMatchSnapshot();

    formik.setFieldValue("address.city", "");
    await nextTick();
    expect(formik.errors).toMatchSnapshot();
  });

  test("validate form with array of objects", async () => {
    const initialValues = {
      name: "",
      friends: [
        { name: "", email: "" },
      ],
    }
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      friends: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required()
      ).required(),
    });

    const formik = useFormik({
      initialValues,
      validationSchema,
      validateOnMount: true,
      mode: "JOI",
    });

    await nextTick();
    expect(formik.errors).toMatchSnapshot();

    formik.setFieldValue("name", "John Doe");
    formik.setFieldValue("friends[0].name", "Jane Doe");
    formik.setFieldValue("friends[0].email", "jane@ex.com");
    formik.setFieldValue("friends[1].name", "John Doe");
    formik.setFieldValue("friends[1].email", "john@ex.com");

    await nextTick();
    expect(formik.errors).toMatchSnapshot();

    formik.setFieldValue("friends[1].email", "john@ex");
    await nextTick();

    expect(formik.errors).toMatchSnapshot();
  })
});
