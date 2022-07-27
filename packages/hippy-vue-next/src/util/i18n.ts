import { Native } from '../runtime/native';

/**
 * 判断是否是从右至左方式的设备
 */
export function isRTL(): boolean {
  const { localization } = Native;
  if (localization) {
    return localization.direction === 1;
  }
  return false;
}
