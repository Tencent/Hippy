import { type HippyElement } from '@hippy/vue-next';

// 暂不上报的key名称
const notReportKey = 'notReport';

/**
 * 判断上报数据是否需要立即上报
 *
 * @param reportValue - 上报数据，必须是对象，并且有属性值
 */
function needReport(reportValue: { [key: string]: NeedToTyped }): boolean {
  // 目前仅判断是否有内容，待完善
  if (typeof reportValue !== 'object') {
    return false;
  }

  // 如果显式设置了不上报，则暂时先不上报数据
  return !reportValue[notReportKey];
}

/**
 * 更新元素的上报数据属性，由native完成上报
 *
 * @param el - element元素
 * @param reportValue - 上报值
 */
function updateElementReportValue(el: HippyElement, reportValue): void {
  // 将需要上报的数据append到元素的attributes中，native会处理元素的曝光和点击上报
  if (el && reportValue) {
    const keys = Object.keys(reportValue);
    keys.forEach((key) => {
      // 上报开关属性不需要添加到节点上
      if (key !== notReportKey) {
        // 给上报的属性名加上大同前缀
        const dtKey = key.startsWith('dt_') ? key : `dt_${key}`;
        // 更新节点属性
        el.setAttribute(dtKey, reportValue[key]);
      }
    });
  }
}

/**
 * 大同上报处理指令，指令参数默认立即上报，如果不需要立即上报，则在指令参数内显式指定
 * notReport 为 true
 */
export const vReport = {
  /**
   * mounted时，检查上报值是否合法，合法则进行处理，附加到元素属性中
   *
   * @param el - element元素
   * @param value - 指令绑定的上报值
   */
  mounted(el: HippyElement, { value }: NeedToTyped): void {
    // 如果mounted时，需要进行上报，则进行数据上报
    if (needReport(value)) {
      updateElementReportValue(el, value);
    }
  },

  /**
   * 节点更新时，检查上报值是否合法，合法则更新数据
   *
   * @param el - 元素
   * @param value - 上报值
   */
  updated(el: HippyElement, { value }: NeedToTyped): void {
    if (needReport(value)) {
      updateElementReportValue(el, value);
    }
  },
};
