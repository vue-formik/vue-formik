import { setNestedValue } from "@/helpers";
import { ObjectSchema } from "joi";

const validateJoi = async <T extends object>(
  values: T,
  schema: ObjectSchema<Partial<T>>,
): Promise<Partial<Record<keyof T, unknown>>> => {
  const errors: Record<string, unknown> = {};

  try {
    await schema.validateAsync(values, { abortEarly: false });
  } catch (e) {
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
        setNestedValue(errors, context.label, message);
      });
    }
  }

  return errors;
};

export default validateJoi;
