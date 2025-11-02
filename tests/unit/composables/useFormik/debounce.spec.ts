import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { useFormik } from "@/index";
import { nextTick } from "vue";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

const waitForValidation = async (form: ReturnType<typeof useFormik>) => {
  await flush();
  let attempts = 0;
  const maxAttempts = 50;
  while (form.isValidating.value && attempts < maxAttempts) {
    await flush();
    attempts++;
  }
  // Wait a bit more to ensure validation completes
  vi.advanceTimersByTime(50);
  await flush();
};

describe("useFormik debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("validationDebounce", () => {
    test("should debounce validation when delay is set", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            validateSpy();
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 300,
        validateOnMount: false,
      });

      await flush();

      // Set value multiple times rapidly
      form.setFieldValue("name", "a");
      form.setFieldValue("name", "ab");
      form.setFieldValue("name", "abc");

      // Should not have validated yet
      await flush();
      expect(form.isValidating.value).toBe(false);
      expect(validateSpy).not.toHaveBeenCalled();

      // Fast-forward time by debounce delay
      vi.advanceTimersByTime(300);
      await waitForValidation(form);

      // Should have validated only once with final value
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(form.errors).toEqual({});
    });

    test("should cancel previous debounced validation on new change", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            validateSpy();
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 300,
        validateOnMount: false,
      });

      await flush();

      // First change
      form.setFieldValue("name", "a");
      await flush();

      // Advance time but not enough
      vi.advanceTimersByTime(150);
      await flush();
      expect(validateSpy).not.toHaveBeenCalled();

      // Second change should cancel previous (use valid value)
      form.setFieldValue("name", "abc");
      await flush();

      // Advance time by full debounce delay
      vi.advanceTimersByTime(300);
      await waitForValidation(form);

      // Should have validated only once (the second change)
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(form.errors).toEqual({});
    });

    test("should not debounce when delay is 0", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            validateSpy();
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 0,
        validateOnMount: false,
      });

      await flush();

      form.setFieldValue("name", "abc");
      await waitForValidation(form);

      // Should have validated immediately
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(form.errors).toEqual({});
    });

    test("should debounce async validation", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: async (value: string) => {
            validateSpy();
            await new Promise((resolve) => setTimeout(resolve, 50));
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 200,
        validateOnMount: false,
      });

      await flush();

      // Multiple rapid changes
      form.setFieldValue("name", "a");
      form.setFieldValue("name", "ab");
      form.setFieldValue("name", "abc");

      await flush();
      expect(validateSpy).not.toHaveBeenCalled();

      // Fast-forward debounce delay
      vi.advanceTimersByTime(200);

      // Fast-forward async validation delay
      vi.advanceTimersByTime(50);
      await waitForValidation(form);

      // Should have validated only once
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(form.errors).toEqual({});
    });

    test("should debounce validation for multiple fields", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { name: "", email: "" },
        validationSchema: {
          name: (value: string) => {
            validateSpy();
            return value.length < 3 ? "Name too short" : undefined;
          },
          email: (value: string) => {
            validateSpy();
            return !value.includes("@") ? "Invalid email" : undefined;
          },
        },
        validationDebounce: 250,
        validateOnMount: false,
      });

      await flush();

      // Change multiple fields rapidly
      form.setFieldValue("name", "a");
      form.setFieldValue("email", "invalid");
      form.setFieldValue("name", "ab");
      form.setFieldValue("email", "test@");
      form.setFieldValue("name", "John");
      form.setFieldValue("email", "test@example.com");

      await flush();
      expect(validateSpy).not.toHaveBeenCalled();

      // Fast-forward debounce delay
      vi.advanceTimersByTime(250);
      await waitForValidation(form);

      // Should validate all fields once
      expect(validateSpy).toHaveBeenCalledTimes(2); // Once for each field
      expect(form.errors).toEqual({});
    });

    test("should use latest values when debounced validation executes", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 300,
        validateOnMount: false,
      });

      await flush();

      // Start with invalid value
      form.setFieldValue("name", "a");
      await flush();

      // Change to valid value before debounce completes
      form.setFieldValue("name", "abc");
      await flush();

      // Fast-forward debounce delay
      vi.advanceTimersByTime(300);
      await waitForValidation(form);

      // Should validate with latest (valid) value
      expect(form.errors).toEqual({});
      expect(form.values.name).toBe("abc");
    });

    test("should handle rapid changes correctly with debounce", async () => {
      const validateCallCounts: number[] = [];

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            validateCallCounts.push(validateCallCounts.length + 1);
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 200,
        validateOnMount: false,
      });

      await flush();

      // Rapid sequence of changes
      form.setFieldValue("name", "a");
      await flush();
      vi.advanceTimersByTime(100);

      form.setFieldValue("name", "ab");
      await flush();
      vi.advanceTimersByTime(100);

      form.setFieldValue("name", "abc");
      await flush();

      // Fast-forward remaining debounce time
      vi.advanceTimersByTime(200);
      await waitForValidation(form);

      // Should have validated only once (final value)
      expect(validateCallCounts.length).toBe(1);
      expect(form.errors).toEqual({});
    });

    test("should not debounce if validateOnChange is false", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            validateSpy();
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 300,
        validateOnChange: false,
        validateOnMount: false,
      });

      await flush();

      // Change value
      form.setFieldValue("name", "abc");
      await flush();

      // Fast-forward time
      vi.advanceTimersByTime(300);
      await flush();

      // Should not have validated (validateOnChange is false)
      expect(validateSpy).not.toHaveBeenCalled();
    });

    test("should trigger validation on blur regardless of debounce", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            validateSpy();
            return value.length < 3 ? "Name too short" : undefined;
          },
        },
        validationDebounce: 200,
        validateOnMount: false,
      });

      await flush();

      // Trigger blur event
      const blurEvent = new FocusEvent("blur", { bubbles: true });
      Object.defineProperty(blurEvent, "target", {
        value: { name: "name" },
        enumerable: true,
      });

      form.handleFieldBlur(blurEvent);

      // validateOnBlur triggers validation immediately (not debounced)
      vi.advanceTimersByTime(100);
      await waitForValidation(form);

      // Should have validated immediately (validateOnBlur doesn't use debounce)
      expect(validateSpy).toHaveBeenCalled();
      expect(form.errors.name).toBe("Name too short");
    });

    test("should debounce validation with nested object fields", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { user: { name: "", email: "" } },
        validationSchema: {
          user: (value: { name: string; email: string }) => {
            validateSpy();
            const errors: { name?: string; email?: string } = {};
            if (value.name.length < 3) {
              errors.name = "Name too short";
            }
            if (!value.email.includes("@")) {
              errors.email = "Invalid email";
            }
            return Object.keys(errors).length > 0 ? errors : undefined;
          },
        },
        validationDebounce: 250,
        validateOnMount: false,
      });

      await flush();

      // Rapid changes to nested fields
      form.setFieldValue("user.name", "a");
      form.setFieldValue("user.email", "invalid");
      form.setFieldValue("user.name", "ab");
      form.setFieldValue("user.email", "test@");
      form.setFieldValue("user.name", "John");
      form.setFieldValue("user.email", "john@example.com");

      await flush();
      expect(validateSpy).not.toHaveBeenCalled();

      // Fast-forward debounce delay
      vi.advanceTimersByTime(250);
      await waitForValidation(form);

      // Should have validated once with final values
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(form.errors).toEqual({});
    });

    test("should debounce validation with array fields", async () => {
      const validateSpy = vi.fn();

      const form = useFormik({
        initialValues: { tags: [] as string[] },
        validationSchema: {
          tags: (value: string[]) => {
            validateSpy();
            return value.some((tag) => tag.length < 2) ? "Tag too short" : undefined;
          },
        },
        validationDebounce: 200,
        validateOnMount: false,
      });

      await flush();

      // Rapid changes to array
      form.setFieldValue("tags", ["a"]);
      form.setFieldValue("tags", ["ab"]);
      form.setFieldValue("tags", ["abc"]);

      await flush();
      expect(validateSpy).not.toHaveBeenCalled();

      // Fast-forward debounce delay
      vi.advanceTimersByTime(200);
      await waitForValidation(form);

      // Should have validated once
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(form.errors).toEqual({});
    });
  });
});
