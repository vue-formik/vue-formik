import { describe, test, expect } from "vitest";
import { getNestedValue } from "@/helpers";

describe("getNestedValue", () => {
  test.each([
    [{ a: { b: { c: 1 } } }, "a.b.c", 1],
    [{ a: { b: { c: 1 } } }, "a.b", { c: 1 }],
    [{ a: { b: { c: 1 } } }, "a", { b: { c: 1 } }],
    [{ a: { b: { c: 1 } } }, "a.b.d", undefined],
    [{ a: { b: { c: 1 } } }, "a.b.c.d", undefined],
    [{ a: { b: { c: 1 } } }, "a.b.c[0]", undefined],
    [{ a: { b: { c: [1, 2, 3] } } }, "a.b.c[1]", 2],
    [{ a: { b: { c: [1, 2, 3] } } }, "a.b.c[3]", undefined],
    [{ a: { b: { c: [1, 2, 3] } } }, "a.b.c[1].d", undefined],
    [{ a: { b: { c: [1, 2, 3] } } }, "a.b.c[1][0]", undefined],
    [null, "a.b.c", undefined],
    [true, "a.b.c", undefined],
    [["a", "b", "c"], "a.b.c", undefined],
    [{ a: 1 }, "", undefined],
  ])("should get nested value from object", (obj, path, expected) => {
    // @ts-expect-error - because we are testing null for obj
    const actual = getNestedValue(obj, path);
    // toEqual handles both primitives and objects/arrays, avoiding a conditional expect.
    expect(actual).toEqual(expected);
  });
});
