let globalProps: NeedToTyped;

/**
 * 保存 hippy 全局的初始化参数
 *
 * @param props - 需要设置的全局props属性
 */
export function setGlobalInitProps(props: NeedToTyped): void {
  globalProps = props;
}

/**
 * 返回缓存的全局 props
 */
export function getGlobalInitProps(): NeedToTyped {
  return globalProps;
}

/**
 * 输出调试警告信息
 *
 * @param context - 需要记录的上下文
 */
export function warn(...context: NeedToTyped[]): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // console 输出统一处理
  // eslint-disable-next-line no-console
  console.warn(...context);
}

// 字符串转数字的正则规则
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');

/**
 * 将字符串尽可能转为数字
 *
 * @param str - 待转换的内容
 */
export function tryConvertNumber(str: string | number): string | number {
  if (typeof str === 'number') {
    return str;
  }
  if (numberRegEx.test(str)) {
    try {
      return parseFloat(str);
    } catch (err) {
      // pass
    }
  }
  return str;
}
