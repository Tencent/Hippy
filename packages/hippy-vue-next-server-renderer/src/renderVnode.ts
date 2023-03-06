/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable complexity */
import {
  Comment,
  type Component,
  type ComponentInternalInstance,
  type DirectiveBinding,
  Fragment,
  type FunctionalComponent,
  mergeProps,
  ssrContextKey,
  Static,
  Text,
  type VNode,
  type VNodeArrayChildren,
  type VNodeProps,
  warn,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ssrUtils,
} from '@vue/runtime-core';
import {
  escapeHtml,
  escapeHtmlComment,
  isFunction,
  isPromise,
  isString,
  ShapeFlags,
  isArray,
  NOOP,
} from '@vue/shared';

import { getHippyTagName } from './native';
import { ssrGetUniqueId } from './renderer';
import type { NeedToTyped } from './index';

const {
  createComponentInstance,
  setupComponent,
  renderComponentRoot,
  normalizeVNode,
} = ssrUtils;

export type SSRBuffer = SSRBufferItem[] & { hasAsync?: boolean };
export type SSRBufferItem = string | SSRBuffer | Promise<SSRBuffer>;
export type PushFn = (item: SSRBufferItem) => void;
export type Props = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SSRContext = {
  [key: string]: NeedToTyped;
  teleports?: Record<string, string>;
  __teleportBuffers?: Record<string, SSRBuffer>;
};

export function createBuffer(): {
  getBuffer: () => SSRBuffer;
  push: (SSRBufferItem) => void;
} {
  let appendable = false;
  const buffer: SSRBuffer = [];
  return {
    getBuffer(): SSRBuffer {
      // Return static buffer and await on items during unroll stage
      return buffer;
    },
    push(item: SSRBufferItem) {
      const isStringItem = isString(item);
      if (appendable && isStringItem) {
        buffer[buffer.length - 1] += item;
      } else {
        buffer.push(item);
      }
      appendable = isStringItem;
      if (isPromise(item) || (isArray(item) && item.hasAsync)) {
        // promise, or child buffer with async, mark as async.
        // this allows skipping unnecessary await ticks during unroll stage
        buffer.hasAsync = true;
      }
    },
  };
}

export function renderComponentVNode(
  vnode: VNode,
  parentComponent: ComponentInternalInstance | null = null,
  slotScopeId?: string,
): SSRBuffer | Promise<SSRBuffer> {
  const instance = createComponentInstance(vnode, parentComponent, null);
  const res = setupComponent(instance, true /* isSSR */);
  const hasAsyncSetup = isPromise(res);
  const prefetches = instance.sp; /* LifecycleHooks.SERVER_PREFETCH */
  if (hasAsyncSetup || prefetches) {
    let p: Promise<unknown> = hasAsyncSetup
      ? (res as Promise<void>)
      : Promise.resolve();
    if (prefetches) {
      p = p
        .then(async () => Promise.all(prefetches.map(prefetch => prefetch.call(instance.proxy))))
        // Note: error display is already done by the wrapped lifecycle hook function.
        .catch(() => {});
    }
    return p.then(() => renderComponentSubTree(instance, slotScopeId));
  }
  return renderComponentSubTree(instance, slotScopeId);
}

function renderComponentSubTree(
  instance: ComponentInternalInstance,
  slotScopeId?: string,
): SSRBuffer | Promise<SSRBuffer> {
  const comp = instance.type as Component;
  const { getBuffer, push } = createBuffer();
  if (isFunction(comp)) {
    const root = renderComponentRoot(instance);
    // #5817 scope ID attrs not falling through if functional component doesn't
    // have props
    if (!(comp as FunctionalComponent).props) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in instance.attrs) {
        if (key.startsWith('data-v-')) {
          (root.props || (root.props = {}))[key] = '';
        }
      }
    }
    renderVNode(push, (instance.subTree = root), instance, slotScopeId);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  } else if (instance.render && instance.render !== NOOP) {
    renderVNode(
      push,
      (instance.subTree = renderComponentRoot(instance)),
      instance,
      slotScopeId,
    );
  } else {
    const componentName = comp.name ?? comp.__file ?? '<Anonymous>';
    warn(`Component ${componentName} is missing template or render function.`);
    push('{"id": -1,"name":"comment","props":{"text":""}},');
  }
  return getBuffer();
}

export function renderVNode(
  push: PushFn,
  vnode: VNode,
  parentComponent: ComponentInternalInstance,
  slotScopeId?: string,
): void {
  const { type, shapeFlag, children } = vnode;
  switch (type) {
    case Text:
      // vue text means <div>content</div> content. hippy do not support it. should use
      // <div><span>content</span></div>, all text content should wrap in span/p/label.
      push(`{"id": -1,"name":"Text","props":{"text":"${escapeHtmlComment(children as string)}"}},`);
      break;
    case Static:
      break;
    case Comment:
      push(children
        ? `{"id": -1,"name":"comment","props":{"text":"${escapeHtmlComment(children as string)}"}},`
        : '{"id": -1,"name":"comment","props":{"text":""}},');
      break;
    case Fragment:
      // if (vnode.slotScopeIds) {
      //   slotScopeId =
      //     (slotScopeId ? slotScopeId + ' ' : '') + vnode.slotScopeIds.join(' ');
      // }
      push('{"id": -1,"name":"comment","props":{"text":"["}},'); // open
      renderVNodeChildren(
        push,
        children as VNodeArrayChildren,
        parentComponent,
        slotScopeId,
      );
      push('{"id": -1,"name":"comment","props":{"text":"]"}},'); // close
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        renderElementVNode(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        push(renderComponentVNode(vnode, parentComponent, slotScopeId));
      } else if (shapeFlag & ShapeFlags.TELEPORT) {
        renderTeleportVNode(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & ShapeFlags.SUSPENSE) {
        // do not support suspense now
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        // renderVNode(push, vnode.ssContent!, parentComponent, slotScopeId);
      } else {
        warn(
          '[@vue/server-renderer] Invalid VNode type:',
          type,
          `(${typeof type})`,
        );
      }
  }
}

function renderVNodeChildren(
  push: PushFn,
  children: VNodeArrayChildren,
  parentComponent: ComponentInternalInstance,
  slotScopeId: string | undefined,
) {
  push('"children":[');
  for (let i = 0; i < children.length; i++) {
    renderVNode(
      push,
      normalizeVNode(children[i]),
      parentComponent,
      slotScopeId,
    );
  }
  push('],');
}

function renderElementVNode(
  push: PushFn,
  vnode: VNode,
  parentComponent: ComponentInternalInstance,
  slotScopeId: string | undefined,
) {
  const tag = vnode.type as string;
  const { children, shapeFlag, dirs } = vnode;
  let openTag = `{"id":${ssrGetUniqueId()},"index":0,"name":"${getHippyTagName(tag)}","tagName":"${tag}","props":`;

  let props = vnode.props ?? {};
  if (dirs) {
    props = applySSRDirectives(vnode, props, dirs);
  }
  // span/label/p, these nodes are all text node in native. so we should set text prop
  if (
    (tag === 'span' || tag === 'p' || tag === 'label')
    && shapeFlag & ShapeFlags.ARRAY_CHILDREN
  ) {
    if (children?.length) {
      const textChild = (children as VNodeArrayChildren).filter((item) => {
        if (typeof item === 'object') {
          // only VNode & VNode Children is Object， other is base type
          const text = item as VNode;
          return text?.shapeFlag & ShapeFlags.TEXT_CHILDREN;
        }
        return false;
      });
      if (textChild.length) {
        const child = textChild[0] as VNode;
        props.text = escapeHtml(child?.children as string);
      }
    }
  }

  openTag += `${JSON.stringify(props)},`;
  push(`${openTag}`);

  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    renderVNodeChildren(
      push,
      children as VNodeArrayChildren,
      parentComponent,
      slotScopeId,
    );
  }

  push('},');
}

function applySSRDirectives(
  vnode: VNode,
  rawProps: VNodeProps | null,
  dirs: DirectiveBinding[],
): VNodeProps {
  const toMerge: VNodeProps[] = [];
  for (let i = 0; i < dirs.length; i++) {
    const binding = dirs[i];
    const {
      dir: { getSSRProps },
    } = binding;
    if (getSSRProps) {
      const props = getSSRProps(binding, vnode);
      if (props) toMerge.push(props);
    }
  }
  return mergeProps(rawProps ?? {}, ...toMerge);
}

function renderTeleportVNode(
  push: PushFn,
  vnode: VNode,
  parentComponent: ComponentInternalInstance,
  slotScopeId: string | undefined,
): void {
  const target = vnode.props?.to;
  const disabled = vnode.props?.disabled;
  if (!target) {
    if (!disabled) {
      warn('[@vue/server-renderer] Teleport is missing target prop.');
    }
  }
  if (!isString(target)) {
    warn('[@vue/server-renderer] Teleport target must be a query selector string.');
  }
  ssrRenderTeleport(
    push,
    (_push: PushFn) => {
      renderVNodeChildren(
        _push,
        vnode.children as VNodeArrayChildren,
        parentComponent,
        slotScopeId,
      );
    },
    target,
    disabled || disabled === '',
    parentComponent,
  );
}

export function ssrRenderTeleport(
  parentPush: PushFn,
  contentRenderFn: (push: PushFn) => void,
  target: string,
  disabled: boolean,
  parentComponent: ComponentInternalInstance,
): void {
  parentPush('{"id": -1,"name":"comment","props":{"text":"teleport start"}},');

  const context = parentComponent.appContext.provides[
    ssrContextKey as NeedToTyped
  ] as SSRContext;
  const teleportBuffers =    context.__teleportBuffers ?? (context.__teleportBuffers = {});
  const targetBuffer =    teleportBuffers[target] || (teleportBuffers[target] = []);
  // record current index of the target buffer to handle nested teleports
  // since the parent needs to be rendered before the child
  const bufferIndex = targetBuffer.length;

  let teleportContent: SSRBufferItem;

  if (disabled) {
    contentRenderFn(parentPush);
    teleportContent =      '{"id": -1,"name":"comment","props":{"text":"teleport anchor"}},';
  } else {
    const { getBuffer, push } = createBuffer();
    contentRenderFn(push);
    push('{"id": -1,"name":"comment","props":{"text":"teleport anchor"}},');
    teleportContent = getBuffer();
  }

  targetBuffer.splice(bufferIndex, 0, teleportContent);
  parentPush('{"id": -1,"name":"comment","props":{"text":"teleport end"}},');
}
