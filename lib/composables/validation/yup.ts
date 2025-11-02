import { ObjectSchema } from "yup";
import { setNestedValue } from "@/helpers";

const validateYup = async <T extends object>(
  values: T,
  schema: ObjectSchema<T>,
): Promise<Partial<Record<keyof T, unknown>>> => {
  const errors: Record<string, unknown> = {};
  try {
    await schema.validate(values, { abortEarly: false });
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
