import { Native } from '../runtime/native';

import { getHippyCachedInstance } from './instance';

/**
 * 根据屏幕宽度对样式值中的rem值进行转换处理
 *
 * @param styleValue - 待处理的样式值
 */
export function parseRemStyle(styleValue: any): any {
  let value = styleValue;

  // 如果是非 rem 的样式，直接返回，不处理
  if (typeof value !== 'string' || !value.endsWith('rem')) {
    return value;
  }

  // 取出 rem 的数字值
  value = parseFloat(value);

  // 值不合法则返回原值
  if (Number.isNaN(value)) {
    return value;
  }

  // 设计稿基准宽度
  const { ratioBaseWidth } = getHippyCachedInstance();
  // 计算屏幕尺寸和设计稿的比例值
  const { width } = Native.dimensions.screen;
  const ratio = width / ratioBaseWidth;

  // rem处理后的值
  return value * 100 * ratio;
}
