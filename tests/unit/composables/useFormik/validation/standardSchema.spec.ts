import { describe, expect, test } from "vitest";
import { z } from "zod";
import { nextTick } from "vue";
import { useFormik } from "@/index";
import type { StandardSchemaV1 } from "@/types";

const flush = async () => {
  await Promise.resolve();
  await nextTick();
  await Promise.resolve();
};

describe("Standard Schema validation", () => {
  test("validates a flat form via a zod schema's ~standard interface", async () => {
    const standardSchema = z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email"),
    });

    const formik = useFormik({
      initialValues: { name: "", email: "bad" },
      standardSchema,
    });

    await flush();

    expect(formik.errors).toEqual({
      name: "Name is required",
      email: "Invalid email",
    });
    expect(formik.isValid.value).toBe(false);
  });

  test("clears errors when values become valid", async () => {
    const standardSchema = z.object({
      name: z.string().min(1, "Name is required"),
    });

    const formik = useFormik({
      initialValues: { name: "" },
      standardSchema,
    });
    await flush();
    expect(formik.errors).toEqual({ name: "Name is required" });

    formik.setFieldValue("name", "Ada");
    await flush();
    expect(formik.errors).toEqual({});
    expect(formik.isValid.value).toBe(true);
  });

  test("maps nested and array paths to bracket/dot notation", async () => {
    const standardSchema = z.object({
      address: z.object({ city: z.string().min(1, "City is required") }),
      tags: z.array(z.string().min(1, "Tag cannot be empty")),
    });

    const formik = useFormik({
      initialValues: { address: { city: "" }, tags: ["ok", ""] },
      standardSchema,
    });

    await flush();

    expect((formik.errors.address as { city?: string }).city).toBe("City is required");
    expect((formik.errors.tags as string[])[1]).toBe("Tag cannot be empty");
  });

  test("works with a hand-rolled Standard Schema (no schema library)", async () => {
    // Minimal StandardSchemaV1 implementation to prove the adapter is library-agnostic.
    const standardSchema: StandardSchemaV1<{ age: number }> = {
      "~standard": {
        version: 1,
        vendor: "custom",
        validate: (value) => {
          const v = value as { age: number };
          if (v.age < 18) {
            return { issues: [{ message: "Must be 18+", path: ["age"] }] };
          }
          return { value: v };
        },
      },
    };

    const formik = useFormik({
      initialValues: { age: 10 },
      standardSchema,
    });
    await flush();
    expect(formik.errors.age).toBe("Must be 18+");

    formik.setFieldValue("age", 21);
    await flush();
    expect(formik.errors).toEqual({});
  });
});
