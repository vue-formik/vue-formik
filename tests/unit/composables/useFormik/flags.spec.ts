import { describe, expect, test } from "vitest";
import { useFormik } from "../../../../lib";
import { nextTick } from "vue";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

const waitForValidation = async (form: ReturnType<typeof useFormik>) => {
  await flush();
  while (form.isValidating.value) {
    await flush();
  }
};

describe("useFormik flags", () => {
  const options = (contacts = "9856256525") => ({
    initialValues: { contacts },
    validationSchema: {
      contacts: (value: string) => {
        if (!value) {
          return "Contact is required";
        }
      },
    },
  });
  describe("isValid", () => {
    test("should return true if there are no errors", async () => {
      const form = useFormik(options());

      await waitForValidation(form);

      expect(form.isValid.value).toBe(true);
    });

    test("should return false if there are errors", async () => {
      const form = useFormik(options(""));

      await waitForValidation(form);

      expect(form.isValid.value).toBe(false);
    });

    test("on field update", async () => {
      const form = useFormik(options());
      await waitForValidation(form);

      form.setFieldValue("contacts", "");
      await waitForValidation(form);
      expect(form.isValid.value).toBe(false);

      form.setFieldValue("contacts", "9856256525");
      await waitForValidation(form);
      expect(form.isValid.value).toBe(true);
    });

    test("array field", async () => {
      const form = useFormik({
        initialValues: { contacts: [] },
        validationSchema: {
          contacts: (value: string[]) => {
            if (value.length === 0) {
              return "Contact is required";
            }
          },
        },
      });
      await waitForValidation(form);
      expect(form.isValid.value).toBe(false);
      form.setFieldValue("contacts", ["9856256525"]);
      await waitForValidation(form);
      expect(form.isValid.value).toBe(true);
    });

    test("object field", async () => {
      const form = useFormik({
        initialValues: { contacts: { code: "", number: "" } },
        validationSchema: {
          contacts: (value) => {
            if (!value.code) {
              return { code: "Code is required" };
            }
            if (!value.number) {
              return { number: "Number is required" };
            }
          },
        },
      });
      await waitForValidation(form);
      expect(form.isValid.value).toBe(false);
      form.setFieldValue("contacts.code", "+91");
      form.setFieldValue("contacts.number", "9856256525");
      await waitForValidation(form);
      expect(form.isValid.value).toBe(true);
    });
  });

  describe("isDirty", () => {
    test("should return false if there are no changes", async () => {
      const form = useFormik(options());
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(false);
    });

    test("should return true if there are changes", async () => {
      const form = useFormik(options(""));
      await waitForValidation(form);
      form.setFieldValue("contacts", "9856256525");
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(true);
      form.setFieldValue("contacts", "");
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(false);
    });

    test("should return true if there are changes in array field", async () => {
      const form = useFormik({
        initialValues: { contacts: [] },
      });
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(false);
      form.setFieldValue("contacts", ["9856256525"]);
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(true);
    });

    test("should return true if there are changes in object field", async () => {
      const form = useFormik({
        initialValues: { contacts: { code: "", number: "" } },
      });
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(false);
      form.setFieldValue("contacts.code", "+91");
      await waitForValidation(form);
      expect(form.isDirty.value).toBe(true);
    });
  });
});
