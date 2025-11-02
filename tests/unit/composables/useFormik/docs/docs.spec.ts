import { describe, expect, test } from "vitest";
import { nextTick } from "vue";
import { useFormik } from "@/index";
import { InitialValues, ValidationSchemaYup, ValidationSchema } from "./fixture";

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

describe("docs", () => {
  test("yup", async () => {
    const form = useFormik({
      initialValues: InitialValues,
      yupSchema: ValidationSchemaYup,
    });

    expect(form.values).toEqual(InitialValues);
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
    expect(form.touched).toMatchSnapshot();
  });
  test("custom validator", async () => {
    const form = useFormik({
      initialValues: InitialValues,
      validationSchema: ValidationSchema,
    });

    expect(form.values).toEqual(InitialValues);
    await waitForValidation(form);
    expect(form.errors).toMatchSnapshot();
    expect(form.touched).toMatchSnapshot();
  });
});
