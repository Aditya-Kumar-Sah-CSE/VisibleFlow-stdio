import type { CanvasElement } from '@visualflow/shared-types';

export function bringForward(elements: CanvasElement[], selectedIds: string[]): CanvasElement[] {
  const result = [...elements];
  for (let i = result.length - 2; i >= 0; i--) {
    if (selectedIds.includes(result[i].id) && !selectedIds.includes(result[i + 1].id)) {
      const temp = result[i];
      result[i] = result[i + 1];
      result[i + 1] = temp;
    }
  }
  return updateZIndices(result);
}

export function sendBackward(elements: CanvasElement[], selectedIds: string[]): CanvasElement[] {
  const result = [...elements];
  for (let i = 1; i < result.length; i++) {
    if (selectedIds.includes(result[i].id) && !selectedIds.includes(result[i - 1].id)) {
      const temp = result[i];
      result[i] = result[i - 1];
      result[i - 1] = temp;
    }
  }
  return updateZIndices(result);
}

export function bringToFront(elements: CanvasElement[], selectedIds: string[]): CanvasElement[] {
  const nonSelected = elements.filter(el => !selectedIds.includes(el.id));
  const selected = elements.filter(el => selectedIds.includes(el.id));
  return updateZIndices([...nonSelected, ...selected]);
}

export function sendToBack(elements: CanvasElement[], selectedIds: string[]): CanvasElement[] {
  const nonSelected = elements.filter(el => !selectedIds.includes(el.id));
  const selected = elements.filter(el => selectedIds.includes(el.id));
  return updateZIndices([...selected, ...nonSelected]);
}

export function groupElements(elements: CanvasElement[], selectedIds: string[]): { elements: CanvasElement[]; groupId: string } {
  const groupId = 'group-' + Math.random().toString(36).substring(2, 9);
  const updated = elements.map(el => {
    if (selectedIds.includes(el.id)) {
      return { ...el, groupId };
    }
    return el;
  });
  return { elements: updated, groupId };
}

export function ungroupElements(elements: CanvasElement[], selectedIds: string[]): CanvasElement[] {
  const groupIds = new Set(
    elements.filter(el => selectedIds.includes(el.id) && el.groupId).map(el => el.groupId)
  );
  return elements.map(el => {
    if (el.groupId && groupIds.has(el.groupId)) {
      const { groupId, ...rest } = el;
      return rest as CanvasElement;
    }
    return el;
  });
}

function updateZIndices(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((el, index) => ({
    ...el,
    zIndex: index + 1,
  }));
}

