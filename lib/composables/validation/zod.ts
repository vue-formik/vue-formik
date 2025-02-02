import { ZodType } from "zod";

import { setNestedValue } from "@/helpers";
import { constructPath } from "@/helpers/formikObject/objectPath";

const validateZod = <T extends object>(values: T, schema: ZodType<Partial<T>>) => {
  const errors = {};
  const result = schema.safeParse(values);
  if (!result.success) {
    result.error.errors.forEach(({ path, message }) => {
      setNestedValue(errors as Record<string, unknown>, constructPath(path), message);
    });
  }
  return errors;
};

export default validateZod;
