import { AllowedAny } from "@/types";

class ValidationRegistry {
  private validators: Record<string, (values: AllowedAny, schema: AllowedAny) => Partial<Record<string, unknown>>> = {};

  /**
   * Registers a new validator in the registry.
   * @param name - The unique name of the validator (e.g., "zod", "yup", "joi").
   * @param fn - The validation function that processes the values using a schema.
   */
  registerValidator(name: string, fn: (values: AllowedAny, schema: AllowedAny) => Partial<Record<string, unknown>>): void {
    this.validators[name] = fn;
  }

  /**
   * Retrieves a registered validator function.
   * @param name - The name of the validator to retrieve.
   * @returns The validation function or null if not found.
   */
  getValidator(name: string): ((values: AllowedAny, schema: AllowedAny) => Partial<Record<string, unknown>>) | null {
    return this.validators[name] || null;
  }

  /**
   * Checks if a validator is registered.
   * @param name - The name of the validator.
   * @returns `true` if registered, otherwise `false`.
   */
  hasValidator(name: string): boolean {
    return name in this.validators;
  }

  /**
   * Clears all registered validators (for testing purposes).
   */
  clearValidators(): void {
    this.validators = {};
  }

  /**
   * Retrieves all registered validator names.
   * @returns An array of registered validator names.
   */
  getRegisteredValidators(): string[] {
    return Object.keys(this.validators);
  }

  /**
   * Checks if the validator is a default one.
   *
   * @param name - The name of the validator.
   *
   * @returns `true` if the validator is a default one, otherwise `false`.
   */
  isDefaultValidator(name?: string): boolean {
    return name ? ["zod", "yup", "joi", "custom"].includes(name) : false;
  }
}

export default ValidationRegistry;
