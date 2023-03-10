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
  findProp,
  NodeTypes,
  createSimpleExpression,
  createFunctionExpression,
  createCallExpression,
  type ExpressionNode,
} from '@vue/compiler-dom';

import { createSSRCompilerError, SSRErrorCodes } from '../errors';
import { SSR_RENDER_TELEPORT } from '../runtimeHelpers';
import {
  type SSRTransformContext,
  processChildrenAsStatement,
} from '../ssrCodegenTransform';

// Note: this is a 2nd-pass codegen transform.
export function ssrProcessTeleport(
  node: ComponentNode,
  context: SSRTransformContext,
): void {
  const targetProp = findProp(node, 'to');
  if (!targetProp) {
    context.onError(createSSRCompilerError(SSRErrorCodes.X_SSR_NO_TELEPORT_TARGET, node.loc));
    return;
  }

  let target: ExpressionNode | undefined;
  if (targetProp.type === NodeTypes.ATTRIBUTE) {
    target =      targetProp.value
      && createSimpleExpression(targetProp.value.content, true);
  } else {
    target = targetProp.exp;
  }
  if (!target) {
    context.onError(createSSRCompilerError(
      SSRErrorCodes.X_SSR_NO_TELEPORT_TARGET,
      targetProp.loc,
    ));
    return;
  }

  const disabledProp = findProp(
    node,
    'disabled',
    false,
    true /* allow empty */,
  );
  // eslint-disable-next-line no-nested-ternary
  const disabled = disabledProp
    ? disabledProp.type === NodeTypes.ATTRIBUTE
      ? 'true'
      : disabledProp.exp ?? 'false'
    : 'false';

  const contentRenderFn = createFunctionExpression(
    ['_push'],
    undefined, // Body is added later
    true, // newline
    false, // isSlot
    node.loc,
  );
  contentRenderFn.body = processChildrenAsStatement(node, context);
  context.pushStatement(createCallExpression(context.helper(SSR_RENDER_TELEPORT), [
    '_push',
    contentRenderFn,
    target,
    disabled,
    '_parent',
  ]));
}
