
export function filteredFilesBySearch(files: string[], searchQuery?: string): string[] {
  const regex = createSearchRegex(searchQuery);
  return regex
    ? files.filter(file => regex.test(file))
    : files.filter(file => file.includes(searchQuery || "")); // Fallback to substring search
}


function createSearchRegex(searchQuery?: string): RegExp | null {
  if (!searchQuery) return null;
  try {
    return new RegExp(searchQuery, 'i'); // Validate and create regex
  } catch {
    return null; // If regex is invalid, fallback to substring search
  }
}
