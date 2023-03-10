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

/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  createStructuralDirectiveTransform,
  processIf,
  type IfNode,
  createIfStatement,
  createBlockStatement,
  createCallExpression,
  type IfBranchNode,
  type BlockStatement,
  NodeTypes,
} from '@vue/compiler-dom';

// eslint-disable-next-line import/no-cycle
import {
  type SSRTransformContext,
  processChildrenAsStatement,
} from '../ssrCodegenTransform';

// Plugin for the first transform pass, which simply constructs the AST node
export const ssrTransformIf = createStructuralDirectiveTransform(
  /^(if|else|else-if)$/,
  processIf,
);

// This is called during the 2nd transform pass to construct the SSR-specific
// codegen nodes.
export function ssrProcessIf(
  node: IfNode,
  context: SSRTransformContext,
  disableNestedFragments = false,
): void {
  const [rootBranch] = node.branches;
  const ifStatement = createIfStatement(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    rootBranch.condition!,
    processIfBranch(rootBranch, context, disableNestedFragments),
  );
  context.pushStatement(ifStatement);

  let currentIf = ifStatement;
  for (let i = 1; i < node.branches.length; i++) {
    const branch = node.branches[i];
    const branchBlockStatement = processIfBranch(
      branch,
      context,
      disableNestedFragments,
    );
    if (branch.condition) {
      // else-if
      // eslint-disable-next-line no-multi-assign
      currentIf = currentIf.alternate = createIfStatement(
        branch.condition,
        branchBlockStatement,
      );
    } else {
      // else
      currentIf.alternate = branchBlockStatement;
    }
  }

  if (!currentIf.alternate) {
    currentIf.alternate = createBlockStatement([
      createCallExpression('_push', [
        '`{"id": -1,"name":"comment","props":{"text":""}},`',
      ]),
    ]);
  }
}

function processIfBranch(
  branch: IfBranchNode,
  context: SSRTransformContext,
  disableNestedFragments = false,
): BlockStatement {
  const { children } = branch;
  const needFragmentWrapper =    !disableNestedFragments
    && (children.length !== 1 || children[0].type !== NodeTypes.ELEMENT)
    // optimize away nested fragments when the only child is a ForNode
    && !(children.length === 1 && children[0].type === NodeTypes.FOR);
  return processChildrenAsStatement(branch, context, needFragmentWrapper);
}
