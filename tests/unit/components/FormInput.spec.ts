import { describe, test, expect, beforeEach } from "vitest";

import { mount, shallowMount, VueWrapper } from "@vue/test-utils";
import FormInput from "@/components/FormInput.vue";
import useFormik from "@/composables/useFormik";
import { nextTick } from "vue";

describe("FormInput", async () => {
  const formik = useFormik({
    initialValues: {
      fullName: "",
      addresses: [""],
      contact: {
        code: "",
        number: "",
      },
    },
    validationSchema: {
      fullName: (value: string) => {
        if (!value) {
          return "Full Name is required";
        }
        if (value.length < 5) {
          return "Full Name is too short";
        }
        if (/[^a-zA-Z ]/.test(value)) {
          return "Full Name is invalid";
        }
      },
      addresses: (values: string[]) => {
        if (!values.length) {
          return "Addresses is required";
        }
        const errors: string[][] = [];
        values.forEach((value) => {
          const e: string[] = [];
          if (!value) {
            e.push("Address is required");
          }
          if (value.length < 5) {
            e.push("Address is too short");
          }
          if (/[^a-zA-Z0-9 ]/.test(value)) {
            e.push("Address is invalid");
          }

          errors.push(e);
        });
        return errors;
      },
      contact: (value: { code: string; number: string }) => {
        const err = {
          code: "",
          number: "",
        };
        if (!value.code) {
          err.code = "Code is required";
        }
        if (value.code.length < 3) {
          err.code = "Code is too short";
        }
        if (!value.number) {
          err.number = "Number is required";
        }
        if (value.number.length < 5) {
          err.number = "Number is too short";
        }
        return err;
      },
    },
  });

  let wrapper: VueWrapper<unknown>;

  describe("formik prop usage", () => {
    beforeEach(() => {
      formik.reset();
      wrapper = mount(FormInput, {
        props: {
          name: "fullName",
          formik,
        },
      });
    });

    test("renders input", () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    test("handleChange", () => {
      wrapper.find("input").setValue("John Doe");
      expect(formik.values.fullName).toBe("John Doe");
      expect(wrapper.find("input").element.value).toBe("John Doe");
    });

    test("renders label", async () => {
      await wrapper.setProps({ label: "Full Name" });
      await nextTick();
      expect(wrapper.html()).toMatchSnapshot();
    });

    test("shows error message on blur", async () => {
      await wrapper.find("input").setValue("");
      await wrapper.find("input").trigger("blur");
      await nextTick();
      expect(wrapper.html()).toMatchSnapshot();
    });

    describe("Field with array index", () => {
      beforeEach(() => {
        wrapper = mount(FormInput, {
          props: {
            name: "addresses[0]",
            formik: formik,
          },
        });
      });

      test("renders input", () => {
        expect(wrapper.html()).toMatchSnapshot();
      });

      test("various errors", async () => {
        await wrapper.find("input").trigger("blur");
        await nextTick();
        expect(wrapper.html()).toMatchSnapshot();
        await wrapper.find("input").setValue("$%");
        expect(wrapper.html()).toMatchSnapshot();
      });

      test("handleChange", () => {
        wrapper.find("input").setValue("123 Main St");
        expect(formik.values.addresses[0]).toBe("123 Main St");
        expect(wrapper.find("input").element.value).toBe("123 Main St");
      });
    });

    describe("Field with object type", () => {
      beforeEach(() => {
        wrapper = mount(FormInput, {
          props: {
            name: "contact.code",
            formik: formik,
          },
        });
      });

      test("renders input", () => {
        expect(wrapper.html()).toMatchSnapshot();
      });

      test("various errors", async () => {
        await wrapper.find("input").trigger("blur");
        await nextTick();
        expect(wrapper.html()).toMatchSnapshot();
        await wrapper.find("input").setValue("123");
        expect(wrapper.html()).toMatchSnapshot();
      });

      test("handleChange", () => {
        wrapper.find("input").setValue("123");
        expect(formik.values.contact.code).toBe("123");
        expect(wrapper.find("input").element.value).toBe("123");
      });
    });

    describe("type class", () => {
      test("default", () => {
        expect(wrapper.classes()).toContain("vf-text-field");
      });
      test("password", async () => {
        await wrapper.setProps({ type: "password" });
        expect(wrapper.classes()).toContain("vf-password-field");
        expect(wrapper.classes()).not.toContain("vf-text-field");
      });
    });

    test("required prop", async () => {
      await wrapper.setProps({ required: true });
      await nextTick();
      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe("provide formik and inject usage", () => {
    beforeEach(() => {
      formik.reset();
      wrapper = shallowMount(FormInput, {
        props: {
          name: "fullName",
        },
        global: {
          provide: {
            formik: formik,
          },
        },
      });
    });

    test("handleChange", async () => {
      await wrapper.find("input").setValue("John Doe");
      await nextTick();
      expect(formik.values.fullName).toBe("John Doe");
      expect(wrapper.find("input").element.value).toBe("John Doe");
    });
  });
});
