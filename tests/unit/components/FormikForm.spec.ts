import { beforeEach, describe, expect, test, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { FormikForm, useFormik } from "@/index";
import type { Formik } from "@/types";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

describe("FormikForm", () => {
  let formik: Formik;
  const onSubmitMock = vi.fn();
  beforeEach(() => {
    onSubmitMock.mockReset();
    formik = useFormik({
      initialValues: {
        name: "",
      },
      onSubmit: onSubmitMock,
    });
  });
  test("renders form", () => {
    const wrapper = mount(FormikForm, {
      props: {
        formik,
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
  test("renders form with children", () => {
    const wrapper = mount(FormikForm, {
      props: {
        formik,
      },
      slots: {
        default: "<input name='name' />",
      },
    });
    expect(wrapper.html()).toMatchSnapshot();
  });
  test("submit button calls formik.handleSubmit", async () => {
    const wrapper = mount(FormikForm, {
      props: {
        formik,
      },
      slots: {
        default: "<button type='submit'>Submit</button>",
      },
    });
    const button = wrapper.find("button");
    expect(onSubmitMock).not.toHaveBeenCalled();
    await button.trigger("submit");
    await flush();
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    const calledWith = onSubmitMock.mock.calls[0];
    expect(calledWith).toMatchSnapshot();
  });

  describe("reset", () => {
    test("reset button calls formik.resetForm", () => {
      const wrapper = mount(FormikForm, {
        props: {
          formik,
        },
        slots: {
          default: "<button type='reset'>Reset</button>",
        },
      });
      const button = wrapper.find("button");
      expect(formik.values.name).toBe("");
      formik.setFieldValue("name", "John");
      expect(formik.values.name).toBe("John");
      button.trigger("reset");
      expect(formik.values.name).toBe("");
    });
    test.each([
      ["reset keeping touched", true, true],
      ["reset without keeping touched", false, undefined],
    ])("%s", (_, keepTouched, expected) => {
      const wrapper = mount(FormikForm, {
        props: {
          formik,
          resetOptions: {
            keepTouched,
          },
        },
        slots: {
          default: "<button type='reset'>Reset</button>",
        },
      });
      const button = wrapper.find("button");
      formik.setFieldTouched("name", true);
      expect(formik.touched.name).toBe(true);
      button.trigger("reset");
      expect(formik.touched.name).toBe(expected);
    });
    test("reset with new initialValues", () => {
      const wrapper = mount(FormikForm, {
        props: {
          formik,
          resetOptions: {
            values: {
              name: "Jane",
            },
          },
        },
        slots: {
          default: "<button type='reset'>Reset</button>",
        },
      });
      const button = wrapper.find("button");
      expect(formik.values.name).toBe("");
      button.trigger("reset");
      expect(formik.values.name).toBe("Jane");
    });
  });
});
