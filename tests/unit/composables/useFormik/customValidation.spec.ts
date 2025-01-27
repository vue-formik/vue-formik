import { test, expect, describe } from "vitest";
import { useFormik } from "../../../../lib";
import { nextTick } from "vue";

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

describe("useFormik custom validation", async () => {
  test("should validate form with custom validation schema", async () => {
    const initialValues = { contact: "" };
    const validationSchema = {
      contact: (value: string) => validateRequiredField(value),
    };
    const { errors } = useFormik({ initialValues, validationSchema });
    expect(errors).toMatchSnapshot();
  });

  test("should validate array field with custom validation schema", async () => {
    const initialValues = { contacts: ["", ""] };
    const validationSchema = {
      contacts: (values: string[]) => validateArrayField(values, 3),
    };
    const { errors } = useFormik({ initialValues, validationSchema });
    expect(errors).toMatchSnapshot();
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
    const { errors } = useFormik({ initialValues, validationSchema });
    await nextTick();
    expect(errors).toMatchSnapshot();
  });

  describe("validation on value update", () => {
    test("should validate form on value update with custom validation schema", async () => {
      const initialValues = { contact: "" };
      const validationSchema = {
        contact: (value: string) => validateRequiredField(value) || validateMinLength(value, 3),
      };
      const { errors, setValues } = useFormik({ initialValues, validationSchema });
      expect(errors).toMatchSnapshot();

      setValues({ contact: "1" });
      await nextTick();
      expect(errors).toMatchSnapshot();

      setValues({ contact: "123" });
      await nextTick();
      expect(errors).toMatchSnapshot();
    });

    test("should validate array field on value update with custom validation schema", async () => {
      const initialValues = { contacts: ["", ""] };
      const validationSchema = {
        contacts: (values: string[]) => validateArrayField(values, 3),
      };
      const { errors, setValues } = useFormik({ initialValues, validationSchema });
      expect(errors).toMatchSnapshot();

      setValues({ contacts: ["1", "12"] });
      await nextTick();
      expect(errors).toMatchSnapshot();

      setValues({ contacts: ["123", "123"] });
      await nextTick();
      expect(errors).toMatchSnapshot();
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
      const { errors, setValues } = useFormik({
        initialValues,
        validationSchema,
      });
      await nextTick();
      expect(errors).toMatchSnapshot();

      setValues({ address: { street: "1", city: "" } });
      await nextTick();
      expect(errors).toMatchSnapshot();

      setValues({ address: { street: "123", city: "1" } });
      await nextTick();
      expect(errors).toMatchSnapshot();
    });
  });

  describe("validation on blur", () => {
    test("should validate form on blur with custom validation schema", async () => {
      const initialValues = { contact: "" };
      const validationSchema = {
        contact: (value: string) => validateRequiredField(value) || validateMinLength(value, 3),
      };
      const { errors, setTouched } = useFormik({ initialValues, validationSchema });
      expect(errors).toMatchSnapshot();

      setTouched({ contact: true });
      expect(errors).toMatchSnapshot();
    });

    test("should validate array field on blur with custom validation schema", async () => {
      const initialValues = { contacts: ["", ""] };
      const validationSchema = {
        contacts: (values: string[]) => validateArrayField(values, 3),
      };
      const { errors, setTouched } = useFormik({ initialValues, validationSchema });
      expect(errors).toMatchSnapshot();

      setTouched({ contacts: [true, true] });
      expect(errors).toMatchSnapshot();
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
      const { errors, setTouched } = useFormik({ initialValues, validationSchema });
      expect(errors).toMatchSnapshot();

      setTouched({ address: { street: true, city: true } });
      expect(errors).toMatchSnapshot();
    });
  });

  test("custom validation with nested objects", () => {
    const initialValues = {
      address: {
        street: "",
        city: "",
      },
    };

    const validationSchema = {
      address: {
        street: (value: string) => validateRequiredField(value),
        city: (value: string) => validateRequiredField(value),
      },
    };

    const { errors } = useFormik({ initialValues, validationSchema });
    expect(errors).toMatchSnapshot();
  });

  test("custom validation with a function", () => {
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

    const { errors } = useFormik({
      initialValues,
      validationSchema,
    });
    expect(errors).toMatchSnapshot();
  });

  test("dot notation for nested fields", () => {
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

    const { errors } = useFormik({ initialValues, validationSchema });
    expect(errors).toMatchSnapshot();
  });
});
