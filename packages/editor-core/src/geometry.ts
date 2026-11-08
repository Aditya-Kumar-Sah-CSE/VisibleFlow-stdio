export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  distance: number;
  matches: string[];
}

export function snapToGrid(value: number, gridSize = 20): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(point: Point, gridSize = 20): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}

export function snapAngle(angle: number, threshold = 5): number {
  const normalized = ((angle % 360) + 360) % 360;
  const commonAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];

  for (const target of commonAngles) {
    if (Math.abs(normalized - target) <= threshold) {
      return target === 360 ? 0 : target;
    }
  }
  return angle;
}

export function getBoundingBox(elements: BoundingBox[]): BoundingBox | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function findAlignmentGuides(
  target: BoundingBox,
  others: (BoundingBox & { id: string })[],
  threshold = 6
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];

  const targetCenterX = target.x + target.width / 2;
  const targetRight = target.x + target.width;
  const targetCenterY = target.y + target.height / 2;
  const targetBottom = target.y + target.height;

  for (const other of others) {
    const otherCenterX = other.x + other.width / 2;
    const otherRight = other.x + other.width;
    const otherCenterY = other.y + other.height / 2;
    const otherBottom = other.y + other.height;

    // Vertical guides (X-axis alignment)
    if (Math.abs(target.x - other.x) <= threshold) {
      guides.push({ type: 'vertical', position: other.x, distance: Math.abs(target.x - other.x), matches: [other.id] });
    }
    if (Math.abs(targetCenterX - otherCenterX) <= threshold) {
      guides.push({ type: 'vertical', position: otherCenterX, distance: Math.abs(targetCenterX - otherCenterX), matches: [other.id] });
    }
    if (Math.abs(targetRight - otherRight) <= threshold) {
      guides.push({ type: 'vertical', position: otherRight, distance: Math.abs(targetRight - otherRight), matches: [other.id] });
    }

    // Horizontal guides (Y-axis alignment)
    if (Math.abs(target.y - other.y) <= threshold) {
      guides.push({ type: 'horizontal', position: other.y, distance: Math.abs(target.y - other.y), matches: [other.id] });
    }
    if (Math.abs(targetCenterY - otherCenterY) <= threshold) {
      guides.push({ type: 'horizontal', position: otherCenterY, distance: Math.abs(targetCenterY - otherCenterY), matches: [other.id] });
    }
    if (Math.abs(targetBottom - otherBottom) <= threshold) {
      guides.push({ type: 'horizontal', position: otherBottom, distance: Math.abs(targetBottom - otherBottom), matches: [other.id] });
    }
  }

  return guides;
}

