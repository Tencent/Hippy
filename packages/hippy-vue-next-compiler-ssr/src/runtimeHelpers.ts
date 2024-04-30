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

import { registerRuntimeHelpers } from '@vue/compiler-dom';

export const SSR_INTERPOLATE = Symbol('ssrInterpolate');
export const SSR_RENDER_VNODE = Symbol('ssrRenderVNode');
export const SSR_RENDER_COMPONENT = Symbol('ssrRenderComponent');
export const SSR_RENDER_SLOT = Symbol('ssrRenderSlot');
export const SSR_RENDER_SLOT_INNER = Symbol('ssrRenderSlotInner');
export const SSR_RENDER_CLASS = Symbol('ssrRenderClass');
export const SSR_RENDER_STYLE = Symbol('ssrRenderStyle');
export const SSR_RENDER_ATTRS = Symbol('ssrRenderAttrs');
export const SSR_RENDER_ATTR = Symbol('ssrRenderAttr');
export const SSR_RENDER_DYNAMIC_ATTR = Symbol('ssrRenderDynamicAttr');
export const SSR_RENDER_LIST = Symbol('ssrRenderList');
export const SSR_INCLUDE_BOOLEAN_ATTR = Symbol('ssrIncludeBooleanAttr');
export const SSR_LOOSE_EQUAL = Symbol('ssrLooseEqual');
export const SSR_LOOSE_CONTAIN = Symbol('ssrLooseContain');
export const SSR_RENDER_DYNAMIC_MODEL = Symbol('ssrRenderDynamicModel');
export const SSR_GET_DYNAMIC_MODEL_PROPS = Symbol('ssrGetDynamicModelProps');
export const SSR_RENDER_TELEPORT = Symbol('ssrRenderTeleport');
export const SSR_RENDER_SUSPENSE = Symbol('ssrRenderSuspense');
export const SSR_GET_DIRECTIVE_PROPS = Symbol('ssrGetDirectiveProps');
// provided by @hippy/vue-next-server-renderer
export const SSR_GET_UNIQUEID = Symbol('ssrGetUniqueId');

export const ssrHelpers = {
  [SSR_INTERPOLATE]: 'ssrInterpolate',
  [SSR_RENDER_VNODE]: 'ssrRenderVNode',
  [SSR_RENDER_COMPONENT]: 'ssrRenderComponent',
  [SSR_RENDER_SLOT]: 'ssrRenderSlot',
  [SSR_RENDER_SLOT_INNER]: 'ssrRenderSlotInner',
  [SSR_RENDER_CLASS]: 'ssrRenderClass',
  [SSR_RENDER_STYLE]: 'ssrRenderStyle',
  [SSR_RENDER_ATTRS]: 'ssrRenderAttrs',
  [SSR_RENDER_ATTR]: 'ssrRenderAttr',
  [SSR_RENDER_DYNAMIC_ATTR]: 'ssrRenderDynamicAttr',
  [SSR_RENDER_LIST]: 'ssrRenderList',
  [SSR_INCLUDE_BOOLEAN_ATTR]: 'ssrIncludeBooleanAttr',
  [SSR_LOOSE_EQUAL]: 'ssrLooseEqual',
  [SSR_LOOSE_CONTAIN]: 'ssrLooseContain',
  [SSR_RENDER_DYNAMIC_MODEL]: 'ssrRenderDynamicModel',
  [SSR_GET_DYNAMIC_MODEL_PROPS]: 'ssrGetDynamicModelProps',
  [SSR_RENDER_TELEPORT]: 'ssrRenderTeleport',
  [SSR_RENDER_SUSPENSE]: 'ssrRenderSuspense',
  [SSR_GET_DIRECTIVE_PROPS]: 'ssrGetDirectiveProps',
  [SSR_GET_UNIQUEID]: 'ssrGetUniqueId',
};

// Note: these are helpers imported from @vue/server-renderer
// make sure the names match!
registerRuntimeHelpers(ssrHelpers);
