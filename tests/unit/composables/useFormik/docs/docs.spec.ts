import { describe, expect, test } from "vitest";
import { useFormik } from "@/index";
import { InitialValues, ValidationSchemaYup, ValidationSchema } from "./fixture";

describe("docs", () => {
  test("yup", () => {
    const { values, errors, touched } = useFormik({
      initialValues: InitialValues,
      yupSchema: ValidationSchemaYup,
    });

    expect(values).toEqual(InitialValues);
    expect(errors).toMatchSnapshot();
    expect(touched).toMatchSnapshot();
  });
  test("custom validator", () => {
    const { values, errors, touched } = useFormik({
      initialValues: InitialValues,
      validationSchema: ValidationSchema,
    });

    expect(values).toEqual(InitialValues);
    expect(errors).toMatchSnapshot();
    expect(touched).toMatchSnapshot();
  });
});
