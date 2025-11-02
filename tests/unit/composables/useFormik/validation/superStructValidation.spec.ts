import { describe, test, expect } from "vitest";
import * as s from "superstruct";
import { useFormik } from "@/index";
import { nextTick } from "vue";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

describe("superstruct validation", () => {
  const userSchema = s.object({
    name: s.nonempty(s.string()),
    age: s.optional(s.number()),
    email: s.pattern(s.string(), /^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    hobbies: s.optional(s.array(s.nonempty(s.string()))),
    address: s.optional(
      s.object({
        street: s.optional(s.size(s.string(), 2, 32)),
        city: s.optional(s.size(s.string(), 2, 16)),
      }),
    ),
  });

  const user = {
    name: "John Doe",
    age: 30,
    email: "test",
    hobbies: ["reading", "gaming"],
    address: {},
  } as s.Infer<typeof userSchema>;

  test("validate string", async () => {
    const fk = useFormik({
      initialValues: user,
      structSchema: userSchema,
      validateOnMount: true,
    });

    await flush();
    expect(fk.isValid.value).toBe(false);
    expect(fk.errors).toMatchSnapshot();
  });

  test("validate array", async () => {
    const fk = useFormik({
      initialValues: {
        ...user,
        email: "test@test.com",
      },
      structSchema: userSchema,
    });
    fk.setFieldValue("hobbies[0]", "");
    fk.setFieldTouched("hobbies[0]", true);

    await flush();

    expect(fk.isValid.value).toBe(false);
    expect(fk.errors).toMatchSnapshot();
  });

  test("validate object", async () => {
    const fk = useFormik({
      initialValues: user,
      structSchema: userSchema,
    });

    fk.setFieldValue("address.street", "A");
    fk.setFieldTouched("address.street", true);

    await flush();

    expect(fk.isValid.value).toBe(false);
    expect(fk.errors).toMatchSnapshot();
  });

  test("complex validation", async () => {
    const fk = useFormik({
      initialValues: {
        criteria: [{ property: "", comparator: "", range: [{ from: "", to: "" }] }],
      },
      structSchema: s.object({
        criteria: s.array(
          s.object({
            property: s.optional(s.string()),
            comparator: s.optional(s.string()),
            range: s.optional(
              s.array(
                s.object({
                  from: s.nonempty(s.string()),
                  to: s.nonempty(s.string()),
                }),
              ),
            ),
          }),
        ),
      }),
    });

    fk.setFieldValue("criteria[0].property", "test");

    await flush();

    expect(fk.isValid.value).toBe(false);
    expect(fk.errors).toMatchSnapshot();
  });
});
