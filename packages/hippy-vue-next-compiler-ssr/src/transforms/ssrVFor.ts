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

import {
  createStructuralDirectiveTransform,
  type ForNode,
  processFor,
  createCallExpression,
  createFunctionExpression,
  createForLoopParams,
  NodeTypes,
} from '@vue/compiler-dom';

import { SSR_RENDER_LIST } from '../runtimeHelpers';
// eslint-disable-next-line import/no-cycle
import {
  type SSRTransformContext,
  processChildrenAsStatement,
} from '../ssrCodegenTransform';

// Plugin for the first transform pass, which simply constructs the AST node
export const ssrTransformFor = createStructuralDirectiveTransform(
  'for',
  processFor,
);

// This is called during the 2nd transform pass to construct the SSR-specific
// codegen nodes.
export function ssrProcessFor(
  node: ForNode,
  context: SSRTransformContext,
  disableNestedFragments = false,
): void {
  const needFragmentWrapper =    !disableNestedFragments
    && (node.children.length !== 1 || node.children[0].type !== NodeTypes.ELEMENT);
  const renderLoop = createFunctionExpression(createForLoopParams(node.parseResult));
  renderLoop.body = processChildrenAsStatement(
    node,
    context,
    needFragmentWrapper,
  );
  // v-for always renders a fragment unless explicitly disabled
  if (!disableNestedFragments) {
    context.pushStringPart('{"id": -1,"name":"comment","props":{"text":"["}},');
  }
  context.pushStatement(createCallExpression(context.helper(SSR_RENDER_LIST), [
    node.source,
    renderLoop,
  ]));
  if (!disableNestedFragments) {
    context.pushStringPart('{"id": -1,"name":"comment","props":{"text":"]"}},');
  }
}
