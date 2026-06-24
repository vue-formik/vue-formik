import { describe, expect, test } from "vitest";
import { nextTick } from "vue";
import { useFormik } from "@/index";

// Flush several microtask/tick cycles so async schema + field validators settle.
const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

describe("field-level validation registry", () => {
  test("registered field validators populate errors", async () => {
    const formik = useFormik({ initialValues: { name: "start" } });
    formik.registerFieldValidation("name", (value) => (value ? undefined : "Name is required"));

    // Change to empty so the on-change validation runs the registered rule.
    formik.setFieldValue("name", "");
    await flush();
    expect(formik.errors.name).toBe("Name is required");

    formik.setFieldValue("name", "Ada");
    await flush();
    expect(formik.errors).toEqual({});
  });

  test("field-level error takes precedence over schema for its path", async () => {
    const formik = useFormik({
      initialValues: { name: "" },
      validationSchema: {
        name: () => "schema error",
      },
    });
    formik.registerFieldValidation("name", () => "field error");

    formik.setFieldValue("name", "x");
    await flush();
    expect(formik.errors.name).toBe("field error");
  });

  test("supports async field validators", async () => {
    const formik = useFormik({ initialValues: { username: "" } });
    formik.registerFieldValidation("username", async (value) => {
      await Promise.resolve();
      return value === "taken" ? "Username taken" : undefined;
    });

    formik.setFieldValue("username", "taken");
    await flush();
    expect(formik.errors.username).toBe("Username taken");
  });

  test("unregister stops a validator from running", async () => {
    const formik = useFormik({ initialValues: { name: "start" } });
    formik.registerFieldValidation("name", (value) => (value ? undefined : "required"));

    formik.setFieldValue("name", "");
    await flush();
    expect(formik.errors.name).toBe("required");

    formik.unregisterFieldValidation("name");
    formik.setFieldValue("name", "anything");
    await flush();
    expect(formik.errors).toEqual({});
  });
});
