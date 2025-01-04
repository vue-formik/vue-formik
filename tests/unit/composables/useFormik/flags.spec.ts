import { describe, expect, test } from "vitest";
import { useFormik } from "../../../../lib";
import { nextTick } from "vue";

describe("useFormik flags", async () => {
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
    test("should return true if there are no errors", () => {
      const { isValid } = useFormik(options());

      expect(isValid.value).toBe(true);
    });

    test("should return false if there are errors", () => {
      const { isValid } = useFormik(options(""));

      expect(isValid.value).toBe(false);
    });

    test("on field update", async () => {
      const { isValid, setFieldValue } = useFormik(options());
      setFieldValue("contacts", "");
      await nextTick();
      expect(isValid.value).toBe(false);
      setFieldValue("contacts", "9856256525");
      await nextTick();
      expect(isValid.value).toBe(true);
    });

    test("array field", async () => {
      const { isValid, setFieldValue } = useFormik({
        initialValues: { contacts: [] },
        validationSchema: {
          contacts: (value: string[]) => {
            if (value.length === 0) {
              return "Contact is required";
            }
          },
        },
      });
      await nextTick();
      expect(isValid.value).toBe(false);
      setFieldValue("contacts", ["9856256525"]);
      await nextTick();
      expect(isValid.value).toBe(true);
    });

    test("object field", async () => {
      const { isValid, setFieldValue } = useFormik({
        initialValues: { contacts: { code: "", number: "" } },
        validationSchema: {
          contacts: (value: { code: string; number: string }) => {
            if (!value.code) {
              return "Code is required";
            }
            if (!value.number) {
              return "Number is required";
            }
          },
        },
      });
      expect(isValid.value).toBe(false);
      setFieldValue("contacts", { code: "+91", number: "9856256525" });
      await nextTick();
      expect(isValid.value).toBe(true);
    });
  });

  describe("isDirty", () => {
    test("should return false if there are no changes", () => {
      const { isDirty } = useFormik(options());

      expect(isDirty.value).toBe(false);
    });

    test("should return true if there are changes", () => {
      const { isDirty, setFieldValue } = useFormik(options(""));
      setFieldValue("contacts", "9856256525");
      expect(isDirty.value).toBe(true);
      setFieldValue("contacts", "");
      expect(isDirty.value).toBe(false);
    });
  });
});
