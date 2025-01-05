import { describe, test, expect } from "vitest";
import { useFormik } from "../../../../lib";
import { nextTick } from "vue";
import {
  initialValues1,
  initialValues2,
  validationSchema1,
  validationSchema2,
  validationSchema3,
} from "./fixtures";

describe("useFormik error", async () => {
  test("reactivity on values changes", async () => {
    const { errors, setFieldValue } = useFormik({
      initialValues: initialValues1,
      validationSchema: validationSchema1,
    });

    await nextTick();
    expect(errors).toMatchSnapshot();

    setFieldValue("email", "kiran");
    await nextTick();
    expect(errors).toMatchSnapshot();
  });

  describe("getFieldError", async () => {
    const sharedTouchedFields = [
      ["names[0]"],
      ["names[1]"],
      ["contacts[0].code"],
      ["contacts[0].number"],
      ["address.state"],
      ["address.city"],
      ["address.country"],
    ];
    const commonErrors = [
      { field: "names[0]", error: "This field is required" },
      { field: "names[1]", error: "This field is required" },
      { field: "contacts[0].code", error: "This field is required" },
      { field: "contacts[0].number", error: "This field is required" },
      { field: "address.state", error: "This field is required" },
      { field: "address.city", error: "This field is required" },
      { field: "address.country", error: "This field is required" },
    ];

    test.each([
      {
        description: "returns error message for Yup validation",
        validationSchema: validationSchema2,
        initialValues: { ...initialValues2 },
        errors: commonErrors,
        updatedFields: [
          { field: "names[0]", value: "kiran", errorAfterUpdate: "" },
          { field: "address.state", value: "Karnataka", errorAfterUpdate: "" },
        ],
      },
      {
        description: "returns error message for custom validation",
        validationSchema: validationSchema3,
        initialValues: { ...initialValues2 },
        errors: commonErrors,
        updatedFields: [
          { field: "names[0]", value: "kiran", errorAfterUpdate: "" },
          { field: "address.state", value: "Karnataka", errorAfterUpdate: "" },
        ],
      },
    ])("$description", async ({ validationSchema, initialValues, errors, updatedFields }) => {
      // cleanup code
      initialValues.names[0] = "";
      initialValues.address.state = "";

      const { getFieldError, setFieldValue, setFieldTouched, reset } = useFormik({
        initialValues,
        validationSchema,
      });

      sharedTouchedFields.forEach(([field]) => setFieldTouched(field, true));

      await nextTick();

      errors.forEach(({ field, error }) => {
        expect(getFieldError(field)).toBe(error);
      });

      for (const { field, value, errorAfterUpdate } of updatedFields) {
        setFieldValue(field, value);
        await nextTick();
        expect(getFieldError(field)).toBe(errorAfterUpdate);
      }
      reset();
      await nextTick();
    });

    test("if field is not touched, it should not show error", async () => {
      const { getFieldError, setFieldTouched } = useFormik({
        initialValues: { name: "", email: "" },
        validationSchema: validationSchema1,
      });

      expect(getFieldError("name")).toBe("");
      setFieldTouched("name", true);
      expect(getFieldError("name")).toBe("This field is required");
    });
  });
});
