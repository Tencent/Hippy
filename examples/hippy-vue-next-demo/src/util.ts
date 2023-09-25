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
