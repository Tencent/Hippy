import { Device } from '../global';

/**
 * is right to left display
 * @returns {boolean}
 */
export function isRTL() {
  const localization = Device.platform.Localization;
  if (localization) {
    return localization.direction === 1;
  }
  return false;
}
