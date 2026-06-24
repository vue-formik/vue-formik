import { setNestedValue } from "../../helpers";
import { constructPath } from "../../helpers/formikObject/objectPath";
import type { StandardSchemaV1 } from "../../types/standardSchema";

/**
 * Validates form values against any Standard Schema (https://standardschema.dev) —
 * Zod, Valibot, ArkType, etc. — via the schema's `~standard` interface.
 */
const validateStandardSchema = async <T extends object>(
  values: T,
  schema: StandardSchemaV1<T>,
): Promise<Partial<Record<keyof T, unknown>>> => {
  const errors: Record<string, unknown> = {};
  const result = await schema["~standard"].validate(values);

  if (result.issues) {
    for (const issue of result.issues) {
      const pathSegments = (issue.path ?? [])
        .map((segment) => (typeof segment === "object" && segment !== null ? segment.key : segment))
        .filter(
          (key): key is string | number => typeof key === "string" || typeof key === "number",
        );

      setNestedValue(errors, constructPath(pathSegments), issue.message);
    }
  }

  return errors as Partial<Record<keyof T, unknown>>;
};

export default validateStandardSchema;
