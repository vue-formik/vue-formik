import { ZodType } from "zod";
import { ObjectSchema as JoiSchema } from "joi";
import { ObjectSchema as YupSchema } from "yup";
import { CustomValidationSchema } from "@/types";
import validateYup from "@/composables/validation/yup";
import validateJoi from "@/composables/validation/joi";
import validateZod from "@/composables/validation/zod";
import validateCustom from "@/composables/validation/custom";
import { Struct } from "superstruct";
import validateSuperstruct from "@/composables/validation/superstruct";

const validate = <T extends object>(
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
): Partial<Record<keyof T, unknown>> => {
  let validationErrors: Partial<Record<keyof T, unknown>> = {};

  if (yupSchema) {
    validationErrors = validateYup(values, yupSchema);
  } else if (joiSchema) {
    validationErrors = validateJoi(values, joiSchema);
  } else if (zodSchema) {
    validationErrors = validateZod(values, zodSchema);
  } else if (validationSchema) {
    validationErrors = validateCustom(values, validationSchema);
  } else if (structSchema) {
    validationErrors = validateSuperstruct(values, structSchema);
  }

  return validationErrors;
};

export default validate;
