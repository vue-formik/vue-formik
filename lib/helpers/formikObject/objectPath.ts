/**
 * Construct a path from an array of segments
 *
 * @param segments - Array of segments. Each segment can be a string or a number
 *
 * @returns A string representing the path constructed from the segments
 *
 * @example
 *
 * constructPath(["a", 0, "b"]) // returns "a[0].b"
 * constructPath(["a", "b", "c"]) // returns "a.b.c"
 */
export const constructPath = (segments: (string|number)[]) => {
  let path = "";
  segments.forEach((segment, index) => {
    path += typeof segment === "number" ? `[${segment}]` : index === 0 ? segment : `.${segment}`;
  });
  return path;
};
