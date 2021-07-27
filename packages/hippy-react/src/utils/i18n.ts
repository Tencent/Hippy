import { Platform } from '..';

export function isRTL() {
  return Platform.Localization.direction === 1;
}
