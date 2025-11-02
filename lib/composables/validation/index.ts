import { ZodType } from "zod";
import type { ObjectSchema as JoiSchema } from "joi";
import type { ObjectSchema as YupSchema } from "yup";
import type { CustomValidationSchema } from "@/types";
import validateYup from "@/composables/validation/yup";
import validateJoi from "@/composables/validation/joi";
import validateZod from "@/composables/validation/zod";
import validateCustom from "@/composables/validation/custom";
import { Struct } from "superstruct";
import validateSuperstruct from "@/composables/validation/superstruct";

const validate = async <T extends object>(
  values: T,
  {
    yupSchema,
    joiSchema,
    zodSchema,
    structSchema,
    validationSchema,
  }: {
    yupSchema?: YupSchema<T>;
    joiSchema?: JoiSchema<T>;
    zodSchema?: ZodType<T>;
    structSchema?: Struct<T>;
    validationSchema?: CustomValidationSchema<T>;
  },
): Promise<Partial<Record<keyof T, unknown>>> => {
  if (yupSchema) {
    return validateYup(values, yupSchema);
  }

  if (joiSchema) {
    return validateJoi(values, joiSchema);
  }

  if (zodSchema) {
    return validateZod(values, zodSchema);
  }

  if (structSchema) {
    return validateSuperstruct(values, structSchema);
  }

  if (validationSchema) {
    return validateCustom(values, validationSchema);
  }

  return {};
};

export default validate;
