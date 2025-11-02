import { test, expect, describe } from "vitest";
import { useFormik } from "@/index";
import { nextTick } from "vue";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

const waitForValidation = async (form: ReturnType<typeof useFormik>) => {
  await flush();
  while (form.isValidating.value) {
    await flush();
  }
};

const validateRequiredField = (value: string | undefined) =>
  value ? undefined : "This field is required";

const validateMinLength = (value: string, minLength: number) =>
  value.length >= minLength ? undefined : `Must be at least ${minLength} characters`;

const validateArrayField = (values: string[], minLength: number) =>
  values.map((value) => validateRequiredField(value) || validateMinLength(value, minLength));

const validateObjectField = (
  value: { [key: string]: string },
  rules: { [key: string]: (val: string) => string | undefined },
) => {
  const errors: { [key: string]: string } = {};
  Object.keys(rules).forEach((key) => {
    const error = rules[key](value[key]);
    if (error) errors[key] = error;
  });
  return Object.keys(errors).length ? errors : undefined;
};

describe("useFormik custom validation", () => {
  test("should validate form with custom validation schema", async () => {
    const initialValues = { contact: "" };
    const validationSchema = {
      contact: (value: string) => validateRequiredField(value),
    };
    const form = useFormik({ initialValues, validationSchema });
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
  });

  test("should validate array field with custom validation schema", async () => {
    const initialValues = { contacts: ["", ""] };
    const validationSchema = {
      contacts: (values: string[]) => validateArrayField(values, 3),
    };
    const form = useFormik({ initialValues, validationSchema });
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
  });

  test("should validate object field with custom validation schema", async () => {
    const initialValues = { address: { street: "", city: "" } };
    const validationSchema = {
      address: (value: { street: string; city: string }) =>
        validateObjectField(value, {
          street: (val) => validateRequiredField(val) || validateMinLength(val, 3),
          city: validateRequiredField,
        }),
    };
    const form = useFormik({ initialValues, validationSchema });
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
  });

  test("should support async custom validation rules", async () => {
    const initialValues = { contact: "" };
    const validationSchema = {
      contact: async (value: string) => {
        await Promise.resolve();
        return value ? undefined : "Contact is required";
      },
    };

    const form = useFormik({ initialValues, validationSchema });

    expect(form.isValidating.value).toBe(true);

    await waitForValidation(form);

    expect(form.errors.contact).toBe("Contact is required");
    expect(form.isValidating.value).toBe(false);
  });

  describe("validation on value update", () => {
    test("should validate form on value update with custom validation schema", async () => {
      const initialValues = { contact: "" };
      const validationSchema = {
        contact: (value: string) => validateRequiredField(value) || validateMinLength(value, 3),
      };
      const form = useFormik({ initialValues, validationSchema });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setValues({ contact: "1" });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setValues({ contact: "123" });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();
    });

    test("should validate array field on value update with custom validation schema", async () => {
      const initialValues = { contacts: ["", ""] };
      const validationSchema = {
        contacts: (values: string[]) => validateArrayField(values, 3),
      };
      const form = useFormik({ initialValues, validationSchema });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setValues({ contacts: ["1", "12"] });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setValues({ contacts: ["123", "123"] });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();
    });

    test("should validate object field on value update with custom validation schema", async () => {
      const initialValues = { address: { street: "", city: "" } };
      const validationSchema = {
        address: (value: { street: string; city: string }) =>
          validateObjectField(value, {
            street: (val) => validateRequiredField(val) || validateMinLength(val, 3),
            city: validateRequiredField,
          }),
      };
      const form = useFormik({
        initialValues,
        validationSchema,
      });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setValues({ address: { street: "1", city: "" } });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setValues({ address: { street: "123", city: "1" } });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();
    });
  });

  describe("validation on blur", () => {
    test("should validate form on blur with custom validation schema", async () => {
      const initialValues = { contact: "" };
      const validationSchema = {
        contact: (value: string) => validateRequiredField(value) || validateMinLength(value, 3),
      };
      const form = useFormik({ initialValues, validationSchema });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setTouched({ contact: true });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();
    });

    test("should validate array field on blur with custom validation schema", async () => {
      const initialValues = { contacts: ["", ""] };
      const validationSchema = {
        contacts: (values: string[]) => validateArrayField(values, 3),
      };
      const form = useFormik({ initialValues, validationSchema });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setTouched({ contacts: [true, true] });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();
    });

    test("should validate object field on blur with custom validation schema", async () => {
      const initialValues = { address: { street: "", city: "" } };
      const validationSchema = {
        address: (value: { street: string; city: string }) =>
          validateObjectField(value, {
            street: (val) => validateRequiredField(val) || validateMinLength(val, 3),
            city: validateRequiredField,
          }),
      };
      const form = useFormik({ initialValues, validationSchema });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();

      form.setTouched({ address: { street: true, city: true } });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();
    });
  });

  test("custom validation with nested objects", async () => {
    const initialValues = {
      address: {
        street: "",
        city: "",
      },
    };

    const validateRequiredField = (value: string | undefined) =>
      value ? undefined : "This field is required";
    const validationSchema = {
      address: {
        street: (value: string) => validateRequiredField(value),
        city: (value: string) => validateRequiredField(value),
      },
    };

    const form = useFormik({
      initialValues,
      validationSchema,
    });
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
  });

  test("custom validation with a function", async () => {
    const initialValues = {
      name: "",
      email: "",
    };

    const validationSchema = (values: typeof initialValues) => {
      const errors: Partial<typeof initialValues> = {};
      if (!values.name) {
        errors.name = "Name is required";
      }
      if (!values.email) {
        errors.email = "Email is required";
      }
      return errors;
    };

    const form = useFormik({
      initialValues,
      validationSchema,
    });
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
  });

  test("dot notation for nested fields", async () => {
    const initialValues = {
      address: {
        street: "",
        city: "",
      },
    };

    const validationSchema = {
      "address.street": (value: string) => validateRequiredField(value),
      "address.city": (value: string) => validateRequiredField(value),
    };

    const form = useFormik({
      initialValues,
      validationSchema,
    });
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
  });

  describe("array fields", () => {
    test("should do well with array fields", async () => {
      const formik = useFormik({
        initialValues: {
          addresses: [""],
        },
        validationSchema: {
          addresses: (values) => {
            if (!values.length) {
              return "Address is required";
            }
            const errors: string[][] = [];
            values.forEach((value) => {
              const e: string[] = [];
              if (!value) {
                e.push("Address is required");
              }
              if (value.length < 3) {
                e.push("Address must be at least 3 characters");
              }
              if (value.length > 50) {
                e.push("Address must be at most 50 characters");
              }
              errors.push(e);
            });
            return errors?.length ? errors : undefined;
          },
        },
      });

      await waitForValidation(formik);
      expect(formik.errors).toMatchSnapshot();

      formik.setFieldValue("addresses[0]", "123 Main St");

      await waitForValidation(formik);

      expect(formik.errors).toMatchSnapshot();
    });
  });
});
