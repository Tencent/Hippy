/**
 * hippy vue next server renderer type，export main method from vue/server-renderer, and modify some api with hippy
 */

/**
 * @public
 */
type NeedToTyped = any;

/**
 * @public
 */
type CallbackType = Function;

/**
 * @public
 */
interface CommonMapParams {
  [key: string]: NeedToTyped;
}

// global type
export {
  NeedToTyped,
  CallbackType,
  CommonMapParams,
};

/**
 * SSR common type
 *
 * @public
 */
export interface SsrCommonParams {
  // props perhaps have any type, include string，number，boolean，object，function，array. etc
  [key: string]: NeedToTyped;
}

/**
 * SSR Node props type
 *
 * @public
 */
export type SsrNodeProps = SsrCommonParams;

/**
 * SSR Node type
 *
 * @public
 */
export interface SsrNode {
  id: number;
  pId?: number;
  index: number;
  name: string;
  props: SsrNodeProps;
  tagName?: string;
  children?: SsrNode[];
}

export {
  ssrGetUniqueId,
  renderToHippyList,
  getCurrentUniqueId,
} from './renderer';
export {
  ssrRenderStyle,
  ssrGetDirectiveProps,
  ssrRenderSlot,
} from './renderAttrs';

export {
  ssrRenderTeleport,
  ssrRenderSuspense,
  ssrRenderList,
  pipeToWebWritable,
  renderToNodeStream,
  renderToSimpleStream,
  renderToString,
  renderToWebStream,
  ssrGetDynamicModelProps,
  ssrInterpolate,
  ssrLooseContain,
  ssrLooseEqual,
  ssrRenderAttr,
  ssrRenderAttrs,
  ssrRenderClass,
  ssrRenderComponent,
  ssrRenderDynamicAttr,
  ssrRenderDynamicModel,
} from '@vue/server-renderer';
export { renderVNode as ssrRenderVNode } from './renderVnode';
