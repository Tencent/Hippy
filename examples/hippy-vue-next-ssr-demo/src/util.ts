import { Native } from '@hippy/vue-next';
import { useSSRContext } from 'vue';
import { IS_SSR } from './env';

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
 * get screen size
 */
export function getScreenSize(): {
  width: number;
  height: number;
  statusBarHeight: number;
} {
  if (IS_SSR) {
    const ssrContext = useSSRContext();
    if (ssrContext?.context) {
      const { dimensions } = ssrContext.context;
      if (dimensions?.screen) {
        return dimensions.screen;
      }
    }
    return {
      width: 0,
      height: 0,
      statusBarHeight: 0,
    };
  }
  return Native.Dimensions.screen;
}

/**
 * current platform is iOS or not
 */
export function isIOS(): boolean {
  if (IS_SSR) {
    const ssrContext = useSSRContext();
    if (ssrContext?.context) {
      return Boolean(ssrContext.context?.isIOS);
    }
    return false;
  }
  return Native.isIOS();
}
