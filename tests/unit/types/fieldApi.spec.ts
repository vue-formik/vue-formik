import { describe, it, expect, expectTypeOf } from "vitest";
import { useFormik } from "@/index";

describe("typed field API (the wedge)", () => {
  it("getFieldValue is typed by path", () => {
    const f = useFormik({
      initialValues: {
        name: "",
        age: 0,
        tags: [] as string[],
        address: { city: "" },
      },
    });

    expectTypeOf(f.getFieldValue("name")).toEqualTypeOf<string | undefined>();
    expectTypeOf(f.getFieldValue("age")).toEqualTypeOf<number | undefined>();
    expectTypeOf(f.getFieldValue("tags[0]")).toEqualTypeOf<string | undefined>();
    expectTypeOf(f.getFieldValue("address.city")).toEqualTypeOf<string | undefined>();
    expect(true).toBe(true);
  });

  it("setFieldValue enforces path and value types", () => {
    const f = useFormik({ initialValues: { name: "", tags: [] as string[] } });

    f.setFieldValue("name", "ok");
    f.setFieldValue("tags[0]", "ok");

    // @ts-expect-error value must be a string for `name`
    f.setFieldValue("name", 123);
    // @ts-expect-error `nope` is not a valid path
    f.setFieldValue("nope", "x");

    expect(true).toBe(true);
  });
});
