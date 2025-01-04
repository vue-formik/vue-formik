import { describe, expect, it } from "vitest";
import { useFormik } from "../../../../lib";

const cases = [
  {
    target: {
      name: "contacts",
      type: "text",
      value: "9876543210",
    },
    initialValues: { contacts: ""},
  },
  {
    target: {
      name: "contacts[0]",
      type: "text",
      value: "9876543210",
    },
    initialValues: { contacts: [""]},
  },
  {
    target: {
      name: "contacts[0].number",
      type: "text",
      value: "9876543210",
    },
    initialValues: { contacts: [{ code: "", number: "" }] },
  },
];

describe("useFormik input actions", async () => {
  describe("handleFieldChange", () => {

    it.each(cases)("should set field value", async ({target, initialValues}) => {
      const { handleFieldChange, values } = useFormik({ initialValues });
      handleFieldChange({ target });
      expect(values).toMatchSnapshot();
    })
    it.each(cases)("should set the field as touched", ({target, initialValues}) => {
      const { handleFieldChange, touched } = useFormik({ initialValues });
      handleFieldChange({ target });
      expect(touched).toMatchSnapshot();
    })
  })
})
