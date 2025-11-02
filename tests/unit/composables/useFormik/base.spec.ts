import { describe, expect, test } from "vitest";
import { useFormik } from "../../../../lib";
import { nextTick } from "vue";
import { emptyInitialValues, initialValues, onSubmit, validationSchema } from "./fixtures";

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

describe("useFormik base features", () => {
  test("should initialize form with initial values", () => {
    const { values } = useFormik({ initialValues, onSubmit });
    expect(values).toMatchSnapshot();
  });
  test("should set values", () => {
    const { setValues, values } = useFormik({ initialValues, onSubmit });
    setValues({ name: "Updated Name" });
    expect(values).toMatchSnapshot();
  });

  test("should set errors", () => {
    const { setErrors, errors } = useFormik({ initialValues, onSubmit });
    setErrors({ name: "Value must be less than 255 characters" });
    expect(errors).toMatchSnapshot();
  });

  test("should reset form", async () => {
    const form = useFormik({
      initialValues,
      onSubmit,
    });

    form.setFieldTouched("name", true);
    form.setFieldTouched("email", true);
    form.setFieldValue("name", "Updated Name");
    form.setFieldValue("email", "updated@mail.cc");

    await waitForValidation(form);

    expect(form.values).toMatchSnapshot();
    expect(form.touched).toMatchSnapshot();

    form.reset();

    await waitForValidation(form);

    expect(form.values).toMatchSnapshot();
    expect(form.touched).toMatchSnapshot();
  });

  test("should set field value", () => {
    const { setFieldValue, values } = useFormik({ initialValues, onSubmit });
    setFieldValue("name", "Updated Name");
    expect(values).toMatchSnapshot();
  });

  test("should set field touched", () => {
    const { setFieldTouched, touched } = useFormik({ initialValues, onSubmit });
    setFieldTouched("name", true);
    expect(touched).toMatchSnapshot();
  });

  describe("status", () => {
    test("'isValid' should return true when form is valid", async () => {
      const form = useFormik({
        initialValues,
        onSubmit,
        validationSchema,
      });
      await waitForValidation(form);
      expect(form.isValid.value).toBe(true);

      form.handleFieldChange({ target: { name: "email", value: "Kiran" } } as never as Event);
      form.handleFieldBlur({ target: { name: "email" } } as never as FocusEvent);

      await waitForValidation(form);

      expect(form.isValid.value).toBe(false);
    });
    test("'isDirty' should return true when form is dirty", async () => {
      const form = useFormik({
        initialValues,
        onSubmit,
        validationSchema,
      });
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(false);

      form.handleFieldChange({ target: { name: "email", value: "Kiran" } } as never as Event);
      form.handleFieldBlur({ target: { name: "email" } } as never as FocusEvent);

      await waitForValidation(form);

      expect(form.isDirty.value).toBe(true);

      form.reset();

      await waitForValidation(form);

      expect(form.isDirty.value).toBe(false);
    });
  });
  describe("setSubmitting", () => {
    test("should set isSubmitting to true", () => {
      const { setSubmitting, isSubmitting } = useFormik({ initialValues, onSubmit });
      setSubmitting(true);
      expect(isSubmitting.value).toBe(true);
    });
    test("should set isSubmitting to false", () => {
      const { setSubmitting, isSubmitting } = useFormik({ initialValues, onSubmit });
      setSubmitting(true);
      expect(isSubmitting.value).toBe(true);
      setSubmitting(false);
      expect(isSubmitting.value).toBe(false);
    });
  });

  describe("validate on mount", () => {
    test("should validate on mount when turned on", async () => {
      const form = useFormik({
        initialValues: emptyInitialValues,
        onSubmit,
        validationSchema,
        validateOnMount: true,
      });
      await waitForValidation(form);
      expect(form.errors).toMatchSnapshot();
    });
    test("should not validate on mount when turned off", () => {
      const { errors } = useFormik({
        initialValues: emptyInitialValues,
        onSubmit,
        validationSchema,
        validateOnMount: false,
      });
      expect(errors).toEqual({});
    });
  });
});
