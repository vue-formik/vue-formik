import * as Yup from "yup";

interface IContact {
  code: string;
  number: string;
}

const InitialValues: {
  name: string;
  email: string;
  contacts: IContact[];
  sex: string;
  message: string;
  addresses: string[];
} = {
  name: "",
  email: "",
  contacts: [{ code: "", number: "" }],
  sex: "",
  message: "",
  addresses: [""],
};

const ValidationSchema = {
  name: (value: string) => {
    if (!value) return "Name is required";
    return undefined;
  },
  email: (value: string) => {
    if (!value) return "Email is required";
    if (!value.includes("@")) return "Invalid email";
    return undefined;
  },
  contacts: (values: IContact[]) => {
    if (values.length === 0) {
      return [{ code: "Code is required", number: "Number is required" }];
    }

    const errs: Record<string, string | undefined>[] = [];
    for (let i = 0; i < values.length; i++) {
      const err: Record<string, string | undefined> = {};
      if (!values[i].code) err["code"] = "Code is required";
      if (!values[i].number) err["number"] = "Number is required";

      if (Object.keys(err).length) errs.push(err);
    }

    return errs.length ? errs : undefined;
  },
  addresses: (values: string[]) => {
    const errs: (string | undefined)[] = [];
    for (const value of values) {
      if (!value) errs.push("Address is required");
      else if (value.length < 3) errs.push("Address must be at least 3 characters");
      else if (value.length > 50) errs.push("Address must be at most 50 characters");
    }

    return errs.length ? errs : undefined;
  },
};

const ValidationSchemaYup = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  contacts: Yup.array()
    .required("Contacts are required")
    .of(
      Yup.object().shape({
        code: Yup.string()
          .matches(/^\+\d{2,3}$/g, "Invalid code. Must be in format +91")
          .required("Code is required"),
        number: Yup.string()
          .matches(/^\d{10}$/g, "Invalid phone number. Must be 10 digits")
          .required("Number is required"),
      }),
    ),
  addresses: Yup.array()
    .required("Addresses are required")
    .of(
      Yup.string()
        .min(3, "Address must be at least 3 characters")
        .max(50, "Address must be at most 50 characters")
        .required("Address is required"),
    ),
});

export { InitialValues, ValidationSchema, ValidationSchemaYup };
