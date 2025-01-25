import { vi, describe, test, expect } from "vitest";
import { useFieldArray, useFormik } from "@/index";

describe("useFieldArray composable", () => {
  test("should return null if formik is not provided", () => {
    const ufa = useFieldArray();
    expect(ufa).toBeUndefined();
  });

  describe("push method", () => {
    test.each([
      {
        name: "should add a value to an array field",
        initialValues: { names: ["John", "Doe"] },
        value: "Jane",
        expected: ["John", "Doe", "Jane"],
      },
      {
        name: "should add a value to an empty array field",
        initialValues: { names: [] },
        value: "Jane",
        expected: ["Jane"],
      },
      {
        name: "should add an object to an object array field",
        initialValues: { names: [{ name: "John" }] },
        value: { name: "Doe" },
        expected: [{ name: "John" }, { name: "Doe" }],
      },
      {
        name: "should add an object to an empty object array field",
        initialValues: { names: [] },
        value: { name: "Doe" },
        expected: [{ name: "Doe" }],
      },
      {
        name: "should add item to an array of strings",
        initialValues: { names: [""] },
        value: "",
        expected: ["", ""],
      },
    ])("$name", ({ initialValues, value, expected }) => {
      const fk = useFormik({ initialValues });
      const ufa = useFieldArray(fk);
      ufa.push("names", value);
      expect(fk.values.names).toEqual(expected);
    });

    test("should not add a value to a non-array field", () => {
      console.warn = vi.fn();
      const fk = useFormik({
        initialValues: { name: "John" },
      });
      const ufa = useFieldArray(fk);
      ufa.push("name", "Jane");
      expect(fk.values.name).toBe("John");
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith("Field \"name\" is not an array");
    });

    test("pushing at specific index", () => {
      const fk = useFormik({
        initialValues: { names: ["John", "Doe"] },
      })
      const ufa = useFieldArray(fk);
      ufa.push("names", "Jane", 1);
      expect(fk.values.names).toEqual(["John", "Jane", "Doe"]);
    })

    test("pushing at specific index (out of bounds)", () => {
      console.warn = vi.fn();
      const fk = useFormik({
        initialValues: { names: ["John", "Doe"] },
      })
      const ufa = useFieldArray(fk);
      ufa.push("names", "Jane", 3);
      expect(fk.values.names).toEqual(["John", "Doe"]);
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith("Index 3 out of bounds for field \"names\"");
    })
  });

  describe("pop method", () => {
    test.each([
      {
        name: "should remove a value from an array field",
        initialValues: { names: ["John", "Doe", "Jane"] },
        index: 1,
        expected: ["John", "Jane"],
      },
      {
        name: "should remove the only value from an array field",
        initialValues: { names: ["John"] },
        index: 0,
        expected: [],
      },
      {
        name: "should remove a object from an object array field",
        initialValues: { names: [{ name: "John" }, { name: "Doe" }] },
        index: 1,
        expected: [{ name: "John" }],
      },
      {
        name: "should remove a object from an object array field",
        initialValues: { names: [{ name: "John" }, { name: "Doe" }] },
        index: 0,
        expected: [{ name: "Doe" }],
      },
    ])("$name", ({ initialValues, index, expected }) => {
      const fk = useFormik({ initialValues });
      const ufa = useFieldArray(fk);
      ufa.pop("names", index);
      expect(fk.values.names).toEqual(expected);
    });

    test("should not remove a value from a non-array field", () => {
      console.warn = vi.fn();
      const fk = useFormik({
        initialValues: { name: "John" },
      });
      const ufa = useFieldArray(fk);
      ufa.pop("name", 0);
      expect(fk.values.name).toBe("John");
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith("Field \"name\" is not an array");
    });

    test("index out of bounds", () => {
      console.warn = vi.fn();
      const fk = useFormik({
        initialValues: { names: ["John", "Doe"] },
      });
      const ufa = useFieldArray(fk);
      ufa.pop("names", 2);
      expect(fk.values.names).toEqual(["John", "Doe"]);
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith("Index 2 out of bounds for field \"names\"");
    });

    test("index out of bounds (-ve index)", () => {
      console.warn = vi.fn();
      const fk = useFormik({
        initialValues: { names: ["John", "Doe"] },
      });
      const ufa = useFieldArray(fk);
      ufa.pop("names", -1);
      expect(fk.values.names).toEqual(["John", "Doe"]);
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith("Index -1 out of bounds for field \"names\"");
    });

    test("should clear touched value as well", () => {
      const fk = useFormik({
        initialValues: { names: ["John", "Doe"] },
      });
      const ufa = useFieldArray(fk);
      fk.setFieldTouched("names[0]", true);
      fk.setFieldTouched("names[1]", true);
      ufa.pop("names", 0);
      expect(fk.getFieldTouched("names[0]")).toBeUndefined();
    });
    test("should clear touched value as well for object array fields", () => {
      const fk = useFormik({
        initialValues: { names: [{ name: "John" }, { name: "Doe" }] },
      });
      const ufa = useFieldArray(fk);
      fk.setFieldTouched("names[0].name", true);
      fk.setFieldTouched("names[1].name", true);
      ufa.pop("names", 0);
      expect(fk.getFieldTouched("names[0].name")).toBeUndefined();
    });
  });

  test("should return push and pop methods", () => {
    const fk = useFormik({ initialValues: { names: ["John", "Doe"] } });
    const ufa = useFieldArray(fk);
    expect(ufa).toEqual({
      push: expect.any(Function),
      pop: expect.any(Function),
    });
  });
});
