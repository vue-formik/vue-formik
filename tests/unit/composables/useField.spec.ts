import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { useField, useFormik } from "@/index";
import type { Formik } from "@/types";

const flush = async () => {
  for (let i = 0; i < 4; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

// Mounts useField inside a real component scope (so onScopeDispose works) and
// exposes the binding for assertions.
const mountField = (formik: Formik, name: string) => {
  let api!: ReturnType<typeof useField>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useField(() => name, { formik });
        return () => h("div");
      },
    }),
  );
  return { wrapper, field: api };
};

describe("useField", () => {
  test("reads and writes the field value via the formik instance", async () => {
    const formik = useFormik({ initialValues: { name: "init" } });
    const { wrapper, field } = mountField(formik, "name");

    expect(field.value.value).toBe("init");

    field.value.value = "updated";
    await flush();
    expect(formik.values.name).toBe("updated");

    formik.setFieldValue("name", "external");
    await flush();
    expect(field.value.value).toBe("external");

    wrapper.unmount();
  });

  test("exposes error/touched/hasError reactive state", async () => {
    const formik = useFormik({
      initialValues: { name: "" },
      validationSchema: { name: (v: string) => (v ? undefined : "required") },
    });
    const { wrapper, field } = mountField(formik, "name");

    formik.setFieldTouched("name", true);
    await flush();
    expect(field.hasError.value).toBe(true);
    expect(field.error.value).toBe("required");
    expect(field.touched.value).toBe(true);

    wrapper.unmount();
  });

  test("registers a field-level validation rule and cleans up on unmount", async () => {
    const formik = useFormik({ initialValues: { name: "start" } });

    const wrapper = mount(
      defineComponent({
        setup() {
          useField(() => "name", {
            formik,
            validation: () => (v) => (v ? undefined : "required via useField"),
          });
          return () => h("div");
        },
      }),
    );

    // Change to empty so the on-change validation runs the registered rule.
    formik.setFieldValue("name", "");
    await flush();
    expect(formik.errors.name).toBe("required via useField");

    wrapper.unmount();
    formik.setFieldValue("name", "again");
    await flush();
    // After unmount the validator is unregistered, so no error is produced.
    expect(formik.errors).toEqual({});
  });

  test("onBlur marks the field touched", async () => {
    const formik = useFormik({ initialValues: { name: "" } });
    const { wrapper, field } = mountField(formik, "name");

    field.onBlur({ target: { name: "name" } } as unknown as FocusEvent);
    await flush();
    expect(formik.getFieldTouched("name")).toBe(true);

    wrapper.unmount();
  });
});
