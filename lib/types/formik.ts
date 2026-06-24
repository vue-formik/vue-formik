import useFormik from "../composables/useFormik";
import type { MaybePromise } from "./common";
import type { CustomValidationSchema } from "./validation";
import type { StandardSchemaV1 } from "./standardSchema";

export type IResetOptions<T> = {
  values?: Partial<T>;
  keepTouched?: boolean;
};

export type SetValuesOptions = {
  replace?: boolean;
};

export interface FormikHelpers<T> {
  reset: (options?: IResetOptions<T>) => void;
  setErrors: (errors: Partial<Record<keyof T, unknown>>) => void;
  setValues: (values: Partial<T>, options?: SetValuesOptions) => void;
  setSubmitting: (value: boolean) => void;
  event?: Event;
}

export type FormikOnSubmit<T> = (values: T, helpers: FormikHelpers<T>) => MaybePromise<void>;

export interface AnyFormValues {
  [key: string]: unknown;
}

export type Formik = ReturnType<typeof useFormik<AnyFormValues>>;

export interface UseFormikOptions<T extends object = object> {
  initialValues: T;
  validateOnMount?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validationDebounce?: number;
  preventDefault?: boolean;
  onSubmit?: FormikOnSubmit<T>;
  yupSchema?: import("yup").ObjectSchema<T>;
  joiSchema?: import("joi").ObjectSchema<T>;
  zodSchema?: import("zod").ZodType<T>;
  structSchema?: import("superstruct").Struct<T>;
  /** Any Standard Schema (https://standardschema.dev): Zod, Valibot, ArkType, etc. */
  standardSchema?: StandardSchemaV1<T>;
  validationSchema?: CustomValidationSchema<T>;
  initialErrors?: Partial<Record<keyof T, unknown>>;
  initialTouched?: Partial<Record<keyof T, unknown>>;
}

// Helper type to infer form values from initialValues
export type InferFormValues<T> = T extends { initialValues: infer V } ? V : never;
