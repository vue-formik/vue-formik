import type { Formik } from "../types";

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

  // Internal helper: read + array-guard a field, returning a shallow clone or null.
  const cloneArrayField = (field: string, op: string): unknown[] | null => {
    const fieldValue = formik.getFieldValue(field);
    if (!Array.isArray(fieldValue)) {
      console.warn(`Cannot ${op}: field "${field}" is not an array`);
      return null;
    }
    return [...fieldValue];
  };

  /**
   * Inserts a value at the given index, shifting subsequent items right.
   * Index must be within [0, length].
   */
  const insert = (field: string, index: number, value: unknown) => {
    const updatedArray = cloneArrayField(field, "insert");
    if (!updatedArray) return;

    if (index < 0 || index > updatedArray.length) {
      console.warn(`Index ${index} out of bounds for field "${field}"`);
      return;
    }

    updatedArray.splice(index, 0, value);
    formik.setFieldValue(field, updatedArray);
  };

  /**
   * Removes the item at the given index, shifting subsequent items left.
   * Index must be within [0, length).
   */
  const remove = (field: string, index: number) => {
    const updatedArray = cloneArrayField(field, "remove");
    if (!updatedArray) return;

    if (index < 0 || index >= updatedArray.length) {
      console.warn(`Index ${index} out of bounds for field "${field}"`);
      return;
    }

    updatedArray.splice(index, 1);
    formik.setFieldValue(field, updatedArray);
    formik.setFieldTouched(`${field}[${index}]`);
  };

  /**
   * Moves an item from one index to another, shifting items in between.
   * Both indices must be within [0, length).
   */
  const move = (field: string, from: number, to: number) => {
    const updatedArray = cloneArrayField(field, "move");
    if (!updatedArray) return;

    if (from < 0 || from >= updatedArray.length || to < 0 || to >= updatedArray.length) {
      console.warn(`Index out of bounds (from ${from}, to ${to}) for field "${field}"`);
      return;
    }
    if (from === to) return;

    const [moved] = updatedArray.splice(from, 1);
    updatedArray.splice(to, 0, moved);
    formik.setFieldValue(field, updatedArray);
  };

  /**
   * Swaps the items at two indices. Both indices must be within [0, length).
   */
  const swap = (field: string, indexA: number, indexB: number) => {
    const updatedArray = cloneArrayField(field, "swap");
    if (!updatedArray) return;

    if (
      indexA < 0 ||
      indexA >= updatedArray.length ||
      indexB < 0 ||
      indexB >= updatedArray.length
    ) {
      console.warn(`Index out of bounds (${indexA}, ${indexB}) for field "${field}"`);
      return;
    }
    if (indexA === indexB) return;

    [updatedArray[indexA], updatedArray[indexB]] = [updatedArray[indexB], updatedArray[indexA]];
    formik.setFieldValue(field, updatedArray);
  };

  /**
   * Replaces the item at the given index with a new value.
   * Index must be within [0, length).
   */
  const replace = (field: string, index: number, value: unknown) => {
    const updatedArray = cloneArrayField(field, "replace");
    if (!updatedArray) return;

    if (index < 0 || index >= updatedArray.length) {
      console.warn(`Index ${index} out of bounds for field "${field}"`);
      return;
    }

    updatedArray[index] = value;
    formik.setFieldValue(field, updatedArray);
  };

  return { push, pop, insert, remove, move, swap, replace };
}

export default useFieldArray;
