import Native from '../runtime/native';

/**
 * is right to left display
 * @returns {boolean}
 */
export function isRTL() {
  const localization = Native.Localization;
  if (localization) {
    return localization.direction === 1;
  }
  return false;
}
