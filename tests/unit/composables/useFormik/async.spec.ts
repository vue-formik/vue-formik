import { describe, expect, test, vi } from "vitest";
import { useFormik } from "@/index";
import { nextTick } from "vue";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

const waitForValidation = async (form: ReturnType<typeof useFormik>, timeout = 500) => {
  await flush();
  const startTime = Date.now();
  // Wait for validation to complete (check flag if it exists, otherwise just wait)
  while (form.isValidating.value && Date.now() - startTime < timeout) {
    await flush();
  }
  // Always wait a bit more to ensure validation completes
  await new Promise((resolve) => setTimeout(resolve, 50));
  await flush();
};

const waitForSubmission = async (form: ReturnType<typeof useFormik>, timeout = 500) => {
  await flush();
  const startTime = Date.now();
  // Wait for submission to complete (check flag if it exists, otherwise just wait)
  while (form.isSubmitting.value && Date.now() - startTime < timeout) {
    await flush();
  }
  // Always wait a bit more to ensure submission completes
  await new Promise((resolve) => setTimeout(resolve, 50));
  await flush();
};

describe("useFormik async/sync support", () => {
  describe("onSubmit - async", () => {
    test("should handle async onSubmit function", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockSubmit = vi.fn(async (_values) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const form = useFormik({
        initialValues: { name: "" },
        onSubmit: mockSubmit,
        validateOnMount: false,
      });

      form.handleSubmit();
      expect(form.isSubmitting.value).toBe(true);

      await waitForSubmission(form);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(form.isSubmitting.value).toBe(false);
    });

    test("should handle async onSubmit with validation errors", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockSubmit = vi.fn(async (_values) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Too short" : undefined),
        },
        onSubmit: mockSubmit,
      });

      form.handleSubmit();
      await waitForValidation(form);

      // Should not call onSubmit because validation failed
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe("onSubmit - sync", () => {
    test("should handle sync onSubmit function", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockSubmit = vi.fn((_values) => {
        // Sync function
      });

      const form = useFormik({
        initialValues: { name: "test" },
        onSubmit: mockSubmit,
        validateOnMount: false,
      });

      form.handleSubmit();
      await waitForSubmission(form);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(form.isSubmitting.value).toBe(false);
    });

    test("should set submitting flag correctly for sync onSubmit", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockSubmit = vi.fn((_values) => {
        // Sync function
      });

      const form = useFormik({
        initialValues: { name: "test" },
        onSubmit: mockSubmit,
        validateOnMount: false,
      });

      form.handleSubmit();

      // Should be submitting during execution
      expect(form.isSubmitting.value).toBe(true);

      await waitForSubmission(form);

      // Should be false after completion
      expect(form.isSubmitting.value).toBe(false);
    });
  });

  describe("validationSchema - async", () => {
    test("should handle async validation functions", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: async (value: string) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return value.length < 3 ? "Too short" : undefined;
          },
        },
        validateOnMount: false,
        validationDebounce: 0, // Disable debounce for faster tests
      });

      form.setFieldValue("name", "ab");
      await flush(); // Wait for debounce
      await waitForValidation(form);

      expect(form.errors.name).toBe("Too short");
    });

    test("should handle async validation with multiple fields", async () => {
      const form = useFormik({
        initialValues: { name: "", email: "" },
        validationSchema: {
          name: async (value: string) => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            return value.length < 3 ? "Name too short" : undefined;
          },
          email: async (value: string) => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            return !value.includes("@") ? "Invalid email" : undefined;
          },
        },
        validateOnMount: false,
        validationDebounce: 0, // Disable debounce for faster tests
      });

      form.setFieldValue("name", "ab");
      form.setFieldValue("email", "invalid");
      await waitForValidation(form);

      expect(form.errors.name).toBe("Name too short");
      expect(form.errors.email).toBe("Invalid email");
    });
  });

  describe("validationSchema - sync", () => {
    test("should handle sync validation functions", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            return value.length < 3 ? "Too short" : undefined;
          },
        },
        validateOnMount: false,
        validationDebounce: 0, // Disable debounce for faster tests
      });

      form.setFieldValue("name", "ab");
      await flush(); // Wait for debounce
      await waitForValidation(form);

      expect(form.errors.name).toBe("Too short");
    });

    test("should handle sync validation with multiple fields", async () => {
      const form = useFormik({
        initialValues: { name: "", email: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
          email: (value: string) => (!value.includes("@") ? "Invalid email" : undefined),
        },
        validateOnMount: false,
        validationDebounce: 0, // Disable debounce for faster tests
      });

      form.setFieldValue("name", "ab");
      form.setFieldValue("email", "invalid");
      await flush(); // Wait for debounce
      await waitForValidation(form);

      expect(form.errors.name).toBe("Name too short");
      expect(form.errors.email).toBe("Invalid email");
    });
  });

  describe("mixed async/sync", () => {
    test("should handle mix of async and sync validations", async () => {
      const form = useFormik({
        initialValues: { name: "", email: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
          email: async (value: string) => {
            await new Promise((resolve) => setTimeout(resolve, 5));
            return !value.includes("@") ? "Invalid email" : undefined;
          },
        },
        validateOnMount: false,
        validationDebounce: 0, // Disable debounce for faster tests
      });

      form.setFieldValue("name", "ab");
      form.setFieldValue("email", "invalid");
      await flush(); // Wait for debounce
      await waitForValidation(form);

      expect(form.errors.name).toBe("Name too short");
      expect(form.errors.email).toBe("Invalid email");
    });

    test("should handle async onSubmit with sync validation", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockSubmit = vi.fn(async (_values) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Too short" : undefined),
        },
        onSubmit: mockSubmit,
        validateOnMount: false,
      });

      // First attempt with invalid data
      form.setFieldValue("name", "ab");
      form.handleSubmit();
      await waitForValidation(form);
      expect(mockSubmit).not.toHaveBeenCalled();

      // Second attempt with valid data
      form.setFieldValue("name", "John");
      form.handleSubmit();
      await waitForValidation(form);
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });

    test("should handle sync onSubmit with async validation", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockSubmit = vi.fn((_values) => {
        // Sync function
      });

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: async (value: string) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return value.length < 3 ? "Too short" : undefined;
          },
        },
        onSubmit: mockSubmit,
        validateOnMount: false,
      });

      // First attempt with invalid data
      form.setFieldValue("name", "ab");
      form.handleSubmit();
      await waitForValidation(form);
      expect(mockSubmit).not.toHaveBeenCalled();

      // Second attempt with valid data
      form.setFieldValue("name", "John");
      form.handleSubmit();
      await waitForValidation(form);
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    test("should handle async onSubmit errors gracefully", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mockSubmit = vi.fn(async (_values) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error("Submission failed");
      });

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const form = useFormik({
        initialValues: { name: "test" },
        onSubmit: mockSubmit,
      });

      form.handleSubmit();
      await waitForSubmission(form);

      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Form submission error:", expect.any(Error));
      expect(form.isSubmitting.value).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    test("should handle async validation errors gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          name: async (_value: string) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            throw new Error("Validation failed");
          },
        },
        validateOnMount: false,
        validationDebounce: 0, // Disable debounce
      });

      form.setFieldValue("name", "test");
      await flush(); // Wait a bit for debounce
      await waitForValidation(form, 3000);

      // Should clear errors on validation failure
      expect(form.errors).toEqual({});

      consoleErrorSpy.mockRestore();
    });
  });

  describe("race conditions", () => {
    test("should only use latest validation result when multiple validations run", async () => {
      const validationResults: number[] = [];

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          name: async (_value: string) => {
            const id = Math.random();
            validationResults.push(id);
            await new Promise((resolve) => setTimeout(resolve, 20));
            return id === validationResults[validationResults.length - 1] ? undefined : "Outdated";
          },
        },
        validateOnMount: false,
        validationDebounce: 10,
      });

      // Trigger multiple rapid changes
      form.setFieldValue("name", "a");
      form.setFieldValue("name", "ab");
      form.setFieldValue("name", "abc");

      await waitForValidation(form);

      // Should not have errors if last validation passed
      expect(form.errors.name).toBeUndefined();
    });
  });
});
