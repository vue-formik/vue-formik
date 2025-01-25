/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectSchema as YupSchema } from "yup";
import { ObjectSchema as JoiSchema } from "joi";
import { ZodType } from "zod";
import useFormik from "@/composables/useFormik";

interface FormikHelpers<T> {
  reset: () => void;
  setErrors: (errors: Partial<Record<keyof T, string | Record<string, string>>>) => void;
  setValues: (values: T) => void;
  setSubmitting: (value: boolean) => void;
}

type ValidationRule = (
  value: any,
) =>
  | string
  | string[][]
  | undefined
  | (string | undefined)[]
  | Record<string, string | undefined>
  | Record<string, string | undefined>[];

type CustomValidationSchema<T> = Partial<Record<keyof T | string, ValidationRule>>;

type FormikOnSubmit<T> = (values: T, helpers: FormikHelpers<T>) => void;

// Useful for component prop definition
interface AnyFormValues {
  [key: string]: unknown;
}
type Formik = ReturnType<typeof useFormik<AnyFormValues>>;

type IUseFormikProps<T> = {
  initialValues: T;
  validateOnMount?: boolean;
  preventDefault?: boolean;
  onSubmit?: FormikOnSubmit<T>;
  yupSchema?: YupSchema<T>;
  joiSchema?: JoiSchema;
  zodSchema?: ZodType<T>;
  validationSchema?: CustomValidationSchema<T>;
};
