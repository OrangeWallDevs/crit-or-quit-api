const traverseEntries = (entries) => {
  if (Array.isArray(entries)) {
    return entries
      .filter((entry) => typeof entry === "string" || entry.type === "entries")
      .map((entry) =>
        typeof entry === "string" ? entry : traverseEntries(entry.entries)
      )
      .flat();
  }

  return traverseEntries(entries.entries);
};

export const getNormalizedBestiary = (rawBestiary) =>
  rawBestiary.map((monster) => ({
    name: monster.name,
    description: monster.entries ? traverseEntries(monster.entries) : [""],
  }));
