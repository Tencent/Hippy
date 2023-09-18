/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  isFunction,
  isPromise,
  isString,
  ShapeFlags,
  isArray,
  NOOP,
} from '@vue/shared';

import { getHippyTagName, getHippyNativeViewName } from './native';
import { ssrGetUniqueId } from './renderer';
import type { NeedToTyped } from './index';

const {
  createComponentInstance,
  setCurrentRenderingInstance,
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

const commentNodeStr = '{"id": -1,"name":"comment","props":{"text":""}},';

/**
 * return tag is text or not
 *
 * @param tag - tag name
 */
function isTextTag(tag: string): boolean {
  return ['span', 'p', 'label', 'a'].includes(tag);
}

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
  rawInstance: ComponentInternalInstance,
  slotScopeId?: string,
): SSRBuffer | Promise<SSRBuffer> {
  const comp = rawInstance.type as Component;
  const { getBuffer, push } = createBuffer();
  if (isFunction(comp)) {
    // this is functional component
    const root = renderComponentRoot(rawInstance);
    // #5817 scope ID attrs not falling through if functional component doesn't
    // have props
    if (!(comp as FunctionalComponent).props) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in rawInstance.attrs) {
        if (key.startsWith('data-v-')) {
          (root.props || (root.props = {}))[key] = '';
        }
      }
    }
    renderVNode(push, (rawInstance.subTree = root), rawInstance, slotScopeId);
  } else {
    // pay attention please, our app do not support runtime compile, so we doesn't need ssrCompile logic
    // if (
    //   (!instance.render || instance.render === NOOP)
    //   && !instance.ssrRender
    //   && !comp.ssrRender
    //   && isString(comp.template)
    // ) {
    //   comp.ssrRender = ssrCompile(comp.template, instance);
    // }

    // because some props of ComponentInternalInstance, like ssrRender,scope,setupState, and so on. was set to
    // internal type, so we used here as any to avoid ts type error
    const instance: NeedToTyped = rawInstance as NeedToTyped;
    // perf: enable caching of computed getters during render
    // since there cannot be state mutations during render.
    for (const e of instance.scope.effects) {
      if (e.computed) e.computed._cacheable = true;
    }

    const ssrRender = instance.ssrRender || comp.ssrRender;
    if (ssrRender) {
      // optimized
      // resolve fallthrough attrs
      let attrs = instance.inheritAttrs !== false ? instance.attrs : undefined;
      let hasCloned = false;

      let cur = instance;
      while (true) {
        const { scopeId } = cur.vnode;
        if (scopeId) {
          if (!hasCloned) {
            attrs = { ...attrs };
            hasCloned = true;
          }
          attrs![scopeId] = '';
        }
        const { parent } = cur;
        if (parent?.subTree === cur.vnode) {
          // parent is a non-SSR compiled component and is rendering this
          // component as root. inherit its scopeId if present.
          cur = parent;
        } else {
          break;
        }
      }

      if (slotScopeId) {
        if (!hasCloned) attrs = { ...attrs };
        attrs![slotScopeId.trim()] = '';
      }

      // set current rendering instance for asset resolution
      const prev = setCurrentRenderingInstance(instance);
      try {
        ssrRender(
          instance.proxy,
          push,
          instance,
          attrs,
          // compiler-optimized bindings
          instance.props,
          instance.setupState,
          instance.data,
          instance.ctx,
        );
      } finally {
        setCurrentRenderingInstance(prev);
      }
    } else if (instance.render && instance.render !== NOOP) {
      renderVNode(
        push,
        (instance.subTree = renderComponentRoot(instance)),
        instance,
        slotScopeId,
      );
    } else {
      const componentName = comp.name || comp.__file || '<Anonymous>';
      warn(`Component ${componentName} is missing template or render function.`);
      push(commentNodeStr);
    }
  }
  return getBuffer();
}

/**
 * render vNode
 *
 * @param push - push function
 * @param vnode - vnode
 * @param parentComponent - parent component
 * @param slotScopeId - slot scoped id
 *
 * @public
 */
export function renderVNode(
  push: PushFn,
  vnode: VNode & { slotScopeIds?: string[] },
  parentComponent: ComponentInternalInstance,
  slotScopeId?: string,
): void {
  const { type, shapeFlag, children } = vnode;
  switch (type) {
    case Text:
      // vue text means <div>content</div> content. hippy do not support it. should use
      // <div><span>content</span></div>, all text content should wrap in span/p/label.
      push(`{"id": ${ssrGetUniqueId()},"name":"Text","props":{"text":"${children as string}"}},`);
      break;
    case Static:
      // hippy do not support static hoist
      break;
    case Comment:
      push(children
        ? `{"id": -1,"name":"comment","props":{"text":"${children as string}"}},`
        : commentNodeStr);
      break;
    case Fragment:
      if (vnode?.slotScopeIds) {
        slotScopeId = (slotScopeId ? `${slotScopeId} ` : '') + vnode.slotScopeIds.join(' ');
      }
      // fixme: fragment do not totally test, should fixme later
      push('{"id": -1,"name":"comment","props":{"text":"["}},'); // open
      renderVNodeChildren(
        push,
        children as VNodeArrayChildren,
        parentComponent,
        slotScopeId,
        true,
      );
      push('{"id": -1,"name":"comment","props":{"text":"]"}},'); // close
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        renderElementVNode(push, vnode, parentComponent, slotScopeId);
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        push(renderComponentVNode(vnode, parentComponent, slotScopeId));
      } else if (shapeFlag & ShapeFlags.TELEPORT) {
        // hippy do not support teleport
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
  asFragment = false,
) {
  if (!asFragment) {
    // hippy fragment no need to insert children part
    push('"children":[');
  }
  for (let i = 0; i < children.length; i++) {
    renderVNode(
      push,
      normalizeVNode(children[i]),
      parentComponent,
      slotScopeId,
    );
  }
  if (!asFragment) {
    // hippy fragment no need to insert children part
    push('],');
  }
}

function renderElementVNode(
  push: PushFn,
  vnode: VNode,
  parentComponent: ComponentInternalInstance,
  slotScopeId: string | undefined,
) {
  const tag = vnode.type as string;
  const { children, shapeFlag, dirs } = vnode;
  let openTag = `{"id":${ssrGetUniqueId()},"index":0,"name":"${getHippyNativeViewName(tag)}","tagName":"${getHippyTagName(tag)}","props":`;

  let props = vnode.props ?? {};
  if (dirs) {
    props = applySSRDirectives(vnode, props, dirs);
  }

  // because native tag compiled as custom element, so the native tag doesn't have
  // scopeId(scopeId generated at compiler time)
  // we use the child scopeId or parent scopeId if exist
  let { scopeId } = vnode;
  if (!scopeId && children?.length) {
    scopeId = children[0].scopeId ?? null;
  }
  // use parent scopedId if exist
  if (!scopeId && parentComponent?.vnode) {
    scopeId = parentComponent.vnode.scopeId ?? null;
  }

  if (scopeId && typeof props[scopeId] === 'undefined') {
    // custom element do not generate scopeId, so inserted here
    props[scopeId] = '';
    vnode.scopeId = scopeId;
  }


  // span/label/p/a, these nodes are all text node in native. so we should set text prop
  if (
    isTextTag(tag)
  ) {
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // text node children is array
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
          props.text = child?.children as string;
          // if text child node has scopedId attr, need insert to props
          if (child?.scopeId) {
            props[child.scopeId] = '';
          }
        }
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN && children) {
      // text node children is string
      props.text = children;
    }
  }
  // transform event listener
  Object.keys(props).forEach((key) => {
    // event listener like onClick, onTouchStart is function. hippy just used true to marked.
    // for example: <a @click="()=>{}"></a> to { tagName: "a", onClick: true }
    // real event listener should bind at hydration
    if (isFunction(props[key])) {
      props[key] = true;
    }
  });

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
    teleportContent = '{"id": -1,"name":"comment","props":{"text":"teleport anchor"}},';
  } else {
    const { getBuffer, push } = createBuffer();
    contentRenderFn(push);
    push('{"id": -1,"name":"comment","props":{"text":"teleport anchor"}},');
    teleportContent = getBuffer();
  }

  targetBuffer.splice(bufferIndex, 0, teleportContent);
  parentPush('{"id": -1,"name":"comment","props":{"text":"teleport end"}},');
}
