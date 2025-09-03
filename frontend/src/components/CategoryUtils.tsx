export const categoryMap: Record<string, string> = {
  skulpturer: "Skulptur",
  utställningar: "Utställning",
  performance: "Performance"
};

export const displayCategory = (cat: string) => categoryMap[cat] || cat;