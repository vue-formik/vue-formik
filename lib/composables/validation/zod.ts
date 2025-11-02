import { ZodType } from "zod";

import { setNestedValue } from "@/helpers";
import { constructPath } from "@/helpers/formikObject/objectPath";

const validateZod = async <T extends object>(
  values: T,
  schema: ZodType<Partial<T>>,
): Promise<Partial<Record<keyof T, unknown>>> => {
  const errors: Record<string, unknown> = {};
  const result = await schema.safeParseAsync(values);
  if (!result.success) {
    result.error.issues.forEach(({ path, message }) => {
      const pathSegments = path.filter(
        (p): p is string | number => typeof p === "string" || typeof p === "number",
      ) as (string | number)[];
      setNestedValue(errors as Record<string, unknown>, constructPath(pathSegments), message);
    });
  }
  return errors as Partial<Record<keyof T, unknown>>;
};

export default validateZod;
