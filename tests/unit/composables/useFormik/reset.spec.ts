import { describe, test, expect } from "vitest";
import { useFormik } from "../../../../lib";

describe("useFormik reset", () => {
  const initialValues = {
    name: "John Doe",
    email: "john@example.co",
    address: {
      city: "New York",
      country: "USA",
    },
  };

  test("should reset form values", () => {
    const { reset, values, setFieldValue } = useFormik({ initialValues });
    setFieldValue("name", "Jane Doe");
    setFieldValue("email", "jane@example.co");
    expect(values).toMatchSnapshot();
    reset();
    expect(values).toEqual(initialValues);
  });

  test("should reset form values with new values", () => {
    const { reset, values, setFieldValue, isDirty } = useFormik({ initialValues });
    setFieldValue("name", "Jane Doe");
    setFieldValue("email", "jane@example.com");
    expect(values).toMatchSnapshot();
    expect(isDirty.value).toBe(true);
    reset({
      values: {
        name: "Alice Hansen",
        email: "alice@example.com",
      },
    });
    expect(values).toMatchSnapshot();
    expect(isDirty.value).toBe(false);
  });
});
