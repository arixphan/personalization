import { DraggingEvent, LayoutEvent } from "../_types";

export const calculateX = (
  clientX: number,
  scrollLeft: number,
  containerLeft: number,
  columnWidth: number
): number => {
  return (
    Math.floor((clientX + scrollLeft - containerLeft) / columnWidth) *
    columnWidth
  );
};

export const getAbsoluteY = (
  mouseY: number,
  containerScrollTop: number
): number => {
  return mouseY + containerScrollTop;
};

export const calculateY = (
  pointerY: number,
  dragState: DraggingEvent,
  gridSize: number,
  existingEvents: LayoutEvent[] = []
): number => {
  const deltaY = pointerY - dragState.startY;
  const gridSteps =
    deltaY > 0 ? Math.floor(deltaY / gridSize) : Math.ceil(deltaY / gridSize);

  let proposedPosition = dragState.origin.y + gridSteps * gridSize;

  if (proposedPosition < gridSize) {
    return 0;
  }

  const [hasOverlap, overlapOffset] = detectEventOverlap(
    existingEvents,
    dragState,
    proposedPosition,
    gridSize
  );

  if (hasOverlap) {
    proposedPosition += overlapOffset;
  }

  return proposedPosition > 0 ? proposedPosition : dragState.y;
};

export const detectEventOverlap = (
  existingEvents: LayoutEvent[],
  dragState: DraggingEvent,
  proposedY: number,
  gridSize: number
): [boolean, number] => {
  let requiredOffset = 0;

  const overlappingEvent = existingEvents.find((event) => {
    if (event.id === dragState.origin.id) return false;

    const eventBottom = event.y + event.height;
    const wouldOverlap =
      proposedY < eventBottom && proposedY + dragState.origin.height > event.y;

    if (!wouldOverlap) return false;

    const overlapDistance = eventBottom - proposedY;
    const isMinorOverlap = overlapDistance < gridSize;

    if (isMinorOverlap) {
      requiredOffset = overlapDistance;
    }

    return isMinorOverlap;
  });

  return [!!overlappingEvent, requiredOffset];
};
