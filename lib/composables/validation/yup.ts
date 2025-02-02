import { ObjectSchema } from "yup";
import { setNestedValue } from "@/helpers";

const validateYup = <T extends object>(
  values: T,
  schema: ObjectSchema<T>,
): Partial<Record<keyof T, unknown>> => {
  const errors = {};
  try {
    schema.validateSync(values, { abortEarly: false });
  } catch (e) {
    const err = e as { inner: { path: string; message: string[] | string }[] };
    if (err?.inner?.length) {
      err.inner.forEach(({ path, message }) => {
        setNestedValue(errors, path, message);
      });
    }
  }
  return errors;
};

export default validateYup;
