/**
 * Insertion index for a dragged row, measured against the live rects of the
 * remaining [data-reorder-id] rows (dragged row excluded by the caller).
 * Scanning rects instead of elementFromPoint means the gaps between rows,
 * section headers, and the space past the last row all resolve to a slot:
 * above a row's midpoint inserts before it, past every midpoint appends.
 * For a section header, "before it" is the end of the previous section.
 */
export function findInsertIndex(remainingIds: string[], y: number): number {
  const rects = new Map<string, DOMRect>();
  for (const el of document.querySelectorAll<HTMLElement>("[data-reorder-id]")) {
    const rowId = el.dataset.reorderId;
    if (rowId) rects.set(rowId, el.getBoundingClientRect());
  }

  for (let index = 0; index < remainingIds.length; index++) {
    const rect = rects.get(remainingIds[index]);
    if (rect && y < rect.top + rect.height / 2) return index;
  }
  return remainingIds.length;
}
