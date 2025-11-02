import { type Struct, assert, StructError } from "superstruct";
import { setNestedValue } from "@/helpers";
import { constructPath } from "@/helpers/formikObject/objectPath";

const validateSuperstruct = async <T extends object>(
  values: T,
  schema: Struct<T>,
): Promise<Partial<Record<keyof T, unknown>>> => {
  const errors: Record<string, unknown> = {};
  try {
    assert(values, schema);
  } catch (e) {
    if (e instanceof StructError) {
      const failures = e.failures();
      for (const failure of failures) {
        const { path, message } = failure;
        setNestedValue(errors, constructPath(path), message);
      }
    }
  }
  return errors;
};

export default validateSuperstruct;
