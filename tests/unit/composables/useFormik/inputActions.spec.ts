import { describe, expect, it } from "vitest";
import { useFormik } from "../../../../lib";

describe("useFormik input actions", async () => {
  describe("handleChange", () => {
    /**
     *   const handleFieldChange = (e: Event) => {
     *     const target = e.target as HTMLInputElement;
     *     const fieldName = target.name as keyof T;
     *     const value = target.type === "checkbox" ? target.checked : target.value;
     *
     *     setFieldValue(fieldName, value as T[keyof T]);
     *   };
     */
    const cases = [
      // {
      //   target: {
      //     name: "contacts",
      //     type: "text",
      //     value: "9876543210",
      //   },
      //   initialValues: { contacts: ""},
      //   expectedKey: "contacts",
      // },
      // {
      //   target: {
      //     name: "contacts[0]",
      //     type: "text",
      //     value: "9876543210",
      //   },
      //   initialValues: { contacts: [""]},
      //   expectedKey: "contacts[0]",
      // },
      {
        target: {
          name: "contacts[0].number",
          type: "text",
          value: "9876543210",
        },
        initialValues: { contacts: [{ code: "", number: "" }] },
        expectedKey: "contacts[0].number",
      },
    ];

    it.each(cases)("should set field value", async ({target, initialValues}) => {
      const { handleChange, values } = useFormik({ initialValues });

      // Act
      handleChange({ target });

      // Assert
      expect(values).toMatchSnapshot();
    })
    it.each(cases)("should set the field as touched", ({target, initialValues, expectedKey}) => {
      const { handleChange, touched } = useFormik({ initialValues });

      // Act
      handleChange({ target });

      // Assert
      expect(touched).toMatchSnapshot();
    })
  })
})
