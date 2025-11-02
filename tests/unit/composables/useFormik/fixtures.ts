import { vi } from "vitest";
import type { Mock } from "vitest";
import * as Yup from "yup";

export const initialValues = {
  name: "Kiran",
  email: "kiran@parajuli.cc",
};
export const emptyInitialValues = {
  name: "",
  email: "",
};
export const onSubmit: Mock = vi.fn();

export const validationSchema = {
  name: (value: string) => {
    if (!value) {
      return "This field is required";
    }
  },
  email: (value: string) => {
    if (!value) {
      return "Email is required";
    }
    if (!value.includes("@")) {
      return "Invalid email";
    }
  },
};

export const initialValues1 = {
  name: "",
  email: "",
};
export const initialValues2 = Object.freeze({
  names: ["", ""],
  contacts: [{ code: "", number: "" }],
  address: {
    state: "",
    city: "",
    country: "",
  },
});
export const validationSchema1 = Yup.object().shape({
  name: Yup.string().required("This field is required").max(10, "Max 10 characters"),
  email: Yup.string().required("This field is required.").email("Invalid email"),
});
export const validationSchema2 = Yup.object().shape({
  names: Yup.array().of(Yup.string().required("This field is required")),
  contacts: Yup.array()
    .required("This field is required")
    .of(
      Yup.object().shape({
        code: Yup.string().required("This field is required"),
        number: Yup.string().required("This field is required"),
      }),
    ),
  address: Yup.object().shape({
    state: Yup.string().required("This field is required"),
    city: Yup.string().required("This field is required"),
    country: Yup.string().required("This field is required"),
  }),
});
export const validationSchema3 = {
  names: (values: string[]) => {
    if (values.length === 0) {
      return "This field is required";
    }
    const errs = [];
    for (let i = 0; i < values.length; i++) {
      if (!values[i]) {
        errs[i] = "This field is required";
      } else {
        errs[i] = "";
      }
    }

    return errs.length ? errs : undefined;
  },
  contacts: (values: { code: string; number: string }[]) => {
    if (values.length === 0) {
      return "This field is required";
    }
    const errs = [];
    for (let i = 0; i < values.length; i++) {
      const err = {
        code: "",
        number: "",
      };
      if (!values[i].code) {
        err["code"] = "This field is required";
      }
      if (!values[i].number) {
        err["number"] = "This field is required";
      }
      errs.push(err);
    }
    return errs.length ? errs : undefined;
  },
  address: (value: { state: string; city: string; country: string }) => {
    const errs = {
      state: "",
      city: "",
      country: "",
    };
    if (!value.state) {
      errs["state"] = "This field is required";
    }
    if (!value.city) {
      errs["city"] = "This field is required";
    }
    if (!value.country) {
      errs["country"] = "This field is required";
    }

    return errs;
  },
};
