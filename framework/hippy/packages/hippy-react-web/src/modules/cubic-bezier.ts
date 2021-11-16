import bezierEasing from 'bezier-easing';

const CUBIC_BEZIER_PATTERN = /^cubic-bezier\(([^,]*),([^,]*),([^,]*),([^,]*)\)$/;

export function tryMakeCubicBezierEasing(timingFunction: string): bezierEasing.EasingFunction | null {
  const matches = CUBIC_BEZIER_PATTERN.exec(timingFunction.trim());
  if (!matches) return null;
  try {
    const params = matches.slice(1, 5).map(parseFloat) as [number, number, number, number];
    return bezierEasing(...params);
  } catch (e) {
    // ignore
    console.warn(`Invalid cubic-bezier timingFunction: ${timingFunction}`);
    return null;
  }
}
