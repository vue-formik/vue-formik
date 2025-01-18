import { describe, test, expect, vi } from "vitest";
import { nextTick } from "vue";
import * as yup from "yup";
import { useFormik } from "@/index";

/**
 * Test fixtures
 */
const complexSchema = yup.object({
  user: yup.object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    age: yup.number().min(18, "Must be at least 18"),
  }),
  addresses: yup
    .array()
    .of(
      yup.object({
        street: yup.string().required("Street is required"),
        city: yup.string().required("City is required"),
        country: yup.string().required("Country is required"),
      }),
    )
    .min(1, "At least one address required"),
  preferences: yup.object({
    newsletter: yup.boolean(),
    theme: yup.string().oneOf(["light", "dark"], "Invalid theme"),
  }),
});

const initialComplexValues = {
  user: {
    name: "",
    email: "",
    age: 0,
  },
  addresses: [
    {
      street: "",
      city: "",
      country: "",
    },
  ],
  preferences: {
    newsletter: false,
    theme: "light",
  },
};

describe("useFormik Error Handling", () => {
  describe("Validation State Management", () => {
    test("should track validation state correctly", async () => {
      const formik = useFormik({
        initialValues: initialComplexValues,
        validationSchema: complexSchema,
        validateOnMount: false,
        mode: "YUP",
      });

      expect(formik.isValidating.value).toBe(false);

      // Trigger validation
      formik.setFieldValue("user.email", "invalid-email");
      await nextTick();

      expect(formik.hasFieldError("user.email")).toBe(false);
      formik.setFieldTouched("user.email", true);
      await nextTick();
      expect(formik.hasFieldError("user.email")).toBe(true);
      expect(formik.getFieldError("user.email")).toBe("Invalid email");
    });

    test("should handle multiple error states simultaneously", async () => {
      const formik = useFormik({
        initialValues: initialComplexValues,
        validationSchema: complexSchema,
        mode: "YUP",
      });

      // Set multiple invalid fields
      formik.setFieldValue("user.email", "invalid");
      formik.setFieldValue("user.age", 16);
      formik.setFieldTouched("user.email", true);
      formik.setFieldTouched("user.age", true);

      await nextTick();

      expect(formik.hasFieldError("user.email")).toBe(true);
      expect(formik.hasFieldError("user.age")).toBe(true);
      expect(formik.isValid.value).toBe(false);
    });
  });

  describe("Nested Object Validation", () => {
    test("should validate nested object fields correctly", async () => {
      const formik = useFormik({
        initialValues: initialComplexValues,
        validationSchema: complexSchema,
        mode: "YUP",
      });

      formik.setFieldValue("user.name", "");
      formik.setFieldTouched("user.name", true);
      await nextTick();

      expect(formik.getFieldError("user.name")).toBe("Name is required");

      formik.setFieldValue("user.name", "John");
      await nextTick();
      expect(formik.getFieldError("user.name")).toBe("");
    });
  });

  describe("Array Field Validation", () => {
    test("should validate array fields correctly", async () => {
      const formik = useFormik({
        initialValues: initialComplexValues,
        validationSchema: complexSchema,
        mode: "YUP",
      });

      formik.setFieldTouched("addresses[0].street", true);
      await nextTick();
      expect(formik.getFieldError("addresses[0].street")).toBe("Street is required");

      formik.setFieldValue("addresses[0].street", "123 Main St");
      await nextTick();
      expect(formik.getFieldError("addresses[0].street")).toBe("");
    });
  });

  describe("Error Clearing", () => {
    test("should clear errors on reset", async () => {
      const formik = useFormik({
        initialValues: initialComplexValues,
        validationSchema: complexSchema,
        mode: "YUP",
      });

      // Set some errors
      formik.setFieldValue("user.email", "invalid");
      formik.setFieldTouched("user.email", true);
      await nextTick();
      expect(formik.hasFieldError("user.email")).toBe(true);

      // Reset form
      formik.reset();
      await nextTick();
      expect(formik.hasFieldError("user.email")).toBe(false);
    });

    test("should clear specific field errors", async () => {
      const formik = useFormik({
        initialValues: initialComplexValues,
        validationSchema: complexSchema,
        mode: "YUP",
      });

      // Set multiple errors
      formik.setFieldValue("user.email", "invalid");
      formik.setFieldValue("user.age", 16);
      formik.setFieldTouched("user.email", true);
      formik.setFieldTouched("user.age", true);
      await nextTick();

      // Fix one field
      formik.setFieldValue("user.email", "valid@email.com");
      await nextTick();

      expect(formik.hasFieldError("user.email")).toBe(false);
      expect(formik.hasFieldError("user.age")).toBe(true);
    });
  });

  describe("Submit Validation", () => {
    test("should validate all fields on submit", async () => {
      const onSubmit = vi.fn();
      const formik = useFormik({
        initialValues: initialComplexValues,
        validationSchema: complexSchema,
        onSubmit,
        mode: "YUP",
      });

      formik.handleSubmit();
      await nextTick();

      expect(onSubmit).not.toHaveBeenCalled();
      expect(formik.isValid.value).toBe(false);

      // Fix required fields
      formik.setFieldValue("user.name", "John");
      formik.setFieldValue("user.email", "john@example.com");
      formik.setFieldValue("user.age", 20);
      formik.setFieldValue("addresses[0].street", "123 Main St");
      formik.setFieldValue("addresses[0].city", "Boston");
      formik.setFieldValue("addresses[0].country", "USA");

      await nextTick();
      formik.handleSubmit();
      await nextTick();

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Custom Validation", () => {
    test("should handle custom validation functions", async () => {
      const customValidation = {
        "user.password": (value: string) =>
          !value ? "Password required" : value.length < 8 ? "Password too short" : undefined,
      };

      const formik = useFormik({
        initialValues: { user: { password: "" } },
        validationSchema: customValidation,
      });

      formik.setFieldTouched("user.password", true);
      await nextTick();
      expect(formik.getFieldError("user.password")).toBe("Password required");

      formik.setFieldValue("user.password", "123");
      await nextTick();
      expect(formik.getFieldError("user.password")).toBe("Password too short");

      formik.setFieldValue("user.password", "12345678");
      await nextTick();
      expect(formik.getFieldError("user.password")).toBe("");
    });
  });
});
