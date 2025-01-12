import { beforeEach, describe, expect, test, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { FormikForm, useFormik } from "@/index";

describe("FormikForm", () => {
  let formik: ReturnType<typeof useFormik>
  const onSubmitMock = vi.fn()
  beforeEach(() => {
    formik = useFormik({
      initialValues: {
        name: "",
      },
      onSubmit: onSubmitMock,
    })
  })
  test("renders form",  () => {
    const wrapper = mount(FormikForm, {
      props: {
        formik
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
  test("renders form with children",  () => {
    const wrapper = mount(FormikForm, {
      props: {
        formik
      },
      slots: {
        default: "<input name='name' />"
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
  test("submit button calls formik.handleSubmit",  () => {
    const wrapper = mount(FormikForm, {
      props: {
        formik
      },
      slots: {
        default: "<button type='submit'>Submit</button>"
      }
    })
    const button = wrapper.find("button")
    expect(onSubmitMock).not.toHaveBeenCalled()
    button.trigger("submit")
    expect(onSubmitMock).toHaveBeenCalledTimes(1)
    const calledWith = onSubmitMock.mock.calls[0]
    expect(calledWith).toMatchSnapshot()
  })
})
