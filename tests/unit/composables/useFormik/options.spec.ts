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
  while (form.isValidating.value) {
    await flush();
  }
};

describe("useFormik options", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe("validateOnChange", () => {
    test("should validate on change when enabled (default)", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
        validateOnMount: false,
      });

      await flush();
      expect(form.errors).toEqual({});

      form.setFieldValue("name", "ab");
      await waitForValidation(form);
      expect(form.errors.name).toBe("Name too short");
    });

    test("should not validate on change when disabled", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
        validateOnChange: false,
        validateOnMount: false,
        onSubmit: vi.fn(),
      });

      await flush();
      form.setFieldValue("name", "ab");

      // Should not have errors yet since validateOnChange is false
      await flush();
      expect(form.errors).toEqual({});

      // Submit should still trigger validation
      form.handleSubmit();
      await waitForValidation(form);
      expect(form.errors.name).toBe("Name too short");
    });
  });

  describe("validateOnBlur", () => {
    test("should validate on blur when enabled (default)", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
        validateOnMount: false,
      });

      await flush();

      // Simulate blur event
      const blurEvent = new FocusEvent("blur", { bubbles: true });
      Object.defineProperty(blurEvent, "target", {
        value: { name: "name" },
        enumerable: true,
      });

      form.handleFieldBlur(blurEvent);
      await waitForValidation(form);
      expect(form.errors.name).toBe("Name too short");
    });

    test("should not validate on blur when disabled", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
        validateOnBlur: false,
        validateOnMount: false,
      });

      await flush();

      const blurEvent = new FocusEvent("blur", { bubbles: true });
      Object.defineProperty(blurEvent, "target", {
        value: { name: "name" },
        enumerable: true,
      });

      form.handleFieldBlur(blurEvent);
      await flush();

      expect(form.errors).toEqual({});
      expect(form.touched.name).toBe(true);
    });
  });

  describe("validateOnMount", () => {
    test("should validate on mount when enabled (default)", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
      });

      await waitForValidation(form);
      expect(form.errors.name).toBe("Name too short");
    });

    test("should not validate on mount when disabled", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
        validateOnMount: false,
      });

      await flush();
      expect(form.errors).toEqual({});
    });
  });

  describe("validationDebounce", () => {
    test("should debounce validation when delay is set", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
        validationDebounce: 300,
      });

      await waitForValidation(form);

      // Set value multiple times rapidly
      form.setFieldValue("name", "a");
      form.setFieldValue("name", "ab");
      form.setFieldValue("name", "abc");

      // Should not have validated yet
      await flush();
      expect(form.isValidating.value).toBe(false);

      // Fast-forward time
      vi.advanceTimersByTime(300);
      await waitForValidation(form);

      // Should have validated only once with final value
      expect(form.errors).toEqual({});
    });

    test("should not debounce when delay is 0 (default)", async () => {
      const form = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => (value.length < 3 ? "Name too short" : undefined),
        },
        validationDebounce: 0,
      });

      await waitForValidation(form);
      form.setFieldValue("name", "ab");
      await waitForValidation(form);

      expect(form.errors.name).toBe("Name too short");
    });
  });

  describe("initialErrors", () => {
    test("should set initial errors", () => {
      const form = useFormik({
        initialValues: { name: "" },
        initialErrors: {
          name: "Initial error",
        },
      });

      expect(form.errors.name).toBe("Initial error");
    });

    test("should be overwritten by validation errors on mount", async () => {
      const form = useFormik({
        initialValues: { name: "", age: 0 },
        initialErrors: {
          name: "Initial name error",
        },
        validationSchema: {
          age: (value: number) => (value < 18 ? "Must be 18+" : undefined),
        },
        validateOnMount: true,
      });

      await waitForValidation(form);
      // Initial errors are overwritten by validation
      expect(form.errors.name).toBeUndefined();
      expect(form.errors.age).toBe("Must be 18+");
    });

    test("should persist if validation doesn't run", async () => {
      const form = useFormik({
        initialValues: { name: "", age: 0 },
        initialErrors: {
          name: "Initial name error",
        },
        validateOnMount: false,
      });

      await flush();
      expect(form.errors.name).toBe("Initial name error");
    });
  });

  describe("initialTouched", () => {
    test("should set initial touched state", () => {
      const form = useFormik({
        initialValues: { name: "", email: "" },
        initialTouched: {
          name: true,
        },
      });

      expect(form.touched.name).toBe(true);
      expect(form.touched.email).toBeUndefined();
    });

    test("should display errors for touched fields", () => {
      const form = useFormik({
        initialValues: { name: "", email: "" },
        initialErrors: {
          name: "Name error",
          email: "Email error",
        },
        initialTouched: {
          name: true,
        },
      });

      expect(form.hasFieldError("name")).toBe(true);
      expect(form.hasFieldError("email")).toBe(false);
      expect(form.getFieldError("name")).toBe("Name error");
      expect(form.getFieldError("email")).toBe("");
    });
  });
});
