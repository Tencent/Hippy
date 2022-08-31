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
