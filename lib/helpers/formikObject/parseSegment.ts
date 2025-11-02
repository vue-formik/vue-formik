const parseSegment = (segment: string): { key: string; indices: number[] } => {
  const parts = segment.split(/[[\]]/g).filter(Boolean);
  if (!parts.length) throw new Error(`Invalid path segment: ${segment}`);

  const key = parts[0]!;
  const indices = parts.slice(1).map((p) => {
    const index = parseInt(p, 10);
    if (isNaN(index)) throw new Error(`Invalid array index: ${p}`);
    if (index < 0) throw new Error(`Negative array index: ${index}`);
    return index;
  });

  return { key, indices };
};

export default parseSegment;
