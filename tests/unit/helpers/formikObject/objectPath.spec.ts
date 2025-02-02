import { describe, test, expect } from "vitest";
import { constructPath } from "@/helpers/formikObject/objectPath";

describe("objectPath", async () => {
  describe("constructPath", async () => {
    test.each([
      {
        segments: ["a", "b", "c"],
        expected: "a.b.c",
      },
      {
        segments: ["a", "b", "c", "d"],
        expected: "a.b.c.d",
      },
      {
        segments: ["a"],
        expected: "a",
      },
      {
        segments: ["a", 0, "b"],
        expected: "a[0].b",
      },
      {
        segments: ["a", 0, "b", 1],
        expected: "a[0].b[1]",
      },
      {
        segments: ["a", 0, "b", 1, "c"],
        expected: "a[0].b[1].c",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2],
        expected: "a[0].b[1].c[2]",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d"],
        expected: "a[0].b[1].c[2].d",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d", 3],
        expected: "a[0].b[1].c[2].d[3]",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d", 3, "e"],
        expected: "a[0].b[1].c[2].d[3].e",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d", 3, "e", 4],
        expected: "a[0].b[1].c[2].d[3].e[4]",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d", 3, "e", 4, "f"],
        expected: "a[0].b[1].c[2].d[3].e[4].f",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d", 3, "e", 4, "f", 5],
        expected: "a[0].b[1].c[2].d[3].e[4].f[5]",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d", 3, "e", 4, "f", 5, "g"],
        expected: "a[0].b[1].c[2].d[3].e[4].f[5].g",
      },
      {
        segments: ["a", 0, "b", 1, "c", 2, "d", 3, "e", 4, "f", 5, "g", 6],
        expected: "a[0].b[1].c[2].d[3].e[4].f[5].g[6]",
      },
      {
        segments: [0, 1, 2, 3],
        expected: "[0][1][2][3]",
      },
      {
        segments: [],
        expected: "",
      },
      {
        segments: [""],
        expected: "",
      }
    ])("should construct path from string", ({ segments, expected}) => {
      expect(constructPath(segments)).toBe(expected);
    });
  })
})
