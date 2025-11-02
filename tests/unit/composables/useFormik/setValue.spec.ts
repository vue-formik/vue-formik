import { describe, expect, test } from "vitest";
import { useFormik } from "../../../../lib";

describe("useFormik value setters", async () => {
  describe("setFieldValue", () => {
    test("string values", () => {
      const { values, setFieldValue } = useFormik({
        initialValues: { name: "" },
      });
      setFieldValue("name", "kiran");
      expect(values.name).toBe("kiran");
    });
    test("array of strings", () => {
      const { values, setFieldValue } = useFormik({
        initialValues: { addresses: [""] },
      });
      setFieldValue("addresses[0]", "Bangalore");
      expect(values.addresses[0]).toBe("Bangalore");
    });
    test("array of objects", () => {
      const { values, setFieldValue } = useFormik({
        initialValues: { contacts: [{ code: "", number: "" }] },
      });
      setFieldValue("contacts[0].code", "+91");
      expect(values.contacts[0].code).toBe("+91");
    });

    test("object field", () => {
      const { values, setFieldValue } = useFormik({
        initialValues: { contact: { code: "", number: "" }, name: "" },
      });
      setFieldValue("contact.code", "+91");
      expect(values.contact.code).toBe("+91");
      setFieldValue("contact.number", "1234567890");
      expect(values.contact.number).toBe("1234567890");
      setFieldValue("name", "kiran");
      expect(values).toEqual({ contact: { code: "+91", number: "1234567890" }, name: "kiran" });
    });
  });
  describe("setValues", () => {
    test("array of objects", () => {
      const { values, setValues } = useFormik({
        initialValues: { contacts: [{ code: "", number: "" }] },
      });
      setValues({
        ...values,
        contacts: [...values.contacts, { code: "+91", number: "1234567890" }],
      });
      expect(values.contacts.length).toBe(2);
      expect(values.contacts[1].code).toBe("+91");
      expect(values.contacts[1].number).toBe("1234567890");
    });

    test("replace option should replace entire values object", () => {
      const { values, setValues } = useFormik({
        initialValues: { name: "Jane", email: "jane@example.com" },
      });

      setValues({ name: "Alice" }, { replace: true });

      expect(values).toEqual({ name: "Alice" });
    });
  });
});
