import { getNestedValue, updateNestedProperty } from "@/helpers";
import { CustomValidationSchema, ValidationRule } from "@/types";

const isValidationRule = <T>(rule: unknown): rule is ValidationRule<T> => {
  return typeof rule === "function";
};

const isValidationSchema = <T>(schema: unknown): schema is (values: T) => Partial<T> => {
  return typeof schema === "function";
};

const isNestedValidationRules = (rules: unknown): rules is Record<string, unknown> => {
  return typeof rules === "object" && rules !== null && !Array.isArray(rules);
};

const validateCustom = <T extends object>(
  values: T,
  schema: CustomValidationSchema<T>,
): Partial<Record<keyof T, unknown>> => {
  // Handle function-style validation
  if (isValidationSchema<T>(schema)) {
    return schema(values);
  }

  // Handle object-style validation
  const errors: Record<string, unknown> = {};

  Object.entries(schema).forEach(([key, rules]) => {
    // Case 1: Regular validation rule
    if (isValidationRule<T>(rules)) {
      const value = getNestedValue(values as Record<string, unknown>, key);
      const error = rules(value, values);
      if (error) {
        updateNestedProperty(errors, key, error);
      }
    }
    // Case 2: Function returning partial form values
    else if (isValidationRule<T>(rules) && typeof rules(undefined, values) === "object") {
      const partialErrors = rules(undefined, values) as Partial<T>;
      Object.entries(partialErrors).forEach(([errorKey, errorValue]) => {
        if (errorValue !== undefined) {
          updateNestedProperty(errors, errorKey, errorValue);
        }
      });
    }
    // Case 3: Nested validation rules
    else if (isNestedValidationRules(rules)) {
      const validateNested = (nestedRules: Record<string, unknown>, parentKey: string) => {
        Object.entries(nestedRules).forEach(([nestedKey, nestedRule]) => {
          const fullKey = `${parentKey}.${nestedKey}`;

          if (isValidationRule<T>(nestedRule)) {
            const value = getNestedValue(values as Record<string, unknown>, fullKey);
            const error = nestedRule(value, values);
            if (error) {
              updateNestedProperty(errors, fullKey, error);
            }
          } else if (isNestedValidationRules(nestedRule)) {
            validateNested(nestedRule, fullKey);
          }
        });
      };

      validateNested(rules, key);
    }
  });

  return errors as Partial<Record<keyof T, unknown>>;
};

export default validateCustom;
