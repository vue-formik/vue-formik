import { describe, expect, test, vi } from "vitest";
import { useFormik } from "../../../../lib";
import { FormikHelpers } from "@/types";
import { nextTick } from "vue";

describe("useFormik submit", async () => {
  const initialValues = {
    name: "John Doe",
    email: "john@example.com",
  };
  const onSubmit = vi.fn();

  test("should do nothing when onSubmit is not provided", () => {
    const { handleSubmit, isSubmitting } = useFormik({ initialValues });
    handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(isSubmitting.value).toBe(false);
  });

  test("submitting form should call onSubmit", () => {
    const { handleSubmit } = useFormik({ initialValues, onSubmit });
    handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(initialValues, expect.any(Object));
  });
  test("'isSubmitting' should return true when form is submitting", async () => {
    const onSubmit = (
      values: typeof initialValues,
      { setSubmitting }: FormikHelpers<typeof initialValues>,
    ) => {
      expect(isSubmitting.value).toBe(true);
      setSubmitting(false);
      expect(isSubmitting.value).toBe(false);
      expect(values).toEqual(initialValues);
    };

    const { isSubmitting, handleSubmit } = useFormik({ initialValues, onSubmit });
    expect(isSubmitting.value).toBe(false);

    handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
  });
  describe("preventDefault", () => {
    test("should prevent default form submission", () => {
      const { handleSubmit } = useFormik({ initialValues, onSubmit, preventDefault: true });
      const e = { preventDefault: vi.fn() } as never as SubmitEvent;
      handleSubmit(e);
      expect(e.preventDefault).toHaveBeenCalled();
    });

    test("should not prevent default form submission", () => {
      const { handleSubmit } = useFormik({ initialValues, onSubmit, preventDefault: false });
      const e = { preventDefault: vi.fn() } as never as SubmitEvent;
      handleSubmit(e);
      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });
  describe("submitting", () => {
    test("set submitting to true", () => {
      const { handleSubmit, isSubmitting } = useFormik({ initialValues, onSubmit });
      handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
      expect(isSubmitting.value).toBe(true);
    });

    test("set submitting to false", async () => {
      const { isSubmitting, setSubmitting } = useFormik({ initialValues, onSubmit });

      setSubmitting(true);
      expect(isSubmitting.value).toBe(true);

      await nextTick();

      setSubmitting(false);
      expect(isSubmitting.value).toBe(false);
    });
  });

  describe("submit count", () => {
    test("should increment submit count", () => {
      const { handleSubmit, submitCount } = useFormik({ initialValues, onSubmit });
      handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
      expect(submitCount.value).toBe(1);
      handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
      expect(submitCount.value).toBe(2);
      handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
      expect(submitCount.value).toBe(3);
      handleSubmit({ preventDefault: vi.fn() } as never as SubmitEvent);
      expect(submitCount.value).toBe(4);
    });
  });
});
