import { setNestedValue } from "@/helpers";
import { ObjectSchema } from "joi";

const validateJoi = <T extends object>(values: T, schema: ObjectSchema<Partial<T>>) => {
  const errors = {};
  const { error: e } = schema.validate(values, { abortEarly: false });
  if (e) {
    const err = e as {
      details?: Array<{
        message: string;
        context: {
          label: string;
        };
      }>;
    };
    if (err?.details?.length) {
      err.details.forEach(({ context, message }) => {
        setNestedValue(errors as Record<string, unknown>, context.label, message);
      });
    }
  }
  return errors;
};

export default validateJoi;
