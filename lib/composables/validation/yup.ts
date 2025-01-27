import { ObjectSchema } from "yup";
import { updateNestedProperty } from "@/helpers";

const validateYup = <T extends object>(
  values: T,
  schema: ObjectSchema<Partial<T>>,
): Partial<Record<keyof T, unknown>> => {
  const errors = {};
  try {
    schema.validateSync(values, { abortEarly: false });
  } catch (e) {
    const err = e as { inner?: Array<{ path: string; message: string }> };
    if (err?.inner?.length) {
      err.inner.forEach(({ path, message }) => {
        updateNestedProperty(errors as Record<string, unknown>, path, message);
      });
    }
  }
  return errors;
};

export default validateYup;
