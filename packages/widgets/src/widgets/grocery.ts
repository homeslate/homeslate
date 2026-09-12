export type GroceryItem = {
  id: string;
  text: string;
  checked: boolean;
  aisle?: string;
};

export function visibleGroceryItems(
  items: GroceryItem[],
  options: { hideChecked: boolean; groupByAisle: boolean },
): GroceryItem[] {
  const visible = options.hideChecked ? items.filter((item) => !item.checked) : items;
  if (options.groupByAisle) {
    const groups = new Map<string, GroceryItem[]>();
    for (const item of visible) {
      const key = item.aisle?.trim() ?? "";
      const group = groups.get(key) ?? [];
      group.push(item);
      groups.set(key, group);
    }
    const named = [...groups.keys()]
      .filter((key) => key.length > 0)
      .sort((a, b) => a.localeCompare(b));
    const ordered = [...named, ...([...groups.keys()].includes("") ? [""] : [])];
    return ordered.flatMap((key) => groups.get(key) ?? []);
  }
  return [...visible].sort((a, b) => Number(a.checked) - Number(b.checked));
}

export function clearCheckedGroceryItems(items: GroceryItem[]): GroceryItem[] {
  return items.filter((item) => !item.checked);
}
