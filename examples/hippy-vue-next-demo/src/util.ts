let globalProps: NeedToTyped;

/**
 * Save hippy global initialization parameters
 *
 * @param props - superProps
 */
export function setGlobalInitProps(props: NeedToTyped): void {
  globalProps = props;
}

/**
 * Get hippy global initialization parameters
 */
export function getGlobalInitProps(): NeedToTyped {
  return globalProps;
}

/**
 * output debugging warnings
 *
 * @param context - output content
 */
export function warn(...context: NeedToTyped[]): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(...context);
}

// regular expression of number
const numberRegEx = new RegExp('^(?=.+)[+-]?\\d*\\.?\\d*([Ee][+-]?\\d+)?$');

/**
 * convert string to number
 *
 * @param str - target string
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
