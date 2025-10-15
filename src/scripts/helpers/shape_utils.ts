import { Shape } from '../shapes/Shape';
import { BoundingRect } from '../types/general.types';

/**
 * Returns the bounding rect for all the shapes together
 * @param shapes
 * @returns
 */
export function getShapesBoundingRect(...shapes: Shape[]): BoundingRect {
  if (!shapes.length) {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
    };
  }

  const firstShapeRect = shapes[0].getBoundingRect();

  if (shapes.length === 1) {
    return firstShapeRect;
  }

  const rect = shapes.slice(1).reduce((rect: BoundingRect, shape: Shape) => {
    const shapeBoundingRect = shape.getBoundingRect();

    return {
      top: Math.min(rect.top, shapeBoundingRect.top),
      bottom: Math.max(rect.bottom, shapeBoundingRect.bottom),
      left: Math.min(rect.left, shapeBoundingRect.left),
      right: Math.max(rect.right, shapeBoundingRect.right),
      width: 0,
      height: 0,
    };
  }, firstShapeRect);

  Object.assign(rect, {
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  });

  return rect;
}
