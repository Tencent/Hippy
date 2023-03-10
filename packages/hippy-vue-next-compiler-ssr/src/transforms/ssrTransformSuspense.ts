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

/* eslint-disable import/no-cycle */
import {
  type ComponentNode,
  type TransformContext,
  buildSlots,
  createFunctionExpression,
  type FunctionExpression,
  type TemplateChildNode,
  createCallExpression,
  type SlotsExpression,
} from '@vue/compiler-dom';

import { SSR_RENDER_SUSPENSE } from '../runtimeHelpers';
import {
  type SSRTransformContext,
  processChildrenAsStatement,
} from '../ssrCodegenTransform';

const wipMap = new WeakMap<ComponentNode, WIPEntry>();

// eslint-disable-next-line @typescript-eslint/naming-convention
interface WIPEntry {
  slotsExp: SlotsExpression;
  wipSlots: {
    fn: FunctionExpression;
    children: TemplateChildNode[];
  }[];
}

// phase 1
export function ssrTransformSuspense(
  node: ComponentNode,
  context: TransformContext,
) {
  return (): void => {
    if (node.children.length) {
      const wipEntry: WIPEntry = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        slotsExp: null!, // to be immediately set
        wipSlots: [],
      };
      wipMap.set(node, wipEntry);
      wipEntry.slotsExp = buildSlots(node, context, (_props, children, loc) => {
        const fn = createFunctionExpression(
          [],
          undefined, // no return, assign body later
          true, // newline
          false, // suspense slots are not treated as normal slots
          loc,
        );
        wipEntry.wipSlots.push({
          fn,
          children,
        });
        return fn;
      }).slots;
    }
  };
}

// phase 2
export function ssrProcessSuspense(
  node: ComponentNode,
  context: SSRTransformContext,
): void {
  // complete wip slots with ssr code
  const wipEntry = wipMap.get(node);
  if (!wipEntry) {
    return;
  }
  const { slotsExp, wipSlots } = wipEntry;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < wipSlots.length; i++) {
    const slot = wipSlots[i];
    slot.fn.body = processChildrenAsStatement(slot, context);
  }
  // _push(ssrRenderSuspense(slots))
  context.pushStatement(createCallExpression(context.helper(SSR_RENDER_SUSPENSE), [
    '_push',
    slotsExp,
  ]));
}
