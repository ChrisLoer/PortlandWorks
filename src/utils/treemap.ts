export interface TreemapNode<T = unknown> {
  id: string;
  name: string;
  value: number;
  data: T;
  children?: TreemapNode<T>[];
  // Layout computed coordinates
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Computes squarified treemap layout using Bruls, Huizing, and van Wijk algorithm.
 */
export function computeTreemap<T>(
  root: TreemapNode<T>,
  width: number,
  height: number,
  padding: number = 2
): TreemapNode<T>[] {
  if (!root.children || root.children.length === 0) {
    return [];
  }

  // Filter out non-positive values and sort descending
  const items = root.children
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  if (totalValue <= 0 || width <= 0 || height <= 0) {
    return [];
  }

  const rect: Rect = { x: 0, y: 0, width, height };
  const layoutNodes: TreemapNode<T>[] = [];

  squarify(items, [], rect, totalValue, layoutNodes, padding);

  return layoutNodes;
}

function squarify<T>(
  children: TreemapNode<T>[],
  currentRow: TreemapNode<T>[],
  rect: Rect,
  totalArea: number,
  outNodes: TreemapNode<T>[],
  padding: number
) {
  if (children.length === 0) {
    layoutRow(currentRow, rect, totalArea, outNodes, padding);
    return;
  }

  const nextItem = children[0];
  const shorterSide = Math.min(rect.width, rect.height);

  if (currentRow.length === 0) {
    squarify(children.slice(1), [nextItem], rect, totalArea, outNodes, padding);
    return;
  }

  const currentWorst = worstAspectRatio(currentRow, shorterSide, totalArea, rect);
  const nextWorst = worstAspectRatio([...currentRow, nextItem], shorterSide, totalArea, rect);

  if (nextWorst <= currentWorst) {
    squarify(children.slice(1), [...currentRow, nextItem], rect, totalArea, outNodes, padding);
  } else {
    const newRect = layoutRow(currentRow, rect, totalArea, outNodes, padding);
    const remainingArea = totalArea - currentRow.reduce((sum, item) => sum + item.value, 0);
    squarify(children, [], newRect, remainingArea, outNodes, padding);
  }
}

function worstAspectRatio<T>(
  row: TreemapNode<T>[],
  sideLength: number,
  totalArea: number,
  rect: Rect
): number {
  if (row.length === 0 || sideLength <= 0) return Infinity;

  const totalRectArea = rect.width * rect.height;
  const rowValueSum = row.reduce((sum, item) => sum + item.value, 0);
  const rowArea = (rowValueSum / totalArea) * totalRectArea;
  const rowBreadth = rowArea / sideLength;

  if (rowBreadth <= 0) return Infinity;

  let worst = 1;
  for (const item of row) {
    const itemArea = (item.value / totalArea) * totalRectArea;
    const itemLength = itemArea / rowBreadth;
    const aspect = Math.max(rowBreadth / itemLength, itemLength / rowBreadth);
    if (aspect > worst) worst = aspect;
  }

  return worst;
}

function layoutRow<T>(
  row: TreemapNode<T>[],
  rect: Rect,
  totalArea: number,
  outNodes: TreemapNode<T>[],
  padding: number
): Rect {
  const totalRectArea = rect.width * rect.height;
  const rowValueSum = row.reduce((sum, item) => sum + item.value, 0);
  const rowArea = (rowValueSum / totalArea) * totalRectArea;

  const isHorizontal = rect.width >= rect.height;

  if (isHorizontal) {
    // Cut a vertical slice
    const sliceWidth = rowArea / rect.height;
    let currentY = rect.y;

    for (const item of row) {
      const itemArea = (item.value / totalArea) * totalRectArea;
      const itemHeight = itemArea / sliceWidth;

      outNodes.push({
        ...item,
        x: rect.x + padding,
        y: currentY + padding,
        width: Math.max(0, sliceWidth - padding * 2),
        height: Math.max(0, itemHeight - padding * 2),
      });

      currentY += itemHeight;
    }

    return {
      x: rect.x + sliceWidth,
      y: rect.y,
      width: Math.max(0, rect.width - sliceWidth),
      height: rect.height,
    };
  } else {
    // Cut a horizontal slice
    const sliceHeight = rowArea / rect.width;
    let currentX = rect.x;

    for (const item of row) {
      const itemArea = (item.value / totalArea) * totalRectArea;
      const itemWidth = itemArea / sliceHeight;

      outNodes.push({
        ...item,
        x: currentX + padding,
        y: rect.y + padding,
        width: Math.max(0, itemWidth - padding * 2),
        height: Math.max(0, sliceHeight - padding * 2),
      });

      currentX += itemWidth;
    }

    return {
      x: rect.x,
      y: rect.y + sliceHeight,
      width: rect.width,
      height: Math.max(0, rect.height - sliceHeight),
    };
  }
}
