/* eslint-disable @typescript-eslint/no-explicit-any */
import { getNestedValue, setNestedValue } from "@/helpers";
import { CustomValidationSchema, ValidationRule } from "@/types";

const isValidationRule = <T>(rule: unknown): rule is ValidationRule<unknown, T> => {
  return typeof rule === "function";
};

const isValidationSchemaFunction = <T>(
  schema: unknown,
): schema is (values: T) => Partial<Record<keyof T, unknown>> => {
  return typeof schema === "function";
};

const isNestedValidationRules = <T>(
  rules: unknown,
): rules is Record<string, ValidationRule<unknown, T> | Record<string, unknown>> => {
  return typeof rules === "object" && rules !== null && !Array.isArray(rules);
};

const validateCustom = <T extends Record<string, any>>(
  values: T,
  schema: CustomValidationSchema<T>,
): Partial<Record<keyof T, unknown>> => {
  if (isValidationSchemaFunction<T>(schema)) {
    return schema(values);
  }

  const errors: Partial<Record<keyof T, unknown>> = {};

  const processValidationRule = (
    rule: ValidationRule<any, T>,
    fullKey: string,
    parentErrors: Record<string, unknown>,
  ) => {
    const value = getNestedValue(values, fullKey as any);
    const error = rule(value, values);

    if (error !== undefined && error !== null) {
      setNestedValue(parentErrors, fullKey, error);
    }
  };

  const processNestedRules = (
    rules: Record<string, unknown>,
    baseKey: string,
    parentErrors: Record<string, unknown>,
  ) => {
    Object.entries(rules).forEach(([nestedKey, ruleOrNested]) => {
      const fullKey = baseKey ? `${baseKey}.${nestedKey}` : nestedKey;

      if (isValidationRule<T>(ruleOrNested)) {
        processValidationRule(ruleOrNested, fullKey, parentErrors);
      } else if (isNestedValidationRules<T>(ruleOrNested)) {
        processNestedRules(ruleOrNested, fullKey, parentErrors);
      }
    });
  };

  Object.entries(schema).forEach(([key, ruleOrNested]) => {
    if (isValidationRule<T>(ruleOrNested)) {
      processValidationRule(ruleOrNested, key, errors);
    } else if (isNestedValidationRules<T>(ruleOrNested)) {
      processNestedRules(ruleOrNested, key, errors);
    }
  });

  return errors;
};

export default validateCustom;
