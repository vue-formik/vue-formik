import type { Formik } from "@/types";

function useFieldArray(formik: Formik) {
  /**
   * Pushes a value into the array at the specified field.
   * If an index is provided, inserts the value at that index.
   * If no index is provided, appends the value at the end of the array.
   *
   * Note: This function only works with arrays.
   */
  const push = (field: string, value: unknown, index?: number) => {
    const fieldValue = formik.getFieldValue(field);

    if (!Array.isArray(fieldValue)) {
      console.warn(`Field "${field}" is not an array`);
      return;
    }

    if (!formik.setFieldValue || typeof formik.setFieldValue !== "function") {
      console.warn(`formik.setFieldValue is not a function or not available`);
      return;
    }

    // Clone the array to avoid direct mutations
    const updatedArray = [...fieldValue];

    if (index === undefined) {
      updatedArray.push(value); // Append to the end
    } else {
      if (index < 0 || index > updatedArray.length) {
        console.warn(`Index ${index} out of bounds for field "${field}"`);
        return;
      }
      updatedArray.splice(index, 0, value); // Insert at the specified index
    }

    formik.setFieldValue(field, updatedArray);
  };

  /**
   * Removes a value from the array at the specified field.
   * If an index is provided, removes the value at that index.
   * If no index is provided, removes the last value in the array.
   */
  const pop = (field: string, index?: number) => {
    const fieldValue = formik.getFieldValue(field);

    if (!Array.isArray(fieldValue)) {
      console.warn(`Field "${field}" is not an array`);
      return;
    }

    if (fieldValue.length === 0) {
      console.warn(`Field "${field}" is an empty array`);
      return;
    }

    // Clone the array to avoid direct mutations
    const updatedArray = [...fieldValue];

    if (index === undefined) {
      updatedArray.pop(); // Remove from the end
    } else {
      if (index < 0 || index >= updatedArray.length) {
        console.warn(`Index ${index} out of bounds for field "${field}"`);
        return;
      }
      updatedArray.splice(index, 1); // Remove the value at the specified index
    }

    formik.setFieldValue(field, updatedArray);

    // Optionally set touched state for the removed index
    if (index !== undefined) {
      formik.setFieldTouched(`${field}[${index}]`);
    }
  };

  return { push, pop };
}

export default useFieldArray;
