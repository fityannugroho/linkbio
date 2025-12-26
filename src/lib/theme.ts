const DEFAULT_GRADIENT = {
  direction: "to bottom",
  from: "#18181b",
  to: "#09090b",
};

export const parseBackground = (value: string) => {
  const trimmed = value?.trim() || "";
  if (trimmed.startsWith("linear-gradient")) {
    const match = trimmed.match(
      /linear-gradient\(([^,]+),\s*([^,]+),\s*([^)]+)\)/i,
    );
    if (match) {
      return {
        type: "gradient" as const,
        direction: match[1].trim(),
        from: match[2].trim(),
        to: match[3].trim(),
        solid: DEFAULT_GRADIENT.from,
      };
    }
    return {
      type: "gradient" as const,
      direction: DEFAULT_GRADIENT.direction,
      from: DEFAULT_GRADIENT.from,
      to: DEFAULT_GRADIENT.to,
      solid: DEFAULT_GRADIENT.from,
    };
  }

  return {
    type: "solid" as const,
    direction: DEFAULT_GRADIENT.direction,
    from: DEFAULT_GRADIENT.from,
    to: DEFAULT_GRADIENT.to,
    solid: trimmed.startsWith("#") ? trimmed : DEFAULT_GRADIENT.from,
  };
};
