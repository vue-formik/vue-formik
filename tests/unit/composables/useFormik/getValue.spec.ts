import { describe, it, expect } from "vitest";
import { useFormik } from "../../../../lib";

describe("useFormik getValue", async () => {
  describe("getFieldValue", () => {
    it("should return field value", async () => {
      const { getFieldValue, setFieldValue } = useFormik({
        initialValues: { name: "" },
      });

      expect(getFieldValue("name")).toBe("");
      setFieldValue("name", "John Doe");
      expect(getFieldValue("name")).toBe("John Doe");
    });
    it("should return array field value", async () => {
      const { getFieldValue, setFieldValue } = useFormik({
        initialValues: { contacts: [""] },
      });

      expect(getFieldValue("contacts[0]")).toBe("");
      setFieldValue("contacts[0]", "9876543210");
      expect(getFieldValue("contacts[0]")).toBe("9876543210");
    });
    it("should return nested field value", async () => {
      const { getFieldValue, setFieldValue } = useFormik({
        initialValues: { contacts: [{ code: "", number: "" }] },
      });

      expect(getFieldValue("contacts[0].number")).toBe("");
      setFieldValue("contacts[0].number", "9876543210");
      expect(getFieldValue("contacts[0].number")).toBe("9876543210");
    });
    it("should return object field value", async () => {
      const { getFieldValue, setFieldValue } = useFormik({
        initialValues: { address: { city: "", country: "" } },
      });

      expect(getFieldValue("address.city")).toBe("");
      setFieldValue("address.city", "New York");
      expect(getFieldValue("address.city")).toBe("New York");
    });
  });
});
