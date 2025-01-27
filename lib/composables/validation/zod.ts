import { updateNestedProperty } from "@/helpers";
import { ZodType } from "zod";

const validateZod = <T extends object>(values: T, schema: ZodType<Partial<T>>) => {
  const errors = {};
  const result = schema.safeParse(values);
  if (!result.success) {
    result.error.errors.forEach(({ path, message }) => {
      updateNestedProperty(errors as Record<string, unknown>, path.join("."), message);
    });
  }
  return errors;
};

export default validateZod;
