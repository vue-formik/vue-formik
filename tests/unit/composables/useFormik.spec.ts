import { test, expect, describe, vi } from "vitest";
import { useFormik } from "../../../lib";
import { nextTick } from "vue";
import { FormikHelpers } from "../../../lib/types";

describe("useFormik", () => {
  const initialValues = {
    name: "Kiran",
    email: "kiran@parajuli.cc",
    addresses: ["Home", "Office", ""],
  };
  const emptyInitialValues = {
    name: "",
    email: "",
    addresses: ["", "", ""],
  };
  const onSubmit = vi.fn((_values, { setSubmitting }) => {
    setSubmitting(false); // Simulate the completion of the submission process
  });
  const validationSchema = {
    name: (value: string) => (!value ? "Name is required" : undefined),
    email: (value: string) =>
      !value ? "Email is required" : !value.includes("@") ? "Invalid email" : undefined,
    addresses: (value: string[]) => {
      if (!Array.isArray(value)) {
        return "Addresses must be an array";
      }

      if (value.length === 0) {
        return "Address is required";
      }

      const errs = []
      for (let i = 0; i < value.length; i++) {
        if (!value[i]) {
          errs[i] = "Address is required";
        }
      }

      return errs.length ? errs : undefined;
    },
  };

  describe("submit", () => {
    test("should call onSubmit with initial values", () => {
      const { handleSubmit } = useFormik({ initialValues, onSubmit });
      handleSubmit({ preventDefault: vi.fn() });
      expect(onSubmit).toHaveBeenCalledWith(initialValues, expect.any(Object));
    });

    test("'isSubmitting' should return true when form is submitting", async () => {
      const onSubmit = vi.fn((_values, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
        expect(isSubmitting.value).toBe(true);
        setSubmitting(false);
        expect(isSubmitting.value).toBe(false);
      });

      const { isSubmitting, handleSubmit } = useFormik({
        initialValues,
        onSubmit,
      });

      expect(isSubmitting.value).toBe(false);

      handleSubmit({ preventDefault: vi.fn() }); // Simulate form submission

      await nextTick();

      expect(isSubmitting.value).toBe(false); // Verify submission state is reset
    });
  });

  describe("validation", () => {
    test("should handle validation schema errors", async () => {
      const { errors, handleBlur, handleChange } = useFormik({
        initialValues: emptyInitialValues,
        onSubmit,
        validationSchema,
      });

      expect(errors).toEqual({
        name: "Name is required",
        email: "Email is required",
        addresses: [
          "Address is required",
          "Address is required",
          "Address is required",
        ]
      });

      handleChange({ target: { name: "name", value: "Kiran" } });
      handleBlur({ target: { name: "name" } });

      await nextTick();

      expect(errors.name).toBeUndefined();
      expect(errors.email).toBe("Email is required");
    });

    test("should handle non-array values for addresses field", () => {
      const { errors } = useFormik({
        initialValues: { addresses: "Invalid Value" }, // Pass a non-array value
        onSubmit,
        validationSchema,
      });

      expect(errors.addresses).toBe("Addresses must be an array");
    });

    test("should handle empty validation schema", () => {
      const { errors } = useFormik({ initialValues, onSubmit });
      expect(errors).toEqual({});
    });
  });

  describe("state updates", () => {
    test("should update touched fields", async () => {
      const { setFieldTouched, touched } = useFormik({ initialValues, onSubmit });
      setFieldTouched("name", true);

      await nextTick();

      expect(touched.name).toBe(true);
    });

    test("should update field values", () => {
      const { setFieldValue, values } = useFormik({ initialValues, onSubmit });
      setFieldValue("name", "Updated Name");

      expect(values.name).toBe("Updated Name");
    });

    test("should reset form state", async () => {
      const {
        reset,
        values,
        touched,
        setFieldValue,
        setFieldTouched
      } = useFormik({ initialValues, onSubmit });

      setFieldValue("name", "New Name");
      setFieldTouched("name", true);

      await nextTick();

      reset();

      await nextTick();

      expect(values).toEqual(initialValues);
      expect(touched).toEqual({});
    });
  });

  describe("field errors", () => {
    test("should return field error if present", async () => {
      const { getFieldError, setFieldValue, setFieldTouched } = useFormik({
        initialValues,
        onSubmit,
        validationSchema,
      });

      setFieldValue("name", "");
      setFieldTouched("name", true);

      await nextTick();

      expect(getFieldError("name")).toBe("Name is required");
    });

    test("should return true for hasFieldError if error exists", async () => {
      const { hasFieldError, setFieldValue, setFieldTouched } = useFormik({
        initialValues,
        onSubmit,
        validationSchema,
      });

      setFieldValue("name", "");
      setFieldTouched("name", true);

      await nextTick();

      expect(hasFieldError("name")).toBe(true);
    });
  });
});
