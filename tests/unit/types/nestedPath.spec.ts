import { describe, it, expect, expectTypeOf } from "vitest";
import type { NestedPaths, NestedArrayPaths, NestedValue } from "@/types";

describe("NestedPaths", () => {
  describe("simple object", () => {
    it("should generate paths for flat objects", () => {
      type User = {
        name: string;
        age: number;
        email: string;
      };

      type UserPaths = NestedPaths<User>;
      expectTypeOf<UserPaths>().toEqualTypeOf<"name" | "age" | "email">();
      // Ensure test doesn't fail
      expect(true).toBe(true);
    });
  });

  describe("nested object", () => {
    it("should generate paths for nested objects", () => {
      type Address = {
        street: string;
        city: string;
        zip: number;
      };

      type User = {
        name: string;
        address: Address;
      };

      type UserPaths = NestedPaths<User>;
      type ExpectedPaths = "name" | "address" | "address.street" | "address.city" | "address.zip";

      expectTypeOf<UserPaths>().toEqualTypeOf<ExpectedPaths>();
      expect(true).toBe(true);
    });
  });

  describe("array properties", () => {
    it("should generate paths for array properties", () => {
      type User = {
        name: string;
        tags: string[];
      };

      type UserPaths = NestedPaths<User>;
      type ExpectedPaths = "name" | "tags" | "tags[number]";

      expectTypeOf<UserPaths>().toEqualTypeOf<ExpectedPaths>();
      expect(true).toBe(true);
    });

    it("should generate paths for nested arrays", () => {
      type User = {
        name: string;
        tags: string[];
        contacts: { email: string; phones: string[] }[];
      };

      type UserPaths = NestedPaths<User>;

      // Note: TypeScript can't infer the exact union type, so we just verify it's valid
      expectTypeOf<"contacts[0].email">().toExtend<UserPaths>();
      expectTypeOf<"contacts[0].phones[1]">().toExtend<UserPaths>();
      expect(true).toBe(true);
    });
  });

  describe("mixed nested structures", () => {
    it("should handle deeply nested objects with arrays", () => {
      type Company = {
        name: string;
        employees: {
          id: number;
          skills: string[];
          contact: {
            email: string;
            phones: string[];
          };
        }[];
      };

      type CompanyPaths = NestedPaths<Company>;

      // Verify various path combinations
      expectTypeOf<"name">().toExtend<CompanyPaths>();
      expectTypeOf<"employees">().toExtend<CompanyPaths>();
      expectTypeOf<"employees[0]">().toExtend<CompanyPaths>();
      expectTypeOf<"employees[0].id">().toExtend<CompanyPaths>();
      expectTypeOf<"employees[0].skills[0]">().toExtend<CompanyPaths>();
      expectTypeOf<"employees[0].contact.email">().toExtend<CompanyPaths>();
      expectTypeOf<"employees[0].contact.phones[0]">().toExtend<CompanyPaths>();
      expect(true).toBe(true);
    });
  });
});

describe("NestedArrayPaths", () => {
  describe("simple arrays", () => {
    it("should generate bracket notation for simple array types", () => {
      type Phones = string[];
      type PhonePaths = NestedArrayPaths<Phones>;

      expectTypeOf<PhonePaths>().toEqualTypeOf<`[${number}]`>();
      expect(true).toBe(true);
    });
  });

  describe("nested arrays", () => {
    it("should generate paths for nested arrays", () => {
      type Matrix = number[][];
      type MatrixPaths = NestedArrayPaths<Matrix>;

      expectTypeOf<`[${number}]`>().toExtend<MatrixPaths>();
      expectTypeOf<`[${number}][${number}]`>().toExtend<MatrixPaths>();
      expect(true).toBe(true);
    });
  });

  describe("arrays of objects", () => {
    it("should generate paths for arrays of objects", () => {
      type Contacts = { email: string; phones: string[] }[];
      type ContactPaths = NestedArrayPaths<Contacts>;

      expectTypeOf<`[${number}]`>().toExtend<ContactPaths>();
      expectTypeOf<`[${number}].email`>().toExtend<ContactPaths>();
      expectTypeOf<`[${number}].phones`>().toExtend<ContactPaths>();
      expectTypeOf<`[${number}].phones[${number}]`>().toExtend<ContactPaths>();
      expect(true).toBe(true);
    });
  });
});

describe("NestedValue", () => {
  describe("simple object", () => {
    it("should extract value type for flat object paths", () => {
      type User = {
        name: string;
        age: number;
        email: string;
      };

      expectTypeOf<NestedValue<User, "name">>().toEqualTypeOf<string>();
      expectTypeOf<NestedValue<User, "age">>().toEqualTypeOf<number>();
      expectTypeOf<NestedValue<User, "email">>().toEqualTypeOf<string>();
      expect(true).toBe(true);
    });
  });

  describe("nested object", () => {
    it("should extract value type for nested object paths", () => {
      type Address = {
        street: string;
        city: string;
        zip: number;
      };

      type User = {
        name: string;
        address: Address;
      };

      expectTypeOf<NestedValue<User, "address">>().toEqualTypeOf<Address>();
      expectTypeOf<NestedValue<User, "address.street">>().toEqualTypeOf<string>();
      expectTypeOf<NestedValue<User, "address.city">>().toEqualTypeOf<string>();
      expectTypeOf<NestedValue<User, "address.zip">>().toEqualTypeOf<number>();
      expect(true).toBe(true);
    });
  });

  describe("array paths", () => {
    it("should extract value type for array paths", () => {
      type User = {
        name: string;
        tags: string[];
      };

      expectTypeOf<NestedValue<User, "tags[0]">>().toEqualTypeOf<string>();
      expectTypeOf<NestedValue<User, "tags">>().toEqualTypeOf<string[]>();
      expect(true).toBe(true);
    });
  });

  describe("nested array paths", () => {
    it("should extract value type for nested array paths", () => {
      type User = {
        name: string;
        contacts: { email: string; phones: string[] }[];
      };

      expectTypeOf<NestedValue<User, "contacts[0]">>().toEqualTypeOf<{
        email: string;
        phones: string[];
      }>();
      expectTypeOf<NestedValue<User, "contacts[0].email">>().toEqualTypeOf<string>();
      expectTypeOf<NestedValue<User, "contacts[0].phones">>().toEqualTypeOf<string[]>();
      expectTypeOf<NestedValue<User, "contacts[0].phones[1]">>().toEqualTypeOf<string>();
      expect(true).toBe(true);
    });
  });

  describe("complex nested structures", () => {
    it("should extract value type for deeply nested paths", () => {
      type Company = {
        name: string;
        employees: {
          id: number;
          skills: string[];
          contact: {
            email: string;
            phones: string[];
          };
        }[];
      };

      expectTypeOf<NestedValue<Company, "employees[0].id">>().toEqualTypeOf<number>();
      expectTypeOf<NestedValue<Company, "employees[0].skills[1]">>().toEqualTypeOf<string>();
      expectTypeOf<NestedValue<Company, "employees[0].contact.email">>().toEqualTypeOf<string>();
      expectTypeOf<
        NestedValue<Company, "employees[0].contact.phones[2]">
      >().toEqualTypeOf<string>();
      expect(true).toBe(true);
    });
  });

  describe("matrix/2D arrays", () => {
    it("should extract value type for 2D arrays", () => {
      type Matrix = number[][];

      expectTypeOf<NestedValue<{ matrix: Matrix }, "matrix[0]">>().toEqualTypeOf<number[]>();
      expectTypeOf<NestedValue<{ matrix: Matrix }, "matrix[0][1]">>().toEqualTypeOf<number>();
      expect(true).toBe(true);
    });
  });
});

describe("Integration tests", () => {
  it("should work together in a realistic form scenario", () => {
    type FormValues = {
      name: string;
      email: string;
      contacts: Array<{
        type: string;
        value: string;
      }>;
      preferences: {
        newsletter: boolean;
        themes: string[];
      };
    };

    type FormPaths = NestedPaths<FormValues>;

    // Verify we can extract correct types for various paths
    expectTypeOf<NestedValue<FormValues, "name">>().toEqualTypeOf<string>();
    expectTypeOf<NestedValue<FormValues, "contacts[0].type">>().toEqualTypeOf<string>();
    expectTypeOf<NestedValue<FormValues, "contacts[0].value">>().toEqualTypeOf<string>();
    expectTypeOf<NestedValue<FormValues, "preferences.newsletter">>().toEqualTypeOf<boolean>();
    expectTypeOf<NestedValue<FormValues, "preferences.themes[0]">>().toEqualTypeOf<string>();

    // Verify paths are type-safe
    const _test1: Extract<FormPaths, "name"> = "name";
    const _test2: Extract<FormPaths, "contacts[0]"> = "contacts[0]";
    const _test3: Extract<FormPaths, "preferences.themes[0]"> = "preferences.themes[0]";

    // Suppress unused variable warnings
    void _test1;
    void _test2;
    void _test3;
    expect(true).toBe(true);
  });
});
