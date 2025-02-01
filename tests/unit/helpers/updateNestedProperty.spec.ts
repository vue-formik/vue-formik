import { describe, test, expect } from "vitest";
import { updateNestedProperty } from "@/helpers";

describe("updateNestedProperty", () => {
  test("should update nested property", () => {
    const obj = {
      name: "John Doe",
      address: {
        city: "Los Angeles",
        country: "USA",
      },
    };
    const updated = updateNestedProperty(obj, "address.city", "New York");
    expect(updated).toEqual({
      name: "John Doe",
      address: {
        city: "New York",
        country: "USA",
      },
    });
  });

  test("should update nested array property", () => {
    const obj = {
      name: "John Doe",
      addresses: [
        {
          city: "Los Angeles",
          country: "USA",
        },
        {
          city: "San Francisco",
          country: "USA",
        },
      ],
    };
    const updated = updateNestedProperty(obj, "addresses[1].city", "New York");
    expect(updated).toEqual({
      name: "John Doe",
      addresses: [
        {
          city: "Los Angeles",
          country: "USA",
        },
        {
          city: "New York",
          country: "USA",
        },
      ],
    });
  });

  test("should update nested array property with nested array", () => {
    const obj = {
      name: "John Doe",
      addresses: [
        {
          city: "Los Angeles",
          country: "USA",
          streets: [{ name: "Main St" }, { name: "Broadway" }],
        },
        {
          city: "San Francisco",
          country: "USA",
          streets: [{ name: "Market St" }, { name: "Mission St" }],
        },
      ],
    };
    const updated = updateNestedProperty(obj, "addresses[1].streets[1].name", "New St");
    expect(updated).toEqual({
      name: "John Doe",
      addresses: [
        {
          city: "Los Angeles",
          country: "USA",
          streets: [{ name: "Main St" }, { name: "Broadway" }],
        },
        {
          city: "San Francisco",
          country: "USA",
          streets: [{ name: "Market St" }, { name: "New St" }],
        },
      ],
    });
  });

  describe("non-exiting indexes", () => {
    test("brew from scratch", () => {
      const obj: {
        address?: {
          city?: string;
        };
        contacts: {
          code?: string;
        }[];
      } = {
        contacts: [],
      };
      let updated = updateNestedProperty(obj, "address.city", "New York");
      updated = updateNestedProperty(updated, "contacts[2].code", "123");

      expect(updated).toEqual({
        address: {
          city: "New York",
        },
        contacts: [
          {},
          {},
          {
            code: "123",
          },
        ],
      });
    });
    test("non-existing index should place undefined for non objects", () => {
      const obj: {
        name: string;
        addresses: string[]; // this should support undefined, so fix it likewise.
      } = {
        name: "John Doe",
        addresses: [],
      };
      let updated = updateNestedProperty(obj, "addresses[1]", "San Francisco");
      updated = updateNestedProperty(updated, "addresses[2]", "USA");
      expect(updated).toEqual({
        name: "John Doe",
        addresses: [undefined, "San Francisco", "USA"],
      });
    });

    test("non-existing index should place empty object", () => {
      const obj: {
        name: string;
        addresses: {
          city?: string;
        }[];
      } = {
        name: "John Doe",
        addresses: [],
      };
      const updated = updateNestedProperty(obj, "addresses[0].city", "New York");
      expect(updated).toEqual({
        name: "John Doe",
        addresses: [{ city: "New York" }],
      });
    });

    test("non-existing index should place empty object with nested array", () => {
      const obj: {
        name: string;
        addresses: {
          streets?: {
            name?: string;
          }[];
        }[];
      } = {
        name: "John Doe",
        addresses: [],
      };
      const updated = updateNestedProperty(obj, "addresses[0].streets[0].name", "Main St");
      expect(updated).toEqual({
        name: "John Doe",
        addresses: [
          {
            streets: [{ name: "Main St" }],
          },
        ],
      });
    });
  });
});
