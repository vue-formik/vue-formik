export const constructLabel = (label: string, isRequired = false) => {
  return `${label}${isRequired ? " *" : ""}`;
};
