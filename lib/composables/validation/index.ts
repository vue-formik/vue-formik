import { ZodType } from "zod";
import { ObjectSchema as JoiSchema } from "joi";
import { ObjectSchema as YupSchema } from "yup";
import { AllowedAny, CustomValidationSchema } from "@/types";
import type ValidationRegistry from "./registry";

const validate = <T extends object>(
  values: T,
  vRegistry: ValidationRegistry,
  {
    yupSchema,
    joiSchema,
    zodSchema,
    validationSchema,
    customValidators,
  }: {
    yupSchema?: YupSchema<T>;
    joiSchema?: JoiSchema<T>;
    zodSchema?: ZodType<T>;
    validationSchema?: CustomValidationSchema<T>;
    customValidators?: AllowedAny;
  }
): Partial<Record<keyof T, unknown>> => {
  let validationErrors: Partial<Record<keyof T, unknown>> = {};

  const validatorMap = {
    zod: zodSchema,
    yup: yupSchema,
    joi: joiSchema,
    custom: validationSchema,
    ...customValidators,
  };

  for (const [key, schema] of Object.entries(validatorMap)) {
    if (schema) {
      const validator = vRegistry.getValidator(key);

      if (validator) {
        const result = validator(values, schema);
        validationErrors = { ...validationErrors, ...result };
      }
    }
  }

  return validationErrors;
};

export default validate;
