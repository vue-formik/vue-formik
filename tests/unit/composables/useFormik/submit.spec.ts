import { describe, expect, test, vi } from "vitest";
import { nextTick } from "vue";
import { useFormik } from "../../../../lib";
import type { FormikHelpers } from "@/types";

const createSubmitEvent = () => ({ preventDefault: vi.fn() }) as never as SubmitEvent;

describe("useFormik submit", () => {
  const initialValues = {
    name: "John Doe",
    email: "john@example.com",
  };

  test("should do nothing when onSubmit is not provided", async () => {
    const { handleSubmit, isSubmitting } = useFormik({ initialValues });

    await handleSubmit(createSubmitEvent());

    expect(isSubmitting.value).toBe(false);
  });

  test("submitting form should call onSubmit", async () => {
    const submitSpy = vi.fn();
    const { handleSubmit } = useFormik({ initialValues, onSubmit: submitSpy });

    await handleSubmit(createSubmitEvent());

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submitSpy).toHaveBeenCalledWith(initialValues, expect.any(Object));
  });

  test("awaits async submit handlers and resets submitting flag", async () => {
    const submitSpy = vi.fn().mockImplementation(async () => {
      await Promise.resolve();
    });
    const { handleSubmit, isSubmitting } = useFormik({ initialValues, onSubmit: submitSpy });

    const submitPromise = handleSubmit(createSubmitEvent());

    expect(isSubmitting.value).toBe(true);

    await submitPromise;

    expect(isSubmitting.value).toBe(false);
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  test("'isSubmitting' should reflect helper updates during submit", async () => {
    const submitSpy = vi.fn(
      (values: typeof initialValues, { setSubmitting }: FormikHelpers<typeof initialValues>) => {
        expect(values).toEqual(initialValues);
        setSubmitting(false);
      },
    );

    const { isSubmitting, handleSubmit } = useFormik({ initialValues, onSubmit: submitSpy });

    const submitPromise = handleSubmit(createSubmitEvent());
    expect(isSubmitting.value).toBe(true);

    await submitPromise;

    expect(isSubmitting.value).toBe(false);
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  describe("preventDefault", () => {
    test("should prevent default form submission", async () => {
      const submitSpy = vi.fn();
      const { handleSubmit } = useFormik({
        initialValues,
        onSubmit: submitSpy,
        preventDefault: true,
      });
      const event = createSubmitEvent();

      await handleSubmit(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("should not prevent default form submission", async () => {
      const submitSpy = vi.fn();
      const { handleSubmit } = useFormik({
        initialValues,
        onSubmit: submitSpy,
        preventDefault: false,
      });
      const event = createSubmitEvent();

      await handleSubmit(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("submitting", () => {
    test("sets submitting to true during submission", async () => {
      const submitSpy = vi.fn();
      const { handleSubmit, isSubmitting } = useFormik({ initialValues, onSubmit: submitSpy });

      const submitPromise = handleSubmit(createSubmitEvent());
      expect(isSubmitting.value).toBe(true);

      await submitPromise;

      expect(isSubmitting.value).toBe(false);
    });

    test("set submitting to false via helper", async () => {
      const submitSpy = vi.fn();
      const { isSubmitting, setSubmitting } = useFormik({ initialValues, onSubmit: submitSpy });

      setSubmitting(true);
      expect(isSubmitting.value).toBe(true);

      await nextTick();

      setSubmitting(false);
      expect(isSubmitting.value).toBe(false);
    });

    test("resets submitting when validation fails", async () => {
      const submitSpy = vi.fn();
      const { handleSubmit, isSubmitting, errors } = useFormik({
        initialValues: { name: "" },
        validationSchema: {
          name: (value: string) => {
            if (!value) {
              return "Required";
            }
          },
        },
        onSubmit: submitSpy,
      });

      await handleSubmit(createSubmitEvent());

      expect(submitSpy).not.toHaveBeenCalled();
      expect(isSubmitting.value).toBe(false);
      expect(errors.name).toBe("Required");
    });
  });

  describe("submit count", () => {
    test("should increment submit count", async () => {
      const submitSpy = vi.fn();
      const { handleSubmit, submitCount } = useFormik({ initialValues, onSubmit: submitSpy });

      await handleSubmit(createSubmitEvent());
      expect(submitCount.value).toBe(1);

      await handleSubmit(createSubmitEvent());
      expect(submitCount.value).toBe(2);

      await handleSubmit(createSubmitEvent());
      expect(submitCount.value).toBe(3);

      await handleSubmit(createSubmitEvent());
      expect(submitCount.value).toBe(4);
    });
  });
});
