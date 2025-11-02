import { describe, expect, test } from "vitest";
import deepEqual from "@/helpers/formikObject/deepEqual";

describe("deepEqual", () => {
  describe("primitives", () => {
    test("should return true for equal strings", () => {
      expect(deepEqual("hello", "hello")).toBe(true);
    });

    test("should return false for different strings", () => {
      expect(deepEqual("hello", "world")).toBe(false);
    });

    test("should return true for equal numbers", () => {
      expect(deepEqual(42, 42)).toBe(true);
    });

    test("should return false for different numbers", () => {
      expect(deepEqual(42, 24)).toBe(false);
    });

    test("should return true for equal booleans", () => {
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
    });

    test("should return false for different booleans", () => {
      expect(deepEqual(true, false)).toBe(false);
    });

    test("should return true for null", () => {
      expect(deepEqual(null, null)).toBe(true);
    });

    test("should return true for undefined", () => {
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    test("should return false for null vs undefined", () => {
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });

  describe("objects", () => {
    test("should return true for equal objects", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    test("should return false for different objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    test("should return false for objects with different keys", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, c: 2 };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    test("should return false for nested objects with differences", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    test("should return true for empty objects", () => {
      expect(deepEqual({}, {})).toBe(true);
    });
  });

  describe("arrays", () => {
    test("should return true for equal arrays", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    test("should return false for different arrays", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    test("should return false for arrays with different lengths", () => {
      expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    test("should return true for empty arrays", () => {
      expect(deepEqual([], [])).toBe(true);
    });

    test("should handle nested arrays", () => {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
        ),
      ).toBe(false);
    });
  });

  describe("dates", () => {
    test("should return true for equal dates", () => {
      const date1 = new Date("2023-01-01T00:00:00.000Z");
      const date2 = new Date("2023-01-01T00:00:00.000Z");
      expect(deepEqual(date1, date2)).toBe(true);
    });

    test("should return false for different dates", () => {
      const date1 = new Date("2023-01-01T00:00:00.000Z");
      const date2 = new Date("2023-01-02T00:00:00.000Z");
      expect(deepEqual(date1, date2)).toBe(false);
    });
  });

  describe("complex nested structures", () => {
    test("should handle deeply nested objects", () => {
      const obj1 = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
            f: [1, 2, { g: 4 }],
          },
        },
      };
      const obj2 = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
            f: [1, 2, { g: 4 }],
          },
        },
      };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    test("should handle arrays with mixed types", () => {
      const arr1 = [1, "hello", { a: 1 }, [2, 3]];
      const arr2 = [1, "hello", { a: 1 }, [2, 3]];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    test("should detect differences in complex structures", () => {
      const obj1 = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
            f: [1, 2, { g: 4 }],
          },
        },
      };
      const obj2 = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
            f: [1, 2, { g: 5 }],
          },
        },
      };
      expect(deepEqual(obj1, obj2)).toBe(false);
    });
  });

  describe("reference equality", () => {
    test("should return true for same reference", () => {
      const obj = { a: 1 };
      expect(deepEqual(obj, obj)).toBe(true);
    });

    test("should handle circular references gracefully", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj1: any = { a: 1 };
      obj1.self = obj1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj2: any = { a: 1 };
      obj2.self = obj2;

      // Should not throw error
      expect(() => deepEqual(obj1, obj2)).not.toThrow();
    });
  });
});
