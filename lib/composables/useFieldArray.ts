import { Formik } from "@/types";
import { inject } from "vue";

// overloading function for two different return types
function useFieldArray(formik: Formik): {
  push: (field: string, value: unknown) => void;
  pop: (field: string, index: number) => void;
};

function useFieldArray():
  | {
      push: (field: string, value: unknown) => void;
      pop: (field: string, index: number) => void;
    }
  | undefined;

function useFieldArray(formik?: Formik) {
  const injectedFormik: Formik | undefined = inject("formik");
  const fk = formik || injectedFormik;

  if (!fk) {
    console.error("useFieldArray must be used within a Formik component");
    return undefined;
  }

  const push = (field: string, value: unknown) => {
    if (Array.isArray(fk.values[field])) {
      fk.setFieldValue(field, [...fk.values[field], value]);
    } else {
      console.warn(`Field ${field} is not an array`);
    }
  };

  const pop = (field: string, index: number) => {
    const fieldValue = fk.getFieldValue(field);
    if (Array.isArray(fieldValue)) {
      if (index < 0 || index >= fieldValue.length) {
        console.warn(`Index ${index} out of bounds`);
        return;
      }

      fk.setFieldValue(
        field,
        fieldValue.filter((_, i) => i !== index),
      );
      fk.setFieldTouched(`${field}[${index}]`);
    } else {
      console.warn(`Field ${field} is not an array`);
    }
  };

  return { push, pop };
}

export default useFieldArray;
