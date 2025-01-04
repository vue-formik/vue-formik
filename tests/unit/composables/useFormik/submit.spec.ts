import { describe, expect, test, vi } from "vitest";
import { useFormik } from "../../../../lib";
import { FormikHelpers } from "../../../../lib/types";

describe("useFormik submit", async () => {
  const initialValues = {
    name: "John Doe",
    email: "john@example.com",
  };
  const onSubmit = vi.fn();

  test("submitting form should call onSubmit", () => {
    const { handleSubmit } = useFormik({ initialValues, onSubmit });
    handleSubmit({ preventDefault: vi.fn() });
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(initialValues, expect.any(Object));
  });
  test("'isSubmitting' should return true when form is submitting", async () => {
    const onSubmit = (
      _values: typeof initialValues,
      { setSubmitting }: FormikHelpers<typeof initialValues>,
    ) => {
      expect(isSubmitting.value).toBe(true);
      setSubmitting(false);
      expect(isSubmitting.value).toBe(false);
    };

    const { isSubmitting, handleSubmit } = useFormik({ initialValues, onSubmit });
    expect(isSubmitting.value).toBe(false);

    handleSubmit({ preventDefault: vi.fn() });
  });
});
