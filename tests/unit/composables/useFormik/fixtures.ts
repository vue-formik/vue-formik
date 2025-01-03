import { vi } from "vitest";

export const initialValues = {
  name: "Kiran",
  email: "kiran@parajuli.cc",
}
export const emptyInitialValues = {
  name: "",
  email: "",
}
export const onSubmit = vi.fn()

export const validationSchema = {
  name: (value: string) => {
    if (!value) {
      return "Name is required"
    }
  },
  email: (value: string) => {
    if (!value) {
      return "Email is required"
    }
    if (!value.includes("@")) {
      return "Invalid email"
    }
  }
}
