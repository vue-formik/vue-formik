import { describe, test, expect } from "vitest";
import { setNestedValue } from "@/helpers";

describe("setNestedValue", () => {
  describe("Updating existing properties", () => {
    test("should update a directly nested property", () => {
      const obj = { name: "John Doe", address: { city: "Los Angeles", country: "USA" } };
      const updated = setNestedValue(obj, "address.city", "New York");
      expect(updated).toEqual({ name: "John Doe", address: { city: "New York", country: "USA" } });
    });

    test("should update a nested array property", () => {
      const obj = {
        name: "John Doe",
        addresses: [
          { city: "Los Angeles", country: "USA" },
          { city: "San Francisco", country: "USA" },
        ],
      };
      const updated = setNestedValue(obj, "addresses[1].city", "New York");
      expect(updated).toEqual({
        name: "John Doe",
        addresses: [
          { city: "Los Angeles", country: "USA" },
          { city: "New York", country: "USA" },
        ],
      });
    });

    test("should update a nested array containing another array", () => {
      const obj = {
        name: "John Doe",
        addresses: [
          { city: "Los Angeles", country: "USA", streets: [{ name: "Main St" }, { name: "Broadway" }] },
          { city: "San Francisco", country: "USA", streets: [{ name: "Market St" }, { name: "Mission St" }] },
        ],
      };
      const updated = setNestedValue(obj, "addresses[1].streets[1].name", "New St");
      expect(updated).toEqual({
        name: "John Doe",
        addresses: [
          { city: "Los Angeles", country: "USA", streets: [{ name: "Main St" }, { name: "Broadway" }] },
          { city: "San Francisco", country: "USA", streets: [{ name: "Market St" }, { name: "New St" }] },
        ],
      });
    });

    test("should update a deeply nested property", () => {
      const obj = {
        user: { profile: { details: { address: { city: "Los Angeles" } } } },
      };
      const updated = setNestedValue(obj, "user.profile.details.address.city", "New York");
      expect(updated).toEqual({
        user: { profile: { details: { address: { city: "New York" } } } },
      });
    });
  });

  describe("Handling missing indices and undefined values", () => {
    test("should create missing nested structures from scratch", () => {
      const obj: {
        address?: {
          city?: string;
        };
        contacts: {
          code?: string;
        }[];
      } = { contacts: [] };
      let updated = setNestedValue(obj, "address.city", "New York");
      updated = setNestedValue(updated, "contacts[2].code", "123");

      expect(updated).toEqual({
        address: { city: "New York" },
        contacts: [{}, {}, { code: "123" }],
      });
    });

    test("should fill missing indices in an array with undefined", () => {
      const obj: {
        name: string;
        addresses: string[];
      } = { name: "John Doe", addresses: [] };
      let updated = setNestedValue(obj, "addresses[1]", "San Francisco");
      updated = setNestedValue(updated, "addresses[2]", "USA");

      expect(updated).toEqual({
        name: "John Doe",
        addresses: [undefined, "San Francisco", "USA"],
      });
    });

    test("should create an empty object when setting a property inside a missing array index", () => {
      const obj: {
        name: string;
        addresses: { city: string }[];
      } = { name: "John Doe", addresses: [] };
      const updated = setNestedValue(obj, "addresses[0].city", "New York");

      expect(updated).toEqual({
        name: "John Doe",
        addresses: [{ city: "New York" }],
      });
    });

    test("should create nested array structures when indices are missing", () => {
      const obj: {
        users: { name?: string }[];
      } = { users: [] };
      const updated = setNestedValue(obj, "users[2].name", "Alice");

      expect(updated).toEqual({
        users: [{}, {}, { name: "Alice" }],
      });
    });

    test("should handle deeply nested missing indices in an array", () => {
      const obj: {
        name: string;
        addresses: { streets: { name?: string }[] }[];
      } = { name: "John Doe", addresses: [] };
      const updated = setNestedValue(obj, "addresses[0].streets[0].name", "Main St");

      expect(updated).toEqual({
        name: "John Doe",
        addresses: [{ streets: [{ name: "Main St" }] }],
      });
    });
  });

  describe("Overwriting existing values", () => {
    test("should overwrite a primitive value with an object", () => {
      const obj: {
        key: string;
      } = { key: "value" };
      const updated = setNestedValue(obj, "key", { nested: "data" });

      expect(updated).toEqual({
        key: { nested: "data" },
      });
    });

    test("should replace an array with a primitive value", () => {
      const obj: {
        items: number[];
      } = { items: [1, 2, 3] };
      const updated = setNestedValue(obj, "items", "not an array anymore");

      expect(updated).toEqual({
        items: "not an array anymore",
      });
    });

    test("should overwrite an object with null", () => {
      const obj: {
        settings: {
          theme: string;
        };
      } = { settings: { theme: "dark" } };
      const updated = setNestedValue(obj, "settings", null);

      expect(updated).toEqual({
        settings: null,
      });
    });
  });

  describe("Edge cases and invalid operations", () => {
    test("should not modify a non-object primitive", () => {
      const obj = "this is a string";
      // @ts-expect-error - Testing invalid input
      const updated = setNestedValue(obj, "nested.value", "new");

      expect(updated).toEqual("this is a string"); // No update since `obj` is not an object
    });

    test("should correctly update an object with mixed types", () => {
      const obj: {
        data: {
          items: string[];
          count: number;
        };
      } = { data: { items: ["apple", "banana"], count: 2 } };
      const updated = setNestedValue(obj, "data.count", 3);

      expect(updated).toEqual({
        data: { items: ["apple", "banana"], count: 3 },
      });
    });

    test("should correctly update a nested array inside an object", () => {
      const obj = { user: { preferences: { favoriteColors: ["blue", "green"] } } };
      const updated = setNestedValue(obj, "user.preferences.favoriteColors[1]", "red");

      expect(updated).toEqual({
        user: { preferences: { favoriteColors: ["blue", "red"] } },
      });
    });

    test("should create a nested structure in an empty object", () => {
      const obj = {};
      const updated = setNestedValue(obj, "user.profile.name", "John Doe");

      expect(updated).toEqual({
        user: { profile: { name: "John Doe" } },
      });
    });
  });
});
