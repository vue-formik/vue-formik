import { describe, test, expect } from "vitest";
import { clearObject } from "@/helpers";

describe("clearObject", async () => {
  test("should clear a flat object", async () => {
    const obj = { a: 1, b: 2, c: 3 };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should clear a nested object", async () => {
    const obj = {
      a: 1,
      b: { c: 2, d: { e: 3 } },
    };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should handle empty objects", async () => {
    const obj = {};
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should handle objects with arrays", async () => {
    const obj = {
      a: [1, 2, 3],
      b: { c: [4, 5] },
    };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should preserve empty objects when preserveEmpty is true", async () => {
    const obj = {
      a: { b: { c: {} } },
      d: [],
    };
    clearObject(obj, { preserveEmpty: true });
    expect(obj).toEqual({ a: { b: { c: {} } }, d: [] });
  });

  test("should handle circular references", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: any = { a: 1 };
    obj.self = obj; // Circular reference
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should clear objects while excluding specified properties", async () => {
    const obj = {
      a: 1,
      b: 2,
      c: { d: 3, e: 4 },
    };
    clearObject(obj, { exclude: new Set(["b", "c.e"]) });
    expect(obj).toEqual({ b: 2, c: { e: 4 } });
  });

  test("should clear an object but preserve prototype when preservePrototype is true", async () => {
    class MyClass {
      a = 1;
      b = 2;
    }
    const obj = new MyClass();
    clearObject(obj, { preservePrototype: true });
    expect(Object.getPrototypeOf(obj)).toBe(MyClass.prototype);
    expect(obj).toEqual({});
  });

  test("should remove properties including symbols", async () => {
    const sym = Symbol("test");
    const obj = { a: 1, [sym]: 2 };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should clear Maps and Sets", async () => {
    const obj = {
      map: new Map([
        ["key1", "value1"],
        ["key2", "value2"],
      ]),
      set: new Set([1, 2, 3]),
    };
    clearObject(obj);
    expect(obj.map.size).toBe(0);
    expect(obj.set.size).toBe(0);
  });

  test("should clear Dates by resetting time to 0", async () => {
    const obj = { date: new Date() };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should not modify WeakMap and WeakSet", async () => {
    const obj = {
      weakMap: new WeakMap(),
      weakSet: new WeakSet(),
    };
    clearObject(obj);
    expect(obj.weakMap).toBeInstanceOf(WeakMap);
    expect(obj.weakSet).toBeInstanceOf(WeakSet);
  });

  test("should not clear Vue reactivity objects", async () => {
    const obj = { __v_isRef: true, __v_isReactive: true, value: 42 };
    clearObject(obj);
    expect(obj.value).toBe(42);
  });

  test("should not clear DOM nodes", async () => {
    const div = document.createElement("div");
    const obj = { node: div };
    clearObject(obj);
    expect(obj.node).toBe(div);
  });

  test("should work with object containing null values", async () => {
    const obj = { a: null, b: { c: null } };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should handle objects with functions", async () => {
    const obj = { a: 1, fn: () => "test" };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should not modify primitive types", async () => {
    const obj = "test";
    // @ts-expect-error - Testing for side effects
    clearObject(obj);
    expect(obj).toBe("test");
  });

  test("should handle deeply nested arrays", async () => {
    const obj = {
      arr: [
        [1, 2],
        [3, 4],
      ],
      obj: {
        nested: [
          [5, 6],
          [7, 8],
        ],
      },
    };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should clear non-enumerable properties", async () => {
    const obj = {};
    Object.defineProperty(obj, "hidden", { value: "secret", enumerable: false });
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should handle objects with mixed primitive values", async () => {
    const obj = { a: "text", b: 123, c: true };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should clear an array of objects", async () => {
    const obj = { list: [{ a: 1 }, { b: 2 }] };
    clearObject(obj);
    expect(obj).toEqual({});
  });

  test("should correctly handle objects with getters and setters", async () => {
    const obj = {
      _value: 10,
      get value() {
        return this._value;
      },
      set value(val) {
        this._value = val;
      },
    };
    clearObject(obj);
    expect(obj).toEqual({});

    // Ensure getters and setters are preserved
    expect(obj.value).toBeUndefined();
    obj.value = 20;
    expect(obj.value).toBe(20);
  });

  test("should not clear frozen objects", async () => {
    const obj = Object.freeze({ a: 1, b: 2 });
    clearObject(obj);
    expect(obj).toEqual({
      a: 1,
      b: 2,
    });
  });

  test("should not clear objects with a locked prototype", async () => {
    const proto = { a: 1 };
    const obj = Object.create(proto);
    obj.b = 2;
    clearObject(obj);
    expect(obj).toEqual({});
    expect(obj.a).toBe(1); // Prototype remains
  });
});
