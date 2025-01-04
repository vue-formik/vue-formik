import { describe, expect, test } from "vitest";
import { useFormik } from "../../../../lib";
import { nextTick } from "vue";
import { initialValues, onSubmit, validationSchema } from "./fixtures";

describe("useFormik base features", async () => {
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
    const { reset, values, touched, setFieldTouched, setFieldValue } = useFormik({
      initialValues,
      onSubmit,
    });

    setFieldTouched("name", true);
    setFieldTouched("email", true);
    setFieldValue("name", "Updated Name");
    setFieldValue("email", "updated@mail.cc");

    await nextTick();

    expect(values).toMatchSnapshot();
    expect(touched).toMatchSnapshot();

    reset();

    await nextTick();

    expect(values).toMatchSnapshot();
    expect(touched).toMatchSnapshot();
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
      const { isValid, handleFieldChange, handleFieldBlur } = useFormik({
        initialValues,
        onSubmit,
        validationSchema,
      });
      expect(isValid.value).toBe(true);

      handleFieldChange({ target: { name: "email", value: "Kiran" } } as never as Event);
      handleFieldBlur({ target: { name: "email" } } as never as FocusEvent);

      await nextTick();

      expect(isValid.value).toBe(false);
    });
    test("'isDirty' should return true when form is dirty", async () => {
      const { isDirty, handleFieldChange, handleFieldBlur, reset } = useFormik({
        initialValues,
        onSubmit,
        validationSchema,
      });
      expect(isDirty.value).toBe(false);

      handleFieldChange({ target: { name: "email", value: "Kiran" } } as never as Event);
      handleFieldBlur({ target: { name: "email" } } as never as FocusEvent);

      await nextTick();

      expect(isDirty.value).toBe(true);

      reset();

      await nextTick();

      expect(isDirty.value).toBe(false);
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
});
