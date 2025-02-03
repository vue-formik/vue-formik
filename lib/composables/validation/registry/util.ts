import ValidationRegistry from "@/composables/validation/registry";
import validateZod from "@/composables/validation/zod";
import validateYup from "@/composables/validation/yup";
import validateJoi from "@/composables/validation/joi";
import validateCustom from "@/composables/validation/custom";

export const getValidationRegistryWithDefaults = () => {
  const vRegistry = new ValidationRegistry();

  vRegistry.registerValidator("zod", validateZod);
  vRegistry.registerValidator("yup", validateYup);
  vRegistry.registerValidator("joi", validateJoi);
  vRegistry.registerValidator("custom", validateCustom);

  return vRegistry;
};
