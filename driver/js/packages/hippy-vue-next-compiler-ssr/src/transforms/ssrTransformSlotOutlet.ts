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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-cycle */
import {
  type NodeTransform,
  isSlotOutlet,
  processSlotOutlet,
  createCallExpression,
  type SlotOutletNode,
  createFunctionExpression,
  NodeTypes,
  ElementTypes,
  resolveComponentType,
  TRANSITION,
} from '@vue/compiler-dom';

import { SSR_RENDER_SLOT, SSR_RENDER_SLOT_INNER } from '../runtimeHelpers';
import {
  type SSRTransformContext,
  processChildrenAsStatement,
} from '../ssrCodegenTransform';

// eslint-disable-next-line complexity
export const ssrTransformSlotOutlet: NodeTransform = (node, context) => {
  if (isSlotOutlet(node)) {
    const { slotName, slotProps } = processSlotOutlet(node, context);

    const args = [
      '_ctx.$slots',
      slotName,
      slotProps ?? '{}',
      // fallback content placeholder. will be replaced in the process phase
      'null',
      '_push',
      '_parent',
    ];

    // inject slot scope id if current template uses :slotted
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    if (context.scopeId && context.slotted !== false) {
      args.push(`"${context.scopeId}-s"`);
    }

    let method = SSR_RENDER_SLOT;

    // #3989
    // check if this is a single slot inside a transition wrapper - since
    // transition will unwrap the slot fragment into a single vnode at runtime,
    // we need to avoid rendering the slot as a fragment.
    const { parent } = context;
    if (
      parent
      && parent.type === NodeTypes.ELEMENT
      && parent.tagType === ElementTypes.COMPONENT
      && resolveComponentType(parent, context, true) === TRANSITION
      && parent.children.filter(c => c.type === NodeTypes.ELEMENT).length === 1
    ) {
      method = SSR_RENDER_SLOT_INNER;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      if (!(context.scopeId && context.slotted !== false)) {
        args.push('null');
      }
      args.push('true');
    }

    // eslint-disable-next-line no-param-reassign
    node.ssrCodegenNode = createCallExpression(context.helper(method), args);
  }
};

export function ssrProcessSlotOutlet(
  node: SlotOutletNode,
  context: SSRTransformContext,
): void {
  const renderCall = node.ssrCodegenNode!;

  // has fallback content
  if (node.children.length) {
    const fallbackRenderFn = createFunctionExpression([]);
    fallbackRenderFn.body = processChildrenAsStatement(node, context);
    // _renderSlot(slots, name, props, fallback, ...)
    renderCall.arguments[3] = fallbackRenderFn;
  }

  // Forwarded <slot/>. Merge slot scope ids
  if (context.withSlotScopeId) {
    const slotScopeId = renderCall.arguments[6];
    renderCall.arguments[6] = slotScopeId
      ? `${slotScopeId as string} + _scopeId`
      : '_scopeId';
  }

  context.pushStatement(node.ssrCodegenNode!);
}
