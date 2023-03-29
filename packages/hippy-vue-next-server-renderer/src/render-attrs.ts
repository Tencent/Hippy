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

import { ssrRenderSlotInner } from '@vue/server-renderer';
import { isString, normalizeStyle } from '@vue/shared';
import type { NeedToTyped } from './index';

export type SSRBuffer = SSRBufferItem[] & { hasAsync?: boolean };
export type SSRBufferItem = string | SSRBuffer | Promise<SSRBuffer>;
export type PushFn = (item: SSRBufferItem) => void;
export type Props = Record<string, unknown>;
export type SSRSlots = Record<string, SSRSlot>;
export type SSRSlot = (
  props: Props,
  push: PushFn,
  parentComponent: NeedToTyped,
  scopeId: string | null,
) => void;

/**
 * get hippy ssr style object
 *
 * @param raw - raw style
 *
 * @public
 */
export function ssrRenderStyle(raw: unknown): string {
  if (!raw) {
    return '{}';
  }
  if (isString(raw)) {
    // hippy doesn't support string style
    return '{}';
  }

  return JSON.stringify(normalizeStyle(raw) ?? {});
}

/**
 * get hippy ssr directive props
 *
 * @public
 */
export function ssrGetDirectiveProps(): unknown {
  return {};
}

/**
 * render ssr slot.
 * because template-compiled slots are always rendered as fragments, the vue/server-renderer wrap
 * fragment content in html comment. like \<!--[--\>\{content\}\<!--]--\>. but hippy didn't recognize.
 * so we use hippy comment node to replace it.
 *
 * @param slots - slot list
 * @param slotName - slot name
 * @param slotProps - slot props
 * @param fallbackRenderFn - fallback render function
 * @param push - push function
 * @param parentComponent - parent component
 * @param slotScopeId - slot scope id
 *
 * @public
 */
export function ssrRenderSlot(
  slots: SSRSlots,
  slotName: string,
  slotProps: Props,
  fallbackRenderFn: (() => void) | null,
  push: PushFn,
  parentComponent: NeedToTyped,
  slotScopeId?: string,
): void {
  // template-compiled slots are always rendered as fragments
  push('{"id": -1,"name":"comment","props":{"text":"["}},');
  ssrRenderSlotInner(
    slots,
    slotName,
    slotProps,
    fallbackRenderFn,
    push,
    parentComponent,
    slotScopeId,
  );
  push('{"id": -1,"name":"comment","props":{"text":"]"}},');
}
