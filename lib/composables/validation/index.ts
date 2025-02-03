import { ZodType } from "zod";
import { ObjectSchema as JoiSchema } from "joi";
import { ObjectSchema as YupSchema } from "yup";
import { CustomValidationSchema } from "@/types";
import validateZod from "@/composables/validation/zod";
import validateJoi from "@/composables/validation/joi";
import validateYup from "@/composables/validation/yup";
import validateCustom from "@/composables/validation/custom";

const validate = <T extends object>(
  values: T,
  {
    yupSchema,
    joiSchema,
    zodSchema,
    validationSchema,
  }: {
    yupSchema?: YupSchema<T>;
    joiSchema?: JoiSchema<T>;
    zodSchema?: ZodType<T>;
    validationSchema?: CustomValidationSchema<T>;
  },
): Partial<Record<keyof T, unknown>> => {
  const validationErrors = {};
  if (!yupSchema && !joiSchema && !zodSchema && !validationSchema) {
    return validationErrors;
  }

  if (zodSchema) {
    return validateZod(values, zodSchema);
  } else if (joiSchema) {
    return validateJoi(values, joiSchema);
  } else if (yupSchema) {
    return validateYup(values, yupSchema);
  } else if (validationSchema) {
    return validateCustom(values, validationSchema);
  } else {
    console.error("Invalid validation schema provided");
  }

  return validationErrors;
};

export default validate;
